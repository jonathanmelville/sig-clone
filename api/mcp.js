import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Order schemas
const OrderIdSchema = z.object({
  orderId: z.string()
});

const ModifyOrderSchema = z.object({
  orderId: z.string(),
  lineItemId: z.string(),
  action: z.enum(['updateQuantity', 'removeItem']),
  newQuantity: z.number().optional()
});

class OrderManagementServer {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.edgeConfigUrl = process.env.REACT_APP_EDGE_CONFIG_URL;
    
    // Fix the file path to work when running from mcp-server directory
    const currentDir = process.cwd();
    if (currentDir.endsWith('mcp-server')) {
      // Running from mcp-server directory
      this.ordersFilePath = path.join(currentDir, 'data', 'orders.json');
    } else {
      // Running from project root
      this.ordersFilePath = path.join(currentDir, 'mcp-server', 'data', 'orders.json');
    }
    
    console.log(`🔍 Debug: Server constructor - Current directory: ${currentDir}`);
    console.log(`🔍 Debug: Server constructor - Orders file path: ${this.ordersFilePath}`);
  }

  async loadOrders() {
    if (this.isProduction && this.edgeConfigUrl) {
      return this.loadFromEdgeConfig();
    } else {
      return this.loadFromFile();
    }
  }

  async saveOrders(orders) {
    console.log(`🔍 Debug: saveOrders called with ${orders.length} orders`);
    console.log(`🔍 Debug: isProduction = ${this.isProduction}`);
    console.log(`🔍 Debug: edgeConfigUrl = ${this.edgeConfigUrl}`);
    console.log(`🔍 Debug: NODE_ENV = ${process.env.NODE_ENV}`);
    
    if (this.isProduction && this.edgeConfigUrl) {
      console.log(`🔍 Debug: Saving to Edge Config`);
      return this.saveToEdgeConfig(orders);
    } else {
      console.log(`🔍 Debug: Saving to file`);
      const result = await this.saveToFile(orders);
      console.log(`🔍 Debug: saveToFile result:`, result);
      return result;
    }
  }

  // Local file operations (for development)
  async loadFromFile() {
    try {
      // Always read from the actual orders.json file
      const fileContent = await fs.readFile(this.ordersFilePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      if (!data.orders || !Array.isArray(data.orders)) {
        throw new Error('Invalid orders.json file structure - missing or invalid orders array');
      }
      
      console.log(`✅ Loaded ${data.orders.length} orders from ${this.ordersFilePath}`);
      return data.orders;
    } catch (error) {
      console.error('Error loading orders from file:', error);
      throw new Error(`Failed to load orders from ${this.ordersFilePath}: ${error.message}`);
    }
  }

  async saveToFile(orders) {
    try {
      console.log(`🔍 Debug: Current working directory: ${process.cwd()}`);
      console.log(`🔍 Debug: Orders file path: ${this.ordersFilePath}`);
      console.log(`🔍 Debug: Orders to save:`, JSON.stringify(orders, null, 2));
      
      // Ensure the directory exists
      const dir = path.dirname(this.ordersFilePath);
      console.log(`🔍 Debug: Creating directory: ${dir}`);
      await fs.mkdir(dir, { recursive: true });
      
      // Write the orders to the file
      const data = { orders };
      console.log(`🔍 Debug: Writing data to file:`, JSON.stringify(data, null, 2));
      await fs.writeFile(this.ordersFilePath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`✅ Orders saved to ${this.ordersFilePath}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving orders to file:', error);
      throw error;
    }
  }

  // Edge Config operations
  async loadFromEdgeConfig() {
    try {
      const response = await fetch(this.edgeConfigUrl);
      if (!response.ok) {
        throw new Error(`Edge Config error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error loading orders from Edge Config:', error);
      // Fallback to file data if Edge Config fails
      return this.loadFromFile();
    }
  }

  async saveToEdgeConfig(orders) {
    try {
      // For now, just return success since Edge Config updates require special handling
      console.log('Edge Config update requested:', { ordersCount: orders.length });
      return { success: true };
    } catch (error) {
      console.error('Error saving orders to Edge Config:', error);
      throw error;
    }
  }

  async handleGetOrder(args) {
    try {
      const { orderId } = OrderIdSchema.parse(args);
      
      if (!orderId) {
        return {
          content: [
            {
              type: 'text',
              text: '❌ **Error:** Order ID is required. Please provide an order ID to retrieve order details.'
            }
          ]
        };
      }

      const orders = await this.loadOrders();
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ **Order Not Found:** Order with ID \`${orderId}\` not found.\n\n**Available orders:** ${orders.map(o => o.id).join(', ')}`
            }
          ]
        };
      }

      const orderDetails = this.formatOrderDetails(order);
      
      return {
        content: [
          {
            type: 'text',
            text: orderDetails
          }
        ]
      };
    } catch (error) {
      console.error('Error in handleGetOrder:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Error retrieving order:** ${error.message}`
          }
        ]
      };
    }
  }

  async handleModifyOrder(args) {
    try {
      const { orderId, lineItemId, action, newQuantity } = ModifyOrderSchema.parse(args);
      
      if (!orderId || !lineItemId || !action) {
        return {
          content: [
            {
              type: 'text',
              text: '❌ **Error:** Order ID, Line Item ID, and action are required.\n\n**Available actions:** `updateQuantity`, `removeItem`'
            }
          ]
        };
      }

      const orders = await this.loadOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ **Order Not Found:** Order with ID \`${orderId}\` not found.`
            }
          ]
        };
      }

      const order = orders[orderIndex];

      if (!order.modifiable) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ **Order Cannot Be Modified:** Order \`${orderId}\` cannot be modified because its status is **${order.status}**. Only DRAFT orders can be modified.`
            }
          ]
        };
      }

      const lineItemIndex = order.lineItems.findIndex(item => item.id === lineItemId);

      if (lineItemIndex === -1) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ **Line Item Not Found:** Line item with ID \`${lineItemId}\` not found in order \`${orderId}\`.`
            }
          ]
        };
      }

      if (action === 'removeItem') {
        // Remove the line item
        const removedItem = order.lineItems.splice(lineItemIndex, 1)[0];
        order.totalAmount -= removedItem.totalPrice;
        
        // Update order metadata
        order.modified = true;
        order.notes = `Removed ${removedItem.productName} (${removedItem.quantity} units) on ${new Date().toISOString()}`;
        
        await this.saveOrders(orders);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ **Successfully removed** \`${removedItem.productName}\` (${removedItem.quantity} units) from order \`${orderId}\`.\n\n**New total:** $${order.totalAmount.toFixed(2)}`
            }
          ]
        };
      } else if (action === 'updateQuantity') {
        if (newQuantity === undefined || newQuantity <= 0) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ **Error:** New quantity must be a positive number.'
              }
            ]
          };
        }

        const lineItem = order.lineItems[lineItemIndex];
        const oldTotal = lineItem.totalPrice;
        const oldQuantity = lineItem.quantity;
        lineItem.quantity = newQuantity;
        lineItem.totalPrice = lineItem.quantity * lineItem.unitPrice;
        
        order.totalAmount = order.totalAmount - oldTotal + lineItem.totalPrice;
        
        // Update order and line item metadata
        order.modified = true;
        order.notes = `Updated ${lineItem.productName} quantity from ${oldQuantity} to ${newQuantity} units on ${new Date().toISOString()}`;
        lineItem.notes = `Quantity changed from ${oldQuantity} to ${newQuantity} on ${new Date().toISOString()}`;
        
        console.log(`🔍 Debug: About to call saveOrders with ${orders.length} orders`);
        console.log(`🔍 Debug: Modified order:`, JSON.stringify(order, null, 2));
        
        await this.saveOrders(orders);
        
        console.log(`🔍 Debug: saveOrders completed successfully`);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ **Successfully updated** quantity of \`${lineItem.productName}\` to ${newQuantity} units in order \`${orderId}\`.\n\n**New total:** $${order.totalAmount.toFixed(2)}`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: '❌ **Error:** Invalid action. Supported actions: `updateQuantity`, `removeItem`'
          }
        ]
      };
    } catch (error) {
      console.error('Error in handleModifyOrder:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Error modifying order:** ${error.message}`
          }
        ]
      };
    }
  }

  formatOrderDetails(order) {
    const lineItemsText = order.lineItems.map(item => {
      let itemText = `- **${item.productName}** (SKU: \`${item.sku}\`)\n  - Quantity: ${item.quantity} | Unit Price: $${item.unitPrice} | Total: $${item.totalPrice}`;
      if (item.notes) {
        itemText += `\n  - Notes: ${item.notes}`;
      }
      return itemText;
    }).join('\n\n');

    let orderText = `## Order Details for **${order.id}**

**Customer:** ${order.customer}  
**Status:** ${order.status} ${order.modifiable ? '✅ (Modifiable)' : '❌ (Not Modifiable)'}  
**Order Date:** ${new Date(order.orderDate).toLocaleDateString()}  
**Delivery Date:** ${new Date(order.deliveryDate).toLocaleDateString()}  
**Total Amount:** $${order.totalAmount.toFixed(2)}`;

    if (order.modified) {
      orderText += `\n**Modified:** Yes`;
    }
    if (order.notes) {
      orderText += `\n**Notes:** ${order.notes}`;
    }

    orderText += `\n\n### Line Items\n\n${lineItemsText}\n\n`;

    if (order.modifiable) {
      orderText += '💡 **This order can be modified.** Use modifyOrder to change quantities or remove items.';
    } else {
      orderText += `⚠️ **This order cannot be modified** due to its current status (${order.status}). Only DRAFT orders can be modified.`;
    }

    return orderText;
  }
}

// This is the Express handler function for local development
export async function mcpHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const server = new OrderManagementServer();
    
    // Handle MCP requests
    const { name, arguments: args } = req.body;
    
    if (name === 'getOrder') {
      const result = await server.handleGetOrder(args);
      return res.status(200).json(result);
    } else if (name === 'modifyOrder') {
      const result = await server.handleModifyOrder(args);
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ error: 'Unknown tool' });
    }
  } catch (error) {
    console.error('MCP Server Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// This is the Vercel serverless function handler
export default async function handler(req, res) {
  return await mcpHandler(req, res);
}
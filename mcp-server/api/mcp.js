import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Order schemas
const OrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  customer: z.string(),
  orderDate: z.string(),
  deliveryDate: z.string(),
  totalAmount: z.number(),
  modifiable: z.boolean(),
  lineItems: z.array(z.object({
    id: z.string(),
    productName: z.string(),
    sku: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number()
  }))
});

const ModifyOrderSchema = z.object({
  orderId: z.string(),
  lineItemId: z.string(),
  action: z.enum(['updateQuantity', 'removeItem']),
  newQuantity: z.number().optional()
});

class OrderManagementServer {
  constructor() {
    this.server = new Server(
      {
        name: 'signal-order-management',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  setupTools() {
    // Tool: getOrder
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'getOrder') {
        return this.handleGetOrder(args);
      } else if (name === 'modifyOrder') {
        return this.handleModifyOrder(args);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async handleGetOrder(args) {
    try {
      const { orderId } = args;
      
      if (!orderId) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Order ID is required. Please provide an order ID to retrieve order details.'
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
              text: `Order with ID ${orderId} not found. Available orders: ${orders.map(o => o.id).join(', ')}`
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
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving order: ${error.message}`
          }
        ]
      };
    }
  }

  async handleModifyOrder(args) {
    try {
      const { orderId, lineItemId, action, newQuantity } = args;
      
      if (!orderId || !lineItemId || !action) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Order ID, Line Item ID, and action are required. Actions: updateQuantity, removeItem'
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
              text: `Order with ID ${orderId} not found.`
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
              text: `Order ${orderId} cannot be modified because its status is ${order.status}. Only orders with modifiable status can be changed.`
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
              text: `Line item with ID ${lineItemId} not found in order ${orderId}.`
            }
          ]
        };
      }

      if (action === 'removeItem') {
        // Remove the line item
        const removedItem = order.lineItems.splice(lineItemIndex, 1)[0];
        order.totalAmount -= removedItem.totalPrice;
        
        await this.saveOrders(orders);
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully removed ${removedItem.productName} (${removedItem.quantity} units) from order ${orderId}. New total: $${order.totalAmount.toFixed(2)}`
            }
          ]
        };
      } else if (action === 'updateQuantity') {
        if (newQuantity === undefined || newQuantity <= 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: New quantity must be a positive number.'
              }
            ]
          };
        }

        const lineItem = order.lineItems[lineItemIndex];
        const oldTotal = lineItem.totalPrice;
        lineItem.quantity = newQuantity;
        lineItem.totalPrice = lineItem.quantity * lineItem.unitPrice;
        
        order.totalAmount = order.totalAmount - oldTotal + lineItem.totalPrice;
        
        await this.saveOrders(orders);
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully updated quantity of ${lineItem.productName} to ${newQuantity} units in order ${orderId}. New total: $${order.totalAmount.toFixed(2)}`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: 'Error: Invalid action. Supported actions: updateQuantity, removeItem'
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error modifying order: ${error.message}`
          }
        ]
      };
    }
  }

  formatOrderDetails(order) {
    const lineItemsText = order.lineItems.map(item => 
      `  - ${item.productName} (SKU: ${item.sku})\n    Quantity: ${item.quantity} | Unit Price: $${item.unitPrice} | Total: $${item.totalPrice}`
    ).join('\n');

    return `Order Details for ${order.id}:
Customer: ${order.customer}
Status: ${order.status} ${order.modifiable ? '(Modifiable)' : '(Not Modifiable)'}
Order Date: ${new Date(order.orderDate).toLocaleDateString()}
Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}
Total Amount: $${order.totalAmount.toFixed(2)}

Line Items:
${lineItemsText}

${order.modifiable ? 'This order can be modified. Use modifyOrder to change quantities or remove items.' : 'This order cannot be modified due to its current status.'}`;
  }

  async loadOrders() {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'orders.json');
      const data = await fs.readFile(dataPath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.orders;
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  async saveOrders(orders) {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'orders.json');
      const data = { orders };
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving orders:', error);
      throw error;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// For Vercel serverless function
export default async function handler(req, res) {
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const server = new OrderManagementServer();
  server.run().catch(console.error);
} 
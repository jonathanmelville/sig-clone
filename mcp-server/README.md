# Signal MCP Server

A Model Context Protocol (MCP) server for order management functionality in the Signal dashboard. This server provides tools for retrieving and modifying supply chain orders through a JSON-based storage system.

## 🚀 Features

- **getOrder**: Retrieve order details by ID
- **modifyOrder**: Update quantities or remove line items from orders
- **JSON-based Storage**: Simple file-based order management
- **Vercel Deployment**: Ready for serverless deployment
- **Status Validation**: Only allows modifications to modifiable orders

## 📁 Project Structure

```
mcp-server/
├── api/
│   └── mcp.js              # Main MCP server implementation
├── data/
│   └── orders.json         # Order data storage
├── package.json            # Dependencies and scripts
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## 🛠️ Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd mcp-server
npm install
```

2. **Start development server**
```bash
npm run dev
```

The MCP server will be available at `http://localhost:3001/api/mcp`

## 📊 Order Data Structure

Orders are stored in `data/orders.json` with the following structure:

```json
{
  "orders": [
    {
      "id": "15058365",
      "status": "ACKNOWLEDGED",
      "customer": "Acme Corporation",
      "orderDate": "2024-01-15T10:30:00Z",
      "deliveryDate": "2024-01-25T14:00:00Z",
      "totalAmount": 2450.75,
      "modifiable": true,
      "lineItems": [
        {
          "id": "item-001",
          "productName": "Industrial Steel Pipes",
          "sku": "STEEL-PIPE-6IN",
          "quantity": 50,
          "unitPrice": 25.50,
          "totalPrice": 1275.00
        }
      ]
    }
  ]
}
```

## 🔧 Available Tools

### getOrder

Retrieves order details by ID.

**Parameters:**
- `orderId` (string): The order ID to retrieve

**Example:**
```javascript
await mcpClient.getOrder("15058365");
```

**Response:**
```
Order Details for 15058365:
Customer: Acme Corporation
Status: ACKNOWLEDGED (Modifiable)
Order Date: 1/15/2024
Delivery Date: 1/25/2024
Total Amount: $2450.75

Line Items:
  - Industrial Steel Pipes (SKU: STEEL-PIPE-6IN)
    Quantity: 50 | Unit Price: $25.50 | Total: $1275.00
  - Hydraulic Valves (SKU: HYD-VALVE-2IN)
    Quantity: 25 | Unit Price: $47.03 | Total: $1175.75

This order can be modified. Use modifyOrder to change quantities or remove items.
```

### modifyOrder

Modifies an existing order by updating quantities or removing line items.

**Parameters:**
- `orderId` (string): The order ID to modify
- `lineItemId` (string): The line item ID to modify
- `action` (string): Either "updateQuantity" or "removeItem"
- `newQuantity` (number, optional): New quantity for updateQuantity action

**Example - Update Quantity:**
```javascript
await mcpClient.modifyOrder("15058365", "item-001", "updateQuantity", 75);
```

**Example - Remove Item:**
```javascript
await mcpClient.modifyOrder("15058365", "item-001", "removeItem");
```

## 🚀 Deployment to Vercel

### Automatic Deployment

1. **Connect to Vercel**
```bash
vercel
```

2. **Deploy**
```bash
vercel --prod
```

### Manual Configuration

The `vercel.json` file is already configured for serverless deployment:

```json
{
  "version": 2,
  "functions": {
    "api/mcp.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/mcp",
      "dest": "/api/mcp.js"
    }
  ]
}
```

## 🔌 Integration with Frontend

The frontend uses the `mcpClient` service to communicate with the MCP server:

```javascript
import mcpClient from '../services/mcpClient';

// Get order details
const orderDetails = await mcpClient.getOrder("15058365");

// Modify order
const result = await mcpClient.modifyOrder("15058365", "item-001", "updateQuantity", 75);
```

## 🤖 Chatbot Integration

The MCP server integrates with the chatbot modal to provide natural language order management:

**Example Commands:**
- "Get order 15058365"
- "Change steel pipes to 75 units in order 15058365"
- "Remove hydraulic valves from order 15058365"
- "Show order details for 15058364"

## 📋 Order Status Rules

- **ACKNOWLEDGED**: Orders can be modified
- **SENDING**: Orders can be modified
- **IN_TRANSIT**: Orders cannot be modified
- **DELIVERED**: Orders cannot be modified

## 🔒 Security Considerations

- Orders are validated before modification
- Only modifiable orders can be changed
- Line item IDs are validated
- Quantity changes must be positive numbers

## 🐛 Troubleshooting

### Common Issues

1. **Order not found**
   - Verify the order ID exists in `data/orders.json`
   - Check for typos in the order ID

2. **Order not modifiable**
   - Check the order status in the data file
   - Only ACKNOWLEDGED and SENDING orders can be modified

3. **Line item not found**
   - Verify the line item ID exists in the order
   - Check the product mapping in the chatbot logic

### Development

For local development, ensure the MCP server is running:

```bash
cd mcp-server
npm run dev
```

The frontend will automatically connect to `http://localhost:3001/api/mcp` in development mode.

## 📝 API Endpoints

### POST /api/mcp

**Request Body:**
```json
{
  "name": "getOrder",
  "arguments": {
    "orderId": "15058365"
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Order Details for 15058365..."
    }
  ]
}
```

## 🔄 Data Persistence

Orders are stored in `data/orders.json` and persist between server restarts. In production, consider using a proper database for better scalability and data integrity. 
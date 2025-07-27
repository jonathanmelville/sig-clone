# Edge Config Setup Guide

This guide explains how to set up Edge Config for production deployment on Vercel.

## 🚀 Deployment Steps

### 1. Deploy to Vercel
```bash
vercel --prod
```

### 2. Create Edge Config
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to **Settings** → **Edge Config**
4. Click **Create Edge Config**
5. Name it `orders-data`

### 3. Add Orders Data
In the Edge Config dashboard, add a new key:

**Key:** `orders`  
**Value:** (Copy the contents of `mcp-server/data/orders.template.json`)

```json
{
  "orders": [
    {
      "id": "15058365",
      "status": "SHIPPED",
      "customer": "Chick-fil-A Downtown",
      "orderDate": "2024-01-15T10:30:00Z",
      "deliveryDate": "2024-01-25T14:00:00Z",
      "totalAmount": 2450.75,
      "modifiable": false,
      "modified": false,
      "notes": "",
      "lineItems": [
        {
          "id": "item-001",
          "productName": "Frozen Chicken Breasts (40 lb case)",
          "sku": "CHK-BREAST-40LB",
          "quantity": 12,
          "unitPrice": 185.50,
          "totalPrice": 2226.00,
          "notes": ""
        },
        {
          "id": "item-002",
          "productName": "French Fries (30 lb case)",
          "sku": "FRIES-FRENCH-30LB",
          "quantity": 8,
          "unitPrice": 28.09,
          "totalPrice": 224.75,
          "notes": ""
        }
      ]
    },
    {
      "id": "15058364",
      "status": "ACKNOWLEDGED",
      "customer": "Chick-fil-A Midtown",
      "orderDate": "2024-01-14T09:15:00Z",
      "deliveryDate": "2024-01-24T16:00:00Z",
      "totalAmount": 1890.25,
      "modifiable": false,
      "modified": false,
      "notes": "",
      "lineItems": [
        {
          "id": "item-003",
          "productName": "Frozen Chicken Tenders (25 lb case)",
          "sku": "CHK-TENDERS-25LB",
          "quantity": 6,
          "unitPrice": 245.00,
          "totalPrice": 1470.00,
          "notes": ""
        },
        {
          "id": "item-004",
          "productName": "Peanut Oil (5 gallon jug)",
          "sku": "OIL-PEANUT-5GAL",
          "quantity": 8,
          "unitPrice": 52.53,
          "totalPrice": 420.25,
          "notes": ""
        }
      ]
    },
    {
      "id": "15053222",
      "status": "DRAFT",
      "customer": "Chick-fil-A Westside",
      "orderDate": "2024-01-10T11:45:00Z",
      "deliveryDate": "2024-01-20T12:00:00Z",
      "totalAmount": 3200.00,
      "modifiable": true,
      "modified": false,
      "notes": "",
      "lineItems": [
        {
          "id": "item-005",
          "productName": "Frozen Chicken Nuggets (20 lb case)",
          "sku": "CHK-NUGGETS-20LB",
          "quantity": 10,
          "unitPrice": 320.00,
          "totalPrice": 3200.00,
          "notes": ""
        }
      ]
    }
  ]
}
```

### 4. Set Environment Variable
1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `REACT_APP_EDGE_CONFIG_URL`
   - **Value:** `https://your-project.vercel.app/api/edge-config`
   - **Environment:** Production

### 5. Redeploy
```bash
vercel --prod
```

## 🔄 How It Works

### Local Development
- Uses `orders.json` file in `mcp-server/data/`
- File-based persistence
- No external dependencies

### Production (Vercel)
- Uses Edge Config for data storage
- Global edge caching
- Automatic scaling
- Same API interface

## 📊 Data Flow

1. **Frontend** → **MCP Server** → **Data Service**
2. **Data Service** detects environment:
   - **Local:** File system (`orders.json`)
   - **Production:** Edge Config
3. **Same interface** for both environments

## 🛠️ Updating Edge Config

To update orders in production:

1. **Via Dashboard:** Edit the `orders` key in Vercel Edge Config
2. **Via API:** Use the `/api/edge-config/update` endpoint
3. **Via CLI:** Use Vercel CLI to update Edge Config

## ⚠️ Important Notes

- Edge Config has **8MB total size limit**
- Updates require **deployment or API call**
- **No real-time updates** - changes are cached
- **Perfect for read-heavy** applications like this POC

## 🎯 Benefits

- ✅ **Zero code changes** between local and production
- ✅ **Global edge caching** for fast performance
- ✅ **Automatic scaling** with Vercel
- ✅ **Simple setup** - no database required
- ✅ **Cost-effective** for small datasets 
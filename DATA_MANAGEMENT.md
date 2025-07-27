# Data Management Guide

This guide explains how the Signal dashboard handles data files, particularly the Chick-fil-A orders data that powers the MCP server.

## 📁 File Structure

```
mcp-server/
├── data/
│   ├── orders.template.json    # Template file (tracked by git)
│   └── orders.json            # User data file (ignored by git)
└── api/
    └── mcp.js                 # MCP server implementation
```

## 🔄 Data Flow

### Template File (`orders.template.json`)
- **Tracked by git** ✅
- Contains sample Chick-fil-A order data
- Used as a template for new installations
- Never modified by the application

### User Data File (`orders.json`)
- **Ignored by git** ❌
- Contains actual Chick-fil-A order data
- Created automatically from template
- Modified by user interactions via MCP server

## 🚀 Automatic Initialization

The system automatically handles data file initialization:

### 1. Development Startup
```bash
npm start
# Automatically runs: node scripts/init-data.js
```

### 2. MCP Server Startup
```bash
cd mcp-server
npm run dev
# Automatically runs: node ../scripts/init-data.js
```

### 3. Manual Initialization
```bash
npm run init-data
# or
node scripts/init-data.js
```

## 🔧 How It Works

### Initialization Process

1. **Check if `orders.json` exists**
   - If exists: ✅ Continue normally
   - If missing: ⚠️ Proceed to initialization

2. **Copy from template**
   - Read `orders.template.json`
   - Create `orders.json` with template content
   - Log success message

3. **Fallback handling**
   - If template missing: Create empty orders file
   - If directory missing: Create directory structure

### MCP Server Integration

The MCP server includes built-in initialization:

```javascript
async loadOrders() {
  // Check if data file exists
  // If not, initialize from template
  // Return orders or empty array
}
```

## 📊 Sample Data

The template includes realistic Chick-fil-A order data:

```json
{
  "orders": [
    {
      "id": "15058365",
      "status": "SHIPPED",
      "customer": "Chick-fil-A Downtown",
      "modifiable": false,
      "modified": false,
      "notes": "",
      "lineItems": [
        {
          "id": "item-001",
          "productName": "Frozen Chicken Breasts (40 lb case)",
          "quantity": 12,
          "unitPrice": 185.50,
          "notes": ""
        }
      ]
    }
  ]
}
```

## 🔒 Security & Best Practices

### Git Management
- ✅ **Template tracked**: `orders.template.json` in git
- ❌ **User data ignored**: `orders.json` in `.gitignore`
- 🔄 **Automatic setup**: No manual file copying needed

### Data Persistence
- **Development**: Changes persist between restarts
- **Production**: Consider database for scalability
- **Backup**: Users should backup their `orders.json`

### Error Handling
- Graceful fallback to empty orders
- Clear error messages
- Automatic recovery from missing files

## 🛠️ Customization

### Modifying Sample Data

To change the default orders:

1. **Edit template file**:
   ```bash
   nano mcp-server/data/orders.template.json
   ```

2. **Update existing installations**:
   ```bash
   # Remove existing data file
   rm mcp-server/data/orders.json
   
   # Restart to reinitialize
   npm start
   ```

### Adding New Data Types

To add new data files:

1. **Create template**:
   ```bash
   # Create template file
   touch mcp-server/data/new-data.template.json
   ```

2. **Update .gitignore**:
   ```bash
   # Add to .gitignore
   echo "mcp-server/data/new-data.json" >> .gitignore
   ```

3. **Update initialization script**:
   ```javascript
   // In scripts/init-data.js
   const NEW_TEMPLATE = path.join(__dirname, '..', 'mcp-server', 'data', 'new-data.template.json');
   const NEW_DATA = path.join(__dirname, '..', 'mcp-server', 'data', 'new-data.json');
   ```

## 🚀 Deployment Considerations

### Vercel Deployment
- Template files are deployed
- User data files are not deployed
- Each deployment starts with fresh template data

### Production Recommendations
- Use database instead of JSON files
- Implement proper data persistence
- Set up automated backups
- Consider data migration strategies

## 🔍 Troubleshooting

### Common Issues

1. **"Template file not found"**
   ```bash
   # Check if template exists
   ls -la mcp-server/data/orders.template.json
   
   # Recreate if missing
   cp mcp-server/data/orders.json mcp-server/data/orders.template.json
   ```

2. **"Data file not created"**
   ```bash
   # Manual initialization
   npm run init-data
   
   # Check permissions
   ls -la mcp-server/data/
   ```

3. **"Orders not loading"**
   ```bash
   # Check file content
   cat mcp-server/data/orders.json
   
   # Validate JSON
   node -e "console.log(JSON.parse(require('fs').readFileSync('mcp-server/data/orders.json')))"
   ```

### Debug Mode

Enable verbose logging:

```javascript
// In scripts/init-data.js
console.log('Template path:', TEMPLATE_PATH);
console.log('Data path:', DATA_PATH);
console.log('Template exists:', fs.existsSync(TEMPLATE_PATH));
console.log('Data exists:', fs.existsSync(DATA_PATH));
```

## 📝 Migration Guide

### From Git-Tracked to Template System

If you have existing `orders.json` in git:

1. **Backup existing data**:
   ```bash
   cp mcp-server/data/orders.json orders-backup.json
   ```

2. **Create template**:
   ```bash
   mv mcp-server/data/orders.json mcp-server/data/orders.template.json
   ```

3. **Update .gitignore**:
   ```bash
   echo "mcp-server/data/orders.json" >> .gitignore
   ```

4. **Commit changes**:
   ```bash
   git add mcp-server/data/orders.template.json .gitignore
   git commit -m "Convert orders.json to template system"
   ```

5. **Initialize for development**:
   ```bash
   npm run init-data
   ```

## 🔗 Related Files

- `scripts/init-data.js` - Initialization script
- `mcp-server/data/orders.template.json` - Template data
- `mcp-server/api/mcp.js` - MCP server with data handling
- `.gitignore` - Git ignore rules
- `package.json` - NPM scripts for initialization 
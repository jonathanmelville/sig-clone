# Signal Dashboard Deployment Guide

This guide covers deploying the Signal dashboard with MCP server functionality to Vercel.

## 🚀 Quick Deployment

### 1. Prepare for Deployment

```bash
# Install all dependencies
npm install

# Install MCP server dependencies
cd mcp-server
npm install
cd ..
```

### 2. Deploy to Vercel

```bash
# Deploy the entire project
vercel --prod
```

## 📁 Project Structure for Deployment

```
signal-dashboard/
├── src/                    # React frontend
├── public/                 # Static assets
├── mcp-server/            # MCP server (deployed as API routes)
│   ├── api/
│   │   └── mcp.js         # Vercel serverless function
│   ├── data/
│   │   └── orders.json    # Order data
│   └── vercel.json        # Vercel configuration
├── package.json           # Frontend dependencies
└── vercel.json           # Root Vercel configuration
```

## ⚙️ Vercel Configuration

### Root vercel.json

Create a root `vercel.json` file to handle the MCP server deployment:

```json
{
  "version": 2,
  "functions": {
    "mcp-server/api/mcp.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/mcp",
      "dest": "/mcp-server/api/mcp.js"
    }
  ],
  "rewrites": [
    {
      "source": "/api/mcp",
      "destination": "/mcp-server/api/mcp.js"
    }
  ]
}
```

## 🔧 Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
NODE_ENV=production

# AI Provider API Keys (choose one or more)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
REACT_APP_LOCAL_API_KEY=your_local_api_key_here
```

### AI Provider Setup

1. **OpenAI GPT-4** (Recommended):
   - Get API key from [OpenAI Platform](https://platform.openai.com)
   - Set `REACT_APP_OPENAI_API_KEY` in Vercel environment variables

2. **Anthropic Claude**:
   - Get API key from [Anthropic Console](https://console.anthropic.com)
   - Set `REACT_APP_ANTHROPIC_API_KEY` in Vercel environment variables

3. **Local AI Model**:
   - Set up your local AI service
   - Set `REACT_APP_LOCAL_API_KEY` in Vercel environment variables

4. **Mock Provider** (Development):
   - No API key required
   - Automatically falls back to mock responses

## 📊 Data Persistence

### Development
- Orders are stored in `mcp-server/data/orders.json`
- Changes persist between server restarts

### Production
- For production, consider using a database instead of JSON files
- Vercel serverless functions have read-only filesystem
- Options:
  - Vercel KV (Redis)
  - Vercel Postgres
  - MongoDB Atlas
  - Supabase

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 4: Configure Domain (Optional)

```bash
vercel domains add your-domain.com
```

## 🔍 Testing the Deployment

### 1. Test Frontend
- Visit your Vercel URL
- Verify the dashboard loads correctly
- Test the chatbot modal

### 2. Test MCP Server
```bash
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getOrder",
    "arguments": {
      "orderId": "15058365"
    }
  }'
```

### 3. Test Chatbot Integration
- Open the chatbot modal
- Try commands like:
  - "Get order 15058365"
  - "Change steel pipes to 75 units in order 15058365"
  - "help"

## 🐛 Troubleshooting

### Common Issues

1. **MCP Server Not Found**
   - Check that `mcp-server/api/mcp.js` exists
   - Verify Vercel configuration in `vercel.json`
   - Check function logs in Vercel dashboard

2. **CORS Errors**
   - Ensure API routes are properly configured
   - Check that frontend is calling the correct URL

3. **Data Not Persisting**
   - Vercel serverless functions have read-only filesystem
   - Consider using a database for production

4. **Function Timeout**
   - MCP operations should complete within Vercel's timeout limits
   - Optimize file I/O operations

### Debugging

1. **Check Vercel Logs**
```bash
vercel logs
```

2. **Test Locally**
```bash
# Start frontend
npm start

# Start MCP server (in another terminal)
cd mcp-server
npm run dev
```

3. **Check Network Tab**
- Open browser developer tools
- Monitor network requests to `/api/mcp`

## 🔄 Continuous Deployment

### GitHub Integration

1. **Connect Repository**
   - Link your GitHub repo to Vercel
   - Enable automatic deployments

2. **Environment Variables**
   - Set production environment variables in Vercel dashboard

3. **Deploy on Push**
   - Every push to main branch triggers deployment
   - Preview deployments for pull requests

## 📈 Monitoring

### Vercel Analytics

- Enable Vercel Analytics for performance monitoring
- Track function execution times
- Monitor API usage

### Error Tracking

- Set up error tracking (Sentry, LogRocket)
- Monitor MCP server errors
- Track chatbot usage patterns

## 🔒 Security Considerations

### Production Checklist

- [ ] Environment variables configured
- [ ] API routes protected (if needed)
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Error handling in place
- [ ] Rate limiting considered

### Data Security

- [ ] Order data properly validated
- [ ] No sensitive data in client-side code
- [ ] API responses sanitized
- [ ] File permissions set correctly

## 🚀 Performance Optimization

### Frontend

- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Font loading optimized
- [ ] Bundle size minimized

### Backend

- [ ] MCP server optimized
- [ ] Database queries efficient
- [ ] Caching implemented
- [ ] Function cold starts minimized

## 📞 Support

For deployment issues:

1. Check Vercel documentation
2. Review function logs
3. Test locally first
4. Check network connectivity
5. Verify configuration files

## 🔄 Updates and Maintenance

### Regular Tasks

- [ ] Update dependencies
- [ ] Monitor function performance
- [ ] Review error logs
- [ ] Backup order data
- [ ] Test chatbot functionality

### Scaling Considerations

- [ ] Database migration plan
- [ ] Load balancing strategy
- [ ] Caching strategy
- [ ] Monitoring and alerting 
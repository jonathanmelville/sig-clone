# AI Configuration Guide

This guide explains how to configure and use different AI providers with the Signal dashboard chatbot.

## 🚀 Quick Start

### 1. Choose Your AI Provider

The system supports multiple AI providers:

- **OpenAI GPT-4** (Recommended)
- **Anthropic Claude**
- **Local AI Models**
- **Mock Provider** (Development)

### 2. Set Up API Keys

Create a `.env` file in your project root:

```bash
# Copy the template
cp env.template .env

# Edit with your API keys
nano .env
```

Add your API keys:

```bash
# OpenAI GPT-4
REACT_APP_OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic Claude
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Local AI Model
REACT_APP_LOCAL_API_KEY=your-local-key-here
```

### 3. Configure Provider

Edit `src/config/ai-config.js` to set your preferred provider:

```javascript
const AI_CONFIG = {
  provider: 'openai', // Change this to your preferred provider
  // ... rest of config
};
```

## 🤖 Available Providers

### OpenAI GPT-4

**Best for:** Production use, general AI tasks

**Setup:**
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env`: `REACT_APP_OPENAI_API_KEY=sk-...`
3. Set provider to `'openai'` in config

**Features:**
- GPT-4 model
- 1000 max tokens
- 0.7 temperature
- Custom system prompt

### Anthropic Claude

**Best for:** Safety-focused applications

**Setup:**
1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `.env`: `REACT_APP_ANTHROPIC_API_KEY=sk-ant-...`
3. Set provider to `'anthropic'` in config

**Features:**
- Claude 3 Sonnet model
- 1000 max tokens
- 0.7 temperature
- Safety-focused responses

### Local AI Model

**Best for:** Privacy, custom models

**Setup:**
1. Set up local AI service (e.g., Ollama, LM Studio)
2. Add to `.env`: `REACT_APP_LOCAL_API_KEY=your-key`
3. Set provider to `'local'` in config
4. Update `baseURL` in config to your local service

**Features:**
- Custom model support
- Local deployment
- Privacy-focused

### Mock Provider

**Best for:** Development, testing

**Setup:**
- No API key required
- Automatically falls back to mock if no keys configured
- Set provider to `'mock'` in config

**Features:**
- Simulated responses
- No API costs
- Development-friendly

## ⚙️ Configuration Options

### Global Settings

```javascript
settings: {
  enableStreaming: true,      // Enable streaming responses
  retryAttempts: 3,          // Number of retry attempts
  timeout: 30000,            // Request timeout (30s)
  enableLogging: true        // Enable debug logging
}
```

### Provider-Specific Settings

Each provider supports these settings:

```javascript
{
  name: 'Provider Name',
  apiKey: 'your-api-key',
  model: 'model-name',
  baseURL: 'https://api.provider.com',
  maxTokens: 1000,
  temperature: 0.7,
  systemPrompt: 'Your system prompt here'
}
```

## 🔧 Runtime Configuration

### Switch Providers

Use the AI Configuration Panel in the chatbot:

1. Open the chatbot modal
2. Click the settings icon (⚙️)
3. Choose your preferred provider
4. Click "Switch"

### Programmatic Switching

```javascript
import aiService from '../services/aiService';

// Switch to OpenAI
aiService.switchProvider('openai');

// Switch to Claude
aiService.switchProvider('anthropic');

// Get current provider info
const info = aiService.getProviderInfo();
console.log(info); // { name: 'OpenAI GPT-4', model: 'gpt-4', providerName: 'openai' }
```

## 📝 System Prompts

### Default System Prompt

The system includes a default prompt optimized for order management:

```
You are an AI assistant for a supply chain management system called Signal. 
You help users manage orders through natural language commands. You can:
- Retrieve order details
- Modify order quantities
- Remove items from orders
- Provide helpful information about the system

Always be helpful, concise, and professional. If you don't understand a command, ask for clarification.
```

### Customizing System Prompts

Edit the system prompt in `src/config/ai-config.js`:

```javascript
providers: {
  openai: {
    // ... other settings
    systemPrompt: `Your custom system prompt here...`
  }
}
```

## 🔒 Security Considerations

### API Key Security

- **Never commit API keys** to version control
- Use environment variables for all API keys
- Rotate API keys regularly
- Monitor API usage and costs

### Environment Variables

```bash
# Development (.env file)
REACT_APP_OPENAI_API_KEY=sk-your-key

# Production (Vercel environment variables)
REACT_APP_OPENAI_API_KEY=sk-your-production-key
```

### Rate Limiting

Consider implementing rate limiting for production:

```javascript
// In aiService.js
const rateLimiter = {
  requests: 0,
  lastReset: Date.now(),
  maxRequests: 100,
  resetInterval: 60000 // 1 minute
};
```

## 🐛 Troubleshooting

### Common Issues

1. **"API key not found"**
   - Check environment variable name
   - Ensure `.env` file is in project root
   - Restart development server

2. **"Provider not supported"**
   - Check provider name in config
   - Ensure provider is properly configured

3. **"Network error"**
   - Check internet connection
   - Verify API endpoint URLs
   - Check firewall settings

4. **"Rate limit exceeded"**
   - Wait before making more requests
   - Check API usage limits
   - Consider upgrading API plan

### Debug Mode

Enable debug logging:

```javascript
// In ai-config.js
settings: {
  enableLogging: true
}
```

Check browser console for detailed logs.

## 📊 Usage Examples

### Basic Usage

```javascript
import aiService from '../services/aiService';

// Generate response
const response = await aiService.generateResponse('Hello, how can you help me?');
console.log(response);
```

### With Context

```javascript
const context = {
  availableOrders: ['15058365', '15058364'],
  recentActions: ['Viewed order 15058365', 'Modified quantity']
};

const response = await aiService.generateResponse(
  'What orders can I modify?', 
  context
);
```

### Error Handling

```javascript
try {
  const response = await aiService.generateResponse('Hello');
} catch (error) {
  console.error('AI Service Error:', error);
  // Handle error appropriately
}
```

## 🚀 Deployment

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. Deploy with `vercel --prod`
3. Test AI functionality

### Local Development

```bash
# Start development server
npm start

# Test AI configuration
# Open chatbot and click settings icon
```

## 📈 Monitoring

### API Usage

Monitor your API usage:

- **OpenAI**: [Usage Dashboard](https://platform.openai.com/usage)
- **Anthropic**: [Console Dashboard](https://console.anthropic.com)

### Cost Optimization

- Use appropriate model sizes
- Implement caching where possible
- Monitor token usage
- Set up usage alerts

## 🔄 Updates

### Adding New Providers

1. Add provider config to `ai-config.js`
2. Implement provider method in `aiService.js`
3. Update configuration panel
4. Test thoroughly

### Example: Adding Google Gemini

```javascript
// In ai-config.js
providers: {
  gemini: {
    name: 'Google Gemini',
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
    model: 'gemini-pro',
    baseURL: 'https://generativelanguage.googleapis.com',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: '...'
  }
}

// In aiService.js
async callGemini(userMessage, context) {
  // Implementation here
}
```

## 📞 Support

For issues with AI configuration:

1. Check this documentation
2. Review browser console logs
3. Test with mock provider
4. Verify API keys and endpoints
5. Check provider status pages

## 🔗 Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/) 
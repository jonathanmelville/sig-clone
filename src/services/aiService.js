import AI_CONFIG, { getCurrentProvider, validateApiKey } from '../config/ai-config';

class AIService {
  constructor() {
    this.provider = getCurrentProvider();
    this.validateConfiguration();
  }

  validateConfiguration() {
    try {
      validateApiKey();
    } catch (error) {
      console.warn('AI Configuration Warning:', error.message);
      // Fall back to mock provider if no API key
      if (this.provider.providerName !== 'mock') {
        console.log('Falling back to mock AI provider for development');
        this.provider = AI_CONFIG.providers.mock;
      }
    }
  }

  async generateResponse(userMessage, context = {}) {
    const { providerName } = this.provider;

    try {
      switch (providerName) {
        case 'openai':
          return await this.callOpenAI(userMessage, context);
        case 'anthropic':
          return await this.callAnthropic(userMessage, context);
        case 'local':
          return await this.callLocalAI(userMessage, context);
        case 'mock':
          return await this.callMockAI(userMessage, context);
        default:
          throw new Error(`Unsupported AI provider: ${providerName}`);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async callOpenAI(userMessage, context) {
    const { apiKey, model, baseURL, maxTokens, temperature, systemPrompt } = this.provider;
    
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: this.buildPrompt(userMessage, context)
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(userMessage, context) {
    const { apiKey, model, baseURL, maxTokens, temperature, systemPrompt } = this.provider;
    
    const response = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: this.buildPrompt(userMessage, context)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callLocalAI(userMessage, context) {
    const { baseURL, maxTokens, temperature, systemPrompt } = this.provider;
    
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: this.buildPrompt(userMessage, context)
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Local AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callMockAI(userMessage, context) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock responses for development/testing
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I'm a mock AI assistant for the Signal supply chain system! I can help you:

📋 **Get Order Details**
- "Get order 15058365"
- "Show order details for 15058364"

✏️ **Modify Orders**
- "Change steel pipes to 75 units in order 15058365"
- "Update hydraulic valves quantity to 30 in order 15058364"
- "Remove aluminum sheets from order 15058365"

📊 **Available Orders**: 15058365, 15058364, 15053222, 5147501

💡 **Note**: This is a mock response. In production, I would connect to a real AI service.`;
    }
    
    if (lowerMessage.includes('get order') || lowerMessage.includes('show order')) {
      return `[Mock Response] I would retrieve the order details for you. In production, this would call the MCP server to get real order data.`;
    }
    
    if (lowerMessage.includes('modify') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
      return `[Mock Response] I would modify the order for you. In production, this would call the MCP server to update the order data.`;
    }
    
    return `[Mock Response] I understand you said: "${userMessage}". In production, I would process this through a real AI service and potentially call the MCP server for order management tasks.`;
  }

  buildPrompt(userMessage, context) {
    let prompt = userMessage;
    
    // Add context if available
    if (context.availableOrders) {
      prompt += `\n\nAvailable order IDs: ${context.availableOrders.join(', ')}`;
    }
    
    if (context.recentActions) {
      prompt += `\n\nRecent actions: ${context.recentActions.join(', ')}`;
    }
    
    return prompt;
  }

  // Method to switch providers at runtime
  switchProvider(newProvider) {
    try {
      this.provider = AI_CONFIG.providers[newProvider];
      this.validateConfiguration();
      return true;
    } catch (error) {
      console.error('Failed to switch provider:', error);
      return false;
    }
  }

  // Method to get current provider info
  getProviderInfo() {
    return {
      name: this.provider.name,
      model: this.provider.model,
      providerName: this.provider.providerName
    };
  }
}

export default new AIService(); 
// AI Model Configuration
// This file allows you to easily switch between different AI providers

const AI_CONFIG = {
  // Current AI provider: 'openai', 'anthropic', 'local', 'mock'
  provider: 'openai',
  
  // Provider-specific configurations
  providers: {
    openai: {
      name: 'OpenAI GPT-4',
      apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
      model: 'gpt-4',
      baseURL: 'https://api.openai.com/v1',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: `You are an AI assistant for a supply chain management system called Signal. 
You help users manage orders through natural language commands. You can:
- Retrieve order details
- Modify order quantities
- Remove items from orders
- Provide helpful information about the system

Always be helpful, concise, and professional. If you don't understand a command, ask for clarification.`
    },
    
    anthropic: {
      name: 'Anthropic Claude',
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
      model: 'claude-3-sonnet-20240229',
      baseURL: 'https://api.anthropic.com',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: `You are an AI assistant for a supply chain management system called Signal. 
You help users manage orders through natural language commands. You can:
- Retrieve order details
- Modify order quantities
- Remove items from orders
- Provide helpful information about the system

Always be helpful, concise, and professional. If you don't understand a command, ask for clarification.`
    },
    
    local: {
      name: 'Local AI Model',
      apiKey: process.env.REACT_APP_LOCAL_API_KEY || '',
      model: 'local-model',
      baseURL: 'http://localhost:8000',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: `You are an AI assistant for a supply chain management system called Signal. 
You help users manage orders through natural language commands. You can:
- Retrieve order details
- Modify order quantities
- Remove items from orders
- Provide helpful information about the system

Always be helpful, concise, and professional. If you don't understand a command, ask for clarification.`
    },
    
    mock: {
      name: 'Mock AI (Development)',
      apiKey: '',
      model: 'mock',
      baseURL: '',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: `You are an AI assistant for a supply chain management system called Signal. 
You help users manage orders through natural language commands. You can:
- Retrieve order details
- Modify order quantities
- Remove items from orders
- Provide helpful information about the system

Always be helpful, concise, and professional. If you don't understand a command, ask for clarification.`
    }
  },
  
  // Global settings
  settings: {
    enableStreaming: true,
    retryAttempts: 3,
    timeout: 30000, // 30 seconds
    enableLogging: process.env.NODE_ENV === 'development'
  }
};

// Helper function to get current provider config
export const getCurrentProvider = () => {
  const providerName = AI_CONFIG.provider;
  const provider = AI_CONFIG.providers[providerName];
  
  if (!provider) {
    throw new Error(`Unknown AI provider: ${providerName}`);
  }
  
  return {
    ...provider,
    providerName
  };
};

// Helper function to validate API key
export const validateApiKey = () => {
  const provider = getCurrentProvider();
  
  if (provider.providerName === 'mock') {
    return true; // Mock provider doesn't need API key
  }
  
  if (!provider.apiKey) {
    throw new Error(`API key not found for ${provider.name}. Please set the appropriate environment variable.`);
  }
  
  return true;
};

// Helper function to switch providers
export const switchProvider = (newProvider) => {
  if (!AI_CONFIG.providers[newProvider]) {
    throw new Error(`Unknown provider: ${newProvider}`);
  }
  
  AI_CONFIG.provider = newProvider;
  return getCurrentProvider();
};

// Helper function to get all available providers
export const getAvailableProviders = () => {
  return Object.keys(AI_CONFIG.providers).map(key => ({
    key,
    ...AI_CONFIG.providers[key]
  }));
};

export default AI_CONFIG; 
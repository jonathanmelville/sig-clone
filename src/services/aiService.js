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
    try {
      this.validateConfiguration();
      
      // Check if this is an order-related query that needs data retrieval
      const orderQueryKeywords = [
        'order', 'orders', 'draft', 'shipped', 'acknowledged', 'status',
        'which', 'what', 'show', 'list', 'get', 'retrieve', 'find',
        'my', 'your', 'the', 'this', 'that'
      ];
      
      const lowerMessage = userMessage.toLowerCase();
      const isOrderQuery = orderQueryKeywords.some(keyword => lowerMessage.includes(keyword));
      
      let orderData = null;
      
      // If it's an order query and we have an MCP client, get the data first
      if (isOrderQuery && context.mcpClient && context.availableOrders) {
        try {
          // Get data for all available orders
          const allOrdersData = [];
          for (const orderId of context.availableOrders) {
            try {
              const response = await context.mcpClient.getOrder(orderId);
              const orderText = context.mcpClient.parseOrderResponse(response);
              allOrdersData.push(`Order ${orderId}:\n${orderText}`);
            } catch (error) {
              allOrdersData.push(`Order ${orderId}: Error - ${error.message}`);
            }
          }
          orderData = allOrdersData.join('\n\n---\n\n');
        } catch (error) {
          console.error('Error retrieving order data:', error);
          orderData = `Error retrieving order data: ${error.message}`;
        }
      }
      
      // Build the prompt with conversation context
      let enhancedMessage = userMessage;
      
      // Add conversation history if available
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        const historyText = context.conversationHistory
          .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
          .join('\n');
        enhancedMessage = `Recent Conversation:\n${historyText}\n\nCurrent User Question: ${userMessage}`;
      }
      
      // Add last bot response context
      if (context.lastBotResponse && context.lastBotResponse.length > 0) {
        enhancedMessage += `\n\nLast Assistant Response: ${context.lastBotResponse}`;
      }
      
      // Add order data if available
      if (orderData) {
        enhancedMessage = `User Question: ${userMessage}\n\nAvailable Order Data:\n${orderData}\n\nPlease answer the user's question based on the order data provided above.`;
      }
      
      // Call the appropriate AI provider
      switch (this.provider.providerName) {
        case 'openai':
          return await this.callOpenAI(enhancedMessage, context);
        case 'anthropic':
          return await this.callAnthropic(enhancedMessage, context);
        case 'local':
          return await this.callLocalAI(enhancedMessage, context);
        case 'mock':
          return await this.callMockAI(enhancedMessage, context);
        default:
          throw new Error(`Unsupported AI provider: ${this.provider.providerName}`);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  async callOpenAI(userMessage, context) {
    const { apiKey, model, baseURL, maxTokens, temperature, systemPrompt } = this.provider;
    
    console.log('📤 Sending to OpenAI:', userMessage);
    
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
            content: userMessage
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
    const llmResponse = data.choices[0].message.content;
    
    // Check if the LLM response contains action requests and execute them
    if (context.mcpClient) {
      return await this.executeActionRequests(llmResponse, context);
    }
    
    return llmResponse;
  }




  async executeActionRequests(llmResponse, context) {
    console.log('🔍 LLM Response:', llmResponse);
    console.log('🔍 Starts with ACTION?:', llmResponse.startsWith('ACTION:'));
    console.log('🔍 Response length:', llmResponse.length);
    console.log('🔍 First 50 characters:', llmResponse.substring(0, 50));
    
    // Only execute actions if the LLM explicitly starts with "ACTION:"
    if (!llmResponse.startsWith('ACTION:')) {
      console.log('❌ No ACTION prefix found, returning LLM response as-is');
      return llmResponse;
    }
    
    // Extract the action part after "ACTION:"
    const actionText = llmResponse.substring(7).trim();
    const lowerAction = actionText.toLowerCase();
    
    console.log('🔍 Action text:', actionText);
    console.log('🔍 Lower action:', lowerAction);
    
    // Check if this contains specific modification details
    const hasOrderId = actionText.match(/\d{8}/);
    
    console.log('🔍 Has order ID:', hasOrderId);
    
    // Handle different quantity patterns: "to 12", "from 29 to 12", "12 units", etc.
    let quantityMatch = actionText.match(/(\d+)\s*(?:units?|quantity|qty|cases?)/i);
    if (!quantityMatch) {
      // Try to match "to X" pattern for reduce/change requests
      quantityMatch = actionText.match(/to\s+(\d+)/i);
    }
    if (!quantityMatch) {
      // Try to match "from X to Y" pattern and use the "to Y" part
      const fromToMatch = actionText.match(/from\s+\d+\s+to\s+(\d+)/i);
      if (fromToMatch) {
        quantityMatch = fromToMatch;
      }
    }
    
    console.log('🔍 Quantity match:', quantityMatch);
    console.log('🔍 Has modification action:', lowerAction.includes('add') || lowerAction.includes('modify') || lowerAction.includes('change') || lowerAction.includes('update') || lowerAction.includes('reduce'));
    
    // Only execute if we have order ID and quantity
    if (hasOrderId && quantityMatch && 
        (lowerAction.includes('add') || lowerAction.includes('modify') || lowerAction.includes('change') || lowerAction.includes('update') || lowerAction.includes('reduce'))) {
      
      const orderId = hasOrderId[0];
      const quantity = parseInt(quantityMatch[1]);
      
      try {
        // Get the current order to find the line item dynamically
        const currentOrderResponse = await context.mcpClient.getOrder(orderId);
        const currentOrderText = context.mcpClient.parseOrderResponse(currentOrderResponse);
        
        // Find the line item by looking for item IDs, SKUs, or product names in the action text
        let lineItemId = null;
        
        // Priority 1: Try to find by line item ID (item-001, item-002, etc.) - most reliable
        const lineItemMatch = actionText.match(/item-\d+/i);
        if (lineItemMatch) {
          lineItemId = lineItemMatch[0];
          console.log('🔍 Found line item ID directly:', lineItemId);
        } else {
          // Priority 2: Try to find by SKU
          const skuMatch = actionText.match(/[A-Z]+-[A-Z]+-\d+[A-Z]+/g);
          console.log('🔍 SKU matches found:', skuMatch);
          if (skuMatch) {
            // Look for this SKU in the order text
            for (const sku of skuMatch) {
              console.log('🔍 Looking for SKU in order text:', sku);
              if (currentOrderText.includes(sku)) {
                console.log('🔍 Found SKU in order text:', sku);
                console.log('🔍 Order text snippet around SKU:', currentOrderText.substring(Math.max(0, currentOrderText.indexOf(sku) - 50), currentOrderText.indexOf(sku) + 100));
                // Extract the line item ID from the order text (now includes ID in format)
                const lineItemMatch = currentOrderText.match(new RegExp(`SKU: \\\`${sku}\\\`.*?ID: \\\`([^\\\`]+)\\\``, 'i'));
                console.log('🔍 Line item match for SKU:', lineItemMatch);
                if (lineItemMatch) {
                  lineItemId = lineItemMatch[1];
                  console.log('🔍 Found line item ID from SKU:', lineItemId);
                  break;
                }
              }
            }
          }
          
          // If still not found, try to find by product name
          if (!lineItemId) {
            // Extract product names from the order text and try to match
            const productMatches = currentOrderText.match(/\*\*([^*]+)\*\*/g);
            if (productMatches) {
              for (const productMatch of productMatches) {
                const productName = productMatch.replace(/\*\*/g, '').toLowerCase();
                if (lowerAction.includes(productName.toLowerCase())) {
                  // Find the line item ID for this product
                  const lineItemMatch = currentOrderText.match(new RegExp(`${productMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?item-\\d+`, 'i'));
                  if (lineItemMatch) {
                    const itemIdMatch = lineItemMatch[0].match(/item-\d+/);
                    if (itemIdMatch) {
                      lineItemId = itemIdMatch[0];
                      break;
                    }
                  }
                }
              }
            }
          }
        }
        
        if (lineItemId) {
          console.log('🔍 Found line item ID:', lineItemId);
          console.log('🔍 Order text snippet around line item ID:', currentOrderText.substring(Math.max(0, currentOrderText.indexOf(lineItemId) - 50), currentOrderText.indexOf(lineItemId) + 200));
          
          // For "add" requests, we need to check current quantity and add to it
          if (lowerAction.includes('add')) {
            // Extract current quantity for this line item
            // Look for the line item ID in parentheses format and then find the quantity on the next line
            const currentQuantityMatch = currentOrderText.match(new RegExp(`\\(ID: \\\`${lineItemId}\\\`\\).*?\\n.*?Quantity:\\s*(\\d+)`, 'i'));
            console.log('🔍 Current quantity match:', currentQuantityMatch);
            if (currentQuantityMatch) {
              const currentQuantity = parseInt(currentQuantityMatch[1]);
              const totalQuantity = currentQuantity + quantity;
              
              console.log('🔍 Current quantity:', currentQuantity, 'Adding:', quantity, 'Total:', totalQuantity);
              
              // Execute the modification
              const response = await context.mcpClient.modifyOrder(orderId, lineItemId, 'updateQuantity', totalQuantity);
              return context.mcpClient.parseOrderResponse(response);
            } else {
              return `❌ **Error:** Could not determine current quantity for the item in order ${orderId}.`;
            }
          } else {
            // For "reduce", "modify", "change", "update" requests, use the target quantity directly
            const response = await context.mcpClient.modifyOrder(orderId, lineItemId, 'updateQuantity', quantity);
            return context.mcpClient.parseOrderResponse(response);
          }
        } else {
          return `❌ **Error:** Could not identify the specific item to modify in order ${orderId}. Please specify the item ID (e.g., "item-001"), SKU, or product name. You can see the available item IDs in the order details above.`;
        }
      } catch (error) {
        return `❌ **Error updating order** \`${orderId}\`: ${error.message}`;
      }
    }
    
    // If no action was executed, return the original LLM response
    return llmResponse;
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
    // Force real MCP calls - no more mock responses
    if (context.mcpClient) {
      const lowerMessage = userMessage.toLowerCase();
      
      // Handle get order requests
      if (lowerMessage.includes('get order') || lowerMessage.includes('show order') || lowerMessage.includes('order details')) {
        const orderIdMatch = userMessage.match(/\d{8}/);
        if (orderIdMatch) {
          const orderId = orderIdMatch[0];
          try {
            const response = await context.mcpClient.getOrder(orderId);
            return context.mcpClient.parseOrderResponse(response);
          } catch (error) {
            return `❌ **Error retrieving order** \`${orderId}\`: ${error.message}`;
          }
        } else {
          // Check if user wants to see all orders
          if (lowerMessage.includes('all orders') || lowerMessage.includes('list orders') || lowerMessage.includes('recent orders')) {
            try {
              const availableOrders = context.availableOrders || ['15058365', '15058364', '15053222'];
              let allOrdersText = '## Recent Orders\n\n';
              
              for (const orderId of availableOrders) {
                try {
                  const response = await context.mcpClient.getOrder(orderId);
                  const orderText = context.mcpClient.parseOrderResponse(response);
                  // Extract just the key info for the summary
                  const lines = orderText.split('\n');
                  const orderSummary = lines.slice(0, 8).join('\n'); // Just the header info
                  allOrdersText += `### Order ${orderId}\n${orderSummary}\n\n---\n\n`;
                } catch (error) {
                  allOrdersText += `### Order ${orderId}\n❌ **Error:** ${error.message}\n\n---\n\n`;
                }
              }
              
              return allOrdersText;
            } catch (error) {
              return `❌ **Error retrieving orders:** ${error.message}`;
            }
          } else {
            return "❓ **Please provide an order ID.** For example: 'Get order 15058365' or 'Show order details for 15058364'";
          }
        }
      }
      
      // Handle modify order requests
      if (lowerMessage.includes('modify') || lowerMessage.includes('change') || lowerMessage.includes('update') || lowerMessage.includes('add')) {
        const orderIdMatch = userMessage.match(/\d{8}/);
        if (!orderIdMatch) {
          return "Please provide an order ID. For example: 'Modify order 15058365'";
        }
        
        const orderId = orderIdMatch[0];
        
        // Check for quantity update (including "case" units)
        const quantityMatch = userMessage.match(/(\d+)\s*(?:units?|quantity|qty|cases?)/i);
        if (quantityMatch) {
          const newQuantity = parseInt(quantityMatch[1]);
          
          // Try to identify the product from the message
          const products = [
            'frozen chicken breasts', 'chicken breasts', 'breasts',
            'french fries', 'fries',
            'frozen chicken tenders', 'chicken tenders', 'tenders',
            'peanut oil', 'oil',
            'frozen chicken nuggets', 'chicken nuggets', 'nuggets'
          ];
          let lineItemId = null;
          let foundProduct = null;
          
          for (const product of products) {
            if (lowerMessage.includes(product)) {
              // Map product names to line item IDs (Chick-fil-A supply chain)
              const productMap = {
                'frozen chicken breasts': 'item-001', 'chicken breasts': 'item-001', 'breasts': 'item-001',
                'french fries': 'item-002', 'fries': 'item-002',
                'frozen chicken tenders': 'item-003', 'chicken tenders': 'item-003', 'tenders': 'item-003',
                'peanut oil': 'item-004', 'oil': 'item-004',
                'frozen chicken nuggets': 'item-005', 'chicken nuggets': 'item-005', 'nuggets': 'item-005'
              };
              lineItemId = productMap[product];
              foundProduct = product;
              break;
            }
          }
          
          if (lineItemId) {
            try {
              // For "add" requests, we need to check if the item already exists and add to it
              if (lowerMessage.includes('add')) {
                // First, get the current order to see if the item exists
                const currentOrderResponse = await context.mcpClient.getOrder(orderId);
                const currentOrderText = context.mcpClient.parseOrderResponse(currentOrderResponse);
                
                // Check if the item already exists in the order
                if (currentOrderText.includes(lineItemId)) {
                  // Item exists, get current quantity and add to it
                  // Look for the quantity in the line item details
                  const quantityMatch = currentOrderText.match(/Quantity:\s*(\d+)/);
                  if (quantityMatch) {
                    const currentQuantity = parseInt(quantityMatch[1]);
                    const totalQuantity = currentQuantity + newQuantity;
                    const response = await context.mcpClient.modifyOrder(orderId, lineItemId, 'updateQuantity', totalQuantity);
                    return context.mcpClient.parseOrderResponse(response);
                  } else {
                    return `❌ **Error:** Could not determine current quantity for ${foundProduct} in order ${orderId}.`;
                  }
                } else {
                  // Item doesn't exist, this would require adding a new line item
                  // For now, we'll just update the existing item (if any) or return an error
                  return `❌ **Cannot add new items yet.** The item ${foundProduct} is not in order ${orderId}. Please use 'update' or 'modify' to change existing items.`;
                }
              } else {
                // Regular update/modify request
                const response = await context.mcpClient.modifyOrder(orderId, lineItemId, 'updateQuantity', newQuantity);
                return context.mcpClient.parseOrderResponse(response);
              }
            } catch (error) {
              return `❌ **Error updating order** \`${orderId}\`: ${error.message}`;
            }
          } else {
            return `❓ **Please specify which product to modify.** Available products: ${products.join(', ')}`;
          }
        }
        
        // Check for remove item
        if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
          const products = [
            'frozen chicken breasts', 'chicken breasts', 'breasts',
            'french fries', 'fries',
            'frozen chicken tenders', 'chicken tenders', 'tenders',
            'peanut oil', 'oil',
            'frozen chicken nuggets', 'chicken nuggets', 'nuggets'
          ];
          let lineItemId = null;
          
          for (const product of products) {
            if (lowerMessage.includes(product)) {
              const productMap = {
                'frozen chicken breasts': 'item-001', 'chicken breasts': 'item-001', 'breasts': 'item-001',
                'french fries': 'item-002', 'fries': 'item-002',
                'frozen chicken tenders': 'item-003', 'chicken tenders': 'item-003', 'tenders': 'item-003',
                'peanut oil': 'item-004', 'oil': 'item-004',
                'frozen chicken nuggets': 'item-005', 'chicken nuggets': 'item-005', 'nuggets': 'item-005'
              };
              lineItemId = productMap[product];
              break;
            }
          }
          
          if (lineItemId) {
            try {
              const response = await context.mcpClient.modifyOrder(orderId, lineItemId, 'removeItem');
              return context.mcpClient.parseOrderResponse(response);
            } catch (error) {
              return `❌ **Error removing item** from order \`${orderId}\`: ${error.message}`;
            }
          } else {
            return `❓ **Please specify which product to remove.** Available products: ${products.join(', ')}`;
          }
        }
        
        return "❓ **Please specify what you want to modify.** You can:\n\n- **Update quantities:** 'Change frozen chicken breasts to 15 units in order 15053222'\n- **Remove items:** 'Remove french fries from order 15053222'";
      }
    }
    
    // If no MCP client, return error
    return `❌ **Error:** No MCP client available. Please check your configuration.`;
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
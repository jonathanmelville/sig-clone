import React, { useState } from 'react';
import './ChatModal.css';
import { Send, X, Bot, User, Settings } from 'lucide-react';
import mcpClient from '../services/mcpClient';
import aiService from '../services/aiService';
import AIConfigPanel from './AIConfigPanel';

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    const userInput = inputMessage;
    setInputMessage('');

    // Process the message and get AI response
    try {
      const botResponse = await processUserMessage(userInput);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const processUserMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for get order command
    if (lowerMessage.includes('get order') || lowerMessage.includes('show order') || lowerMessage.includes('order details')) {
      const orderIdMatch = message.match(/\d+/);
      if (orderIdMatch) {
        const orderId = orderIdMatch[0];
        try {
          const response = await mcpClient.getOrder(orderId);
          return mcpClient.parseOrderResponse(response);
        } catch (error) {
          return `Error retrieving order ${orderId}: ${error.message}`;
        }
      } else {
        return "Please provide an order ID. For example: 'Get order 15058365' or 'Show order details for 15058364'";
      }
    }
    
    // Check for modify order commands
    if (lowerMessage.includes('modify') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
      // Extract order ID
      const orderIdMatch = message.match(/\d+/);
      if (!orderIdMatch) {
        return "Please provide an order ID. For example: 'Modify order 15058365'";
      }
      
      const orderId = orderIdMatch[0];
      
      // Check for quantity update
      const quantityMatch = message.match(/(\d+)\s*(?:units?|quantity|qty)/i);
      if (quantityMatch) {
        const newQuantity = parseInt(quantityMatch[1]);
        
        // Try to identify the product from the message
        const products = ['steel pipes', 'hydraulic valves', 'aluminum sheets', 'copper wire', 'circuit boards', 'titanium bolts', 'stainless steel nuts'];
        let lineItemId = null;
        
        for (const product of products) {
          if (lowerMessage.includes(product)) {
            // Map product names to line item IDs (this is a simplified mapping)
            const productMap = {
              'steel pipes': 'item-001',
              'hydraulic valves': 'item-002',
              'aluminum sheets': 'item-003',
              'copper wire': 'item-004',
              'circuit boards': 'item-005',
              'titanium bolts': 'item-006',
              'stainless steel nuts': 'item-007'
            };
            lineItemId = productMap[product];
            break;
          }
        }
        
        if (lineItemId) {
          try {
            const response = await mcpClient.modifyOrder(orderId, lineItemId, 'updateQuantity', newQuantity);
            return mcpClient.parseOrderResponse(response);
          } catch (error) {
            return `Error updating order ${orderId}: ${error.message}`;
          }
        } else {
          return `Please specify which product to modify. Available products: ${products.join(', ')}`;
        }
      }
      
      // Check for remove item
      if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
        const products = ['steel pipes', 'hydraulic valves', 'aluminum sheets', 'copper wire', 'circuit boards', 'titanium bolts', 'stainless steel nuts'];
        let lineItemId = null;
        
        for (const product of products) {
          if (lowerMessage.includes(product)) {
            const productMap = {
              'steel pipes': 'item-001',
              'hydraulic valves': 'item-002',
              'aluminum sheets': 'item-003',
              'copper wire': 'item-004',
              'circuit boards': 'item-005',
              'titanium bolts': 'item-006',
              'stainless steel nuts': 'item-007'
            };
            lineItemId = productMap[product];
            break;
          }
        }
        
        if (lineItemId) {
          try {
            const response = await mcpClient.modifyOrder(orderId, lineItemId, 'removeItem');
            return mcpClient.parseOrderResponse(response);
          } catch (error) {
            return `Error removing item from order ${orderId}: ${error.message}`;
          }
        } else {
          return `Please specify which product to remove. Available products: ${products.join(', ')}`;
        }
      }
      
      return "Please specify what you want to modify. You can:\n- Update quantities: 'Change steel pipes to 75 units in order 15058365'\n- Remove items: 'Remove hydraulic valves from order 15058365'";
    }
    
    // For all other messages, use the AI service
    try {
      const context = {
        availableOrders: ['15058365', '15058364', '15053222', '5147501'],
        recentActions: messages.slice(-3).map(m => m.text.substring(0, 50) + '...')
      };
      
      return await aiService.generateResponse(message, context);
    } catch (error) {
      console.error('AI Service Error:', error);
      return `I'm sorry, I encountered an error processing your request. Please try again or ask for help.`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-modal-title">
            <Bot size={20} />
            <span>AI Assistant</span>
          </div>
          <div className="chat-modal-actions">
            <button 
              className="chat-modal-settings" 
              onClick={() => setIsConfigOpen(true)}
              title="AI Configuration"
            >
              <Settings size={16} />
            </button>
            <button className="chat-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-avatar">
                {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button 
            onClick={handleSendMessage}
            className="chat-send-button"
            disabled={inputMessage.trim() === ''}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      
      <AIConfigPanel 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
    </div>
  );
};

export default ChatModal; 
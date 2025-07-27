import React, { useState, useEffect, useRef } from 'react';
import './ChatModal.css';
import { Send, X, Bot, User, Settings, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import mcpClient from '../services/mcpClient';
import aiService from '../services/aiService';
import AIConfigPanel from './AIConfigPanel';

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Signal AI assistant. I can help you with your orders and Pathway procedures. Just ask!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    const userInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  const processUserMessage = async (message) => {
    // Let the AI service handle all messages
    try {
      // Get the last few messages for context (excluding the current user message)
      const recentMessages = messages.slice(-6); // Last 6 messages (3 exchanges)
      
      // Get the last bot response specifically
      const lastBotResponse = messages
        .filter(m => m.sender === 'bot')
        .slice(-1)[0]?.text || '';
      
      const context = {
        availableOrders: ['15058365', '15058364', '15053222'],
        recentActions: messages.slice(-3).map(m => m.text.substring(0, 50) + '...'),
        mcpClient: mcpClient, // Pass the MCP client so the AI can use it
        conversationHistory: recentMessages.map(m => ({
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp
        })),
        lastBotResponse: lastBotResponse // The most recent bot response
      };
      
      return await aiService.generateResponse(message, context);
    } catch (error) {
      console.error('AI Service Error:', error);
      return `❌ **I'm sorry, I encountered an error processing your request.** Please try again or ask for help.`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-modal-title">
            <Bot size={20} />
            <span>Signal AI Assistant</span>
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
                <div className="message-text">
                  {message.sender === 'bot' ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading message */}
          {isLoading && (
            <div className="chat-message bot-message loading-message">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-content">
                <div className="message-text">
                  <div className="loading-indicator">
                    <Loader2 size={16} className="loading-spinner" />
                    <span>Thinking...</span>
                  </div>
                </div>
                <div className="message-timestamp">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible element for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? "Please wait..." : "Type your message..."}
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            className="chat-send-button"
            disabled={inputMessage.trim() === '' || isLoading}
          >
            {isLoading ? (
              <Loader2 size={16} className="loading-spinner" />
            ) : (
              <Send size={16} />
            )}
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
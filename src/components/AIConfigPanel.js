import React, { useState, useEffect } from 'react';
import './AIConfigPanel.css';
import { Settings, Check, AlertCircle } from 'lucide-react';
import aiService from '../services/aiService';
import { getAvailableProviders, switchProvider } from '../config/ai-config';

const AIConfigPanel = ({ isOpen, onClose }) => {
  const [currentProvider, setCurrentProvider] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProviderInfo();
    }
  }, [isOpen]);

  const loadProviderInfo = () => {
    const providerInfo = aiService.getProviderInfo();
    const providers = getAvailableProviders();
    
    setCurrentProvider(providerInfo);
    setAvailableProviders(providers);
  };

  const handleProviderSwitch = async (providerKey) => {
    setIsLoading(true);
    
    try {
      const success = aiService.switchProvider(providerKey);
      if (success) {
        loadProviderInfo();
      }
    } catch (error) {
      console.error('Failed to switch provider:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderStatus = (provider) => {
    if (provider.key === 'mock') {
      return { status: 'available', message: 'Mock provider for development' };
    }
    
    if (!provider.apiKey) {
      return { status: 'no-key', message: 'API key not configured' };
    }
    
    return { status: 'available', message: 'Ready to use' };
  };

  if (!isOpen) return null;

  return (
    <div className="ai-config-overlay" onClick={onClose}>
      <div className="ai-config-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ai-config-header">
          <div className="ai-config-title">
            <Settings size={20} />
            <span>AI Configuration</span>
          </div>
          <button className="ai-config-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ai-config-content">
          <div className="current-provider">
            <h3>Current Provider</h3>
            {currentProvider && (
              <div className="provider-card current">
                <div className="provider-info">
                  <h4>{currentProvider.name}</h4>
                  <p>Model: {currentProvider.model}</p>
                  <span className="provider-status available">
                    <Check size={16} />
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="available-providers">
            <h3>Available Providers</h3>
            <div className="providers-list">
              {availableProviders.map((provider) => {
                const status = getProviderStatus(provider);
                const isCurrent = currentProvider?.providerName === provider.key;
                
                return (
                  <div 
                    key={provider.key} 
                    className={`provider-card ${isCurrent ? 'current' : ''} ${status.status}`}
                  >
                    <div className="provider-info">
                      <h4>{provider.name}</h4>
                      <p>Model: {provider.model}</p>
                      <span className={`provider-status ${status.status}`}>
                        {status.status === 'available' && <Check size={16} />}
                        {status.status === 'no-key' && <AlertCircle size={16} />}
                        {status.message}
                      </span>
                    </div>
                    
                    {!isCurrent && status.status === 'available' && (
                      <button 
                        className="switch-provider-btn"
                        onClick={() => handleProviderSwitch(provider.key)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Switching...' : 'Switch'}
                      </button>
                    )}
                    
                    {isCurrent && (
                      <span className="current-indicator">
                        <Check size={16} />
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="config-help">
            <h3>Configuration Help</h3>
            <div className="help-content">
              <p><strong>To use OpenAI GPT-4:</strong></p>
              <ol>
                <li>Get an API key from <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></li>
                <li>Add <code>REACT_APP_OPENAI_API_KEY=your_key_here</code> to your <code>.env</code> file</li>
                <li>Switch to OpenAI provider above</li>
              </ol>
              
              <p><strong>To use Anthropic Claude:</strong></p>
              <ol>
                <li>Get an API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">Anthropic Console</a></li>
                <li>Add <code>REACT_APP_ANTHROPIC_API_KEY=your_key_here</code> to your <code>.env</code> file</li>
                <li>Switch to Anthropic provider above</li>
              </ol>
              
              <p><strong>Mock Provider:</strong> Use this for development without API keys.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfigPanel; 
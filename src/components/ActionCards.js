import React, { useState } from 'react';
import './ActionCards.css';
import { Plus, Package, MessageCircle } from 'lucide-react';
import Icon from './Icon';
import ChatModal from './ChatModal';

const ActionCards = () => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  return (
    <>
      <div className="action-cards">
        <div className="action-card">
          <div className="action-icon">
            <Icon 
              icon={Plus} 
              size={38} 
              color="#dc2626" 
              border={true} 
              borderColor="#dc2626" 
              borderWidth={4}
            />
          </div>
          <span className="action-text">Create Order Draft</span>
        </div>
        
        <div className="action-card">
          <div className="action-icon">
            <Icon 
              icon={Package} 
              size={44} 
              color="#dc2626" 
            />
          </div>
          <span className="action-text">Start a Count</span>
        </div>
        
        <div className="action-card" onClick={() => setIsChatModalOpen(true)}>
          <div className="action-icon">
            <Icon 
              icon={MessageCircle} 
              size={44} 
              color="#dc2626" 
            />
          </div>
          <span className="action-text">Launch AI Chat</span>
        </div>
      </div>
      
      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => setIsChatModalOpen(false)} 
      />
    </>
  );
};

export default ActionCards; 
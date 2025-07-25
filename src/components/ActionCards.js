import React from 'react';
import './ActionCards.css';
import { Plus, Package } from 'lucide-react';
import Icon from './Icon';

const ActionCards = () => {
  return (
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
    </div>
  );
};

export default ActionCards; 
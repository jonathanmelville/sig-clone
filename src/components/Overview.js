import React from 'react';
import './Overview.css';
import { ChevronRight, ArrowLeftRight } from 'lucide-react';

const Overview = () => {
  return (
    <div className="overview">
      <h2 className="overview-title">Overview</h2>
      
      <div className="overview-content">
        <div className="overview-column">
          <div className="overview-header">
            <div className="overview-number">3</div>
            <div className="overview-label">Open Orders</div>
          </div>
          
          <button className="overview-button">
            View all Orders →
          </button>
          
          <div className="overview-list">
            <div className="overview-item">
              <span className="item-number">15058365</span>
              <div className="item-status">
                <span className="status-tag acknowledged">ACKNOWLEDGED</span>
                <ChevronRight size={22} color="black" />
              </div>
            </div>
            
            <div className="overview-item">
              <span className="item-number">15058364</span>
              <div className="item-status">
                <span className="status-tag acknowledged">ACKNOWLEDGED</span>
                <ChevronRight size={22} color="black" />
              </div>
            </div>
            
            <div className="overview-item">
              <span className="item-number">15053222</span>
              <div className="item-status">
                <span className="status-tag acknowledged">ACKNOWLEDGED</span>
                <ChevronRight size={22} color="black" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overview-column">
          <div className="overview-header">
            <div className="overview-number">1</div>
            <div className="overview-label">Open Transfers</div>
          </div>
          
          <button className="overview-button">
            View all Transfers →
          </button>
          
          <div className="overview-list">
            <div className="overview-item">
              <div className="transfer-info">
                <div className="transfer-info-sending">
                  <ArrowLeftRight size={22} />
                  <span className="transfer-status">SENDING</span>
                </div>
                <span className="item-number">5147501</span>
              </div>
              <div className="item-status">
                <span className="status-tag action-required">ACTION REQUIRED</span>
                <ChevronRight size={22} color="black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 
import React from 'react';
import './Sidebar.css';
import { 
  Menu, 
  MapPin, 
  Home, 
  Lightbulb, 
  FileText, 
  Package, 
  BarChart3, 
  Calendar, 
  Settings, 
  Mail, 
  User, 
  Bell 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="menu-icon">
          <Menu size={20} />
        </div>
        <div className="location">
          <MapPin size={16} />
          <span className="location-text">05472</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-item active">
          <Home size={20} />
          <div className="active-indicator"></div>
        </div>
        <div className="nav-item">
          <Lightbulb size={20} color="black" />
        </div>
        <div className="nav-item">
          <FileText size={20} />
        </div>
        <div className="nav-item">
          <Package size={20} />
        </div>
        <div className="nav-item">
          <BarChart3 size={20} />
        </div>
        <div className="nav-item">
          <Calendar size={20} />
        </div>
        <div className="nav-item">
          <Settings size={20} />
        </div>
        <div className="nav-item notification">
          <Mail size={20} />
          <div className="notification-dot"></div>
        </div>
        <div className="nav-item">
          <User size={20} />
        </div>
        <div className="nav-item notification">
          <Bell size={20} />
          <div className="notification-dot"></div>
        </div>
      </nav>
      
      <div className="sidebar-bottom">
        <div className="user-avatar">
          <span>JM</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 
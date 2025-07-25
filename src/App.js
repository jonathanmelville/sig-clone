import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ActionCards from './components/ActionCards';
import Overview from './components/Overview';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <ActionCards />
          <Overview />
        </div>
      </div>
    </div>
  );
}

export default App; 
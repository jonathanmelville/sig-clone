#!/usr/bin/env node

/**
 * Data Initialization Script
 * 
 * This script ensures that the orders.json file exists by copying from the template
 * if it doesn't exist. This prevents git tracking of user data while providing
 * a default dataset for new installations.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'mcp-server', 'data', 'orders.template.json');
const DATA_PATH = path.join(__dirname, '..', 'mcp-server', 'data', 'orders.json');

function initializeDataFile() {
  try {
    // Check if the data file already exists
    if (fs.existsSync(DATA_PATH)) {
      console.log('✅ Orders data file already exists');
      return;
    }

    // Check if template exists
    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error('❌ Template file not found:', TEMPLATE_PATH);
      process.exit(1);
    }

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory:', dataDir);
    }

    // Copy template to data file
    const templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    fs.writeFileSync(DATA_PATH, templateContent);
    
    console.log('✅ Initialized orders data file from template');
    console.log('📄 Template:', TEMPLATE_PATH);
    console.log('📄 Data file:', DATA_PATH);
    
  } catch (error) {
    console.error('❌ Error initializing data file:', error.message);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeDataFile();
}

module.exports = { initializeDataFile }; 
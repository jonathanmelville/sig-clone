class DataService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.edgeConfigUrl = process.env.REACT_APP_EDGE_CONFIG_URL;
  }

  async loadOrders() {
    if (this.isProduction && this.edgeConfigUrl) {
      return this.loadFromEdgeConfig();
    } else {
      return this.loadFromFile();
    }
  }

  async saveOrders(orders) {
    if (this.isProduction && this.edgeConfigUrl) {
      return this.saveToEdgeConfig(orders);
    } else {
      return this.saveToFile(orders);
    }
  }

  // Local file operations
  async loadFromFile() {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error loading orders from file:', error);
      return [];
    }
  }

  async saveToFile(orders) {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving orders to file:', error);
      throw error;
    }
  }

  // Edge Config operations
  async loadFromEdgeConfig() {
    try {
      const response = await fetch(this.edgeConfigUrl);
      if (!response.ok) {
        throw new Error(`Edge Config error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error loading orders from Edge Config:', error);
      return [];
    }
  }

  async saveToEdgeConfig(orders) {
    try {
      // Note: Edge Config updates require a separate API endpoint
      // This would typically be handled by a Vercel function
      const response = await fetch('/api/edge-config/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders })
      });
      
      if (!response.ok) {
        throw new Error(`Edge Config update error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving orders to Edge Config:', error);
      throw error;
    }
  }

  // Helper method to get current storage type
  getStorageType() {
    if (this.isProduction && this.edgeConfigUrl) {
      return 'edge-config';
    } else {
      return 'file';
    }
  }
}

export default new DataService(); 
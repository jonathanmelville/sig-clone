class MCPClient {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api/mcp' 
      : 'http://localhost:3001/api/mcp';
  }

  async callTool(name, args) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          arguments: args
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('MCP Client Error:', error);
      throw error;
    }
  }

  async getOrder(orderId) {
    return this.callTool('getOrder', { orderId });
  }

  async modifyOrder(orderId, lineItemId, action, newQuantity = null) {
    const args = { orderId, lineItemId, action };
    if (newQuantity !== null) {
      args.newQuantity = newQuantity;
    }
    return this.callTool('modifyOrder', args);
  }

  // Helper method to parse order details from MCP response
  parseOrderResponse(response) {
    if (response.content && response.content[0] && response.content[0].text) {
      return response.content[0].text;
    }
    return 'No response received from server.';
  }
}

export default new MCPClient(); 
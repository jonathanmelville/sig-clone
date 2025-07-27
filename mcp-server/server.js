import express from 'express';
import cors from 'cors';
import mcpHandler from './api/mcp.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MCP API endpoint
app.post('/api/mcp', mcpHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MCP Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoint: http://localhost:${PORT}/api/mcp`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
}); 
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const dataPath = path.join(process.cwd(), 'mcp-server', 'data', 'orders.json');
      
      // Check if data file exists
      try {
        await fs.access(dataPath);
      } catch (error) {
        // Data file doesn't exist, try to initialize from template
        console.log('Orders data file not found, attempting to initialize from template...');
        const templatePath = path.join(process.cwd(), 'mcp-server', 'data', 'orders.template.json');
        
        try {
          await fs.access(templatePath);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          await fs.writeFile(dataPath, templateContent);
          console.log('✅ Initialized orders data file from template');
        } catch (templateError) {
          console.error('❌ Template file not found, creating empty orders file');
          const emptyOrders = { orders: [] };
          await fs.writeFile(dataPath, JSON.stringify(emptyOrders, null, 2));
        }
      }
      
      const data = await fs.readFile(dataPath, 'utf8');
      const parsed = JSON.parse(data);
      
      res.status(200).json(parsed);
    } catch (error) {
      console.error('Error loading orders:', error);
      res.status(500).json({ error: 'Failed to load orders' });
    }
  } else if (req.method === 'POST') {
    try {
      const { orders } = req.body;
      
      if (!orders) {
        return res.status(400).json({ error: 'Orders data is required' });
      }
      
      const dataPath = path.join(process.cwd(), 'mcp-server', 'data', 'orders.json');
      const data = { orders };
      
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
      
      res.status(200).json({ success: true, message: 'Orders saved successfully' });
    } catch (error) {
      console.error('Error saving orders:', error);
      res.status(500).json({ error: 'Failed to save orders' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 
const fs = require('fs/promises');
const path = require('path');

async function testFileWrite() {
  try {
    const testFilePath = path.join(process.cwd(), 'mcp-server', 'data', 'test-write.json');
    console.log(`Testing file write to: ${testFilePath}`);
    
    const testData = { test: 'data', timestamp: new Date().toISOString() };
    await fs.writeFile(testFilePath, JSON.stringify(testData, null, 2), 'utf8');
    
    console.log('✅ File write successful');
    
    // Read it back
    const readData = await fs.readFile(testFilePath, 'utf8');
    console.log('✅ File read successful:', readData);
    
  } catch (error) {
    console.error('❌ File write failed:', error);
  }
}

testFileWrite(); 
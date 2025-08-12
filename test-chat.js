const fetch = require('node-fetch');

async function checkHealth() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/health');
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}

async function testChat() {
  try {
    // First check if the server is running
    const isHealthy = await checkHealth();
    if (!isHealthy) {
      console.error('❌ Server is not running on http://localhost:3000. Please run `npm run dev`.');
      process.exit(1);
    }

    console.log('✅ Server is running, testing chat endpoint...');

    const response = await fetch('http://127.0.0.1:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Tell me about your features',
        mode: 'guide'
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testChat(); 
const https = require('https');

module.exports = async function handler(req, res) {
  console.log('🔍 Testing authentication flow');
  
  // Test the callback endpoint
  const testCode = 'test_code_' + Date.now();
  
  const postData = JSON.stringify({ code: testCode });
  
  const options = {
    hostname: 'www.moodplaylist.app',
    path: '/api/callback',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      console.log('📡 Callback Response Status:', response.statusCode);
      console.log('📡 Callback Response Data:', data);
      
      res.json({
        statusCode: response.statusCode,
        response: data,
        testCode: testCode
      });
    });
  });
  
  request.on('error', (error) => {
    console.error('❌ Request error:', error);
    res.json({ error: error.message });
  });
  
  request.write(postData);
  request.end();
};

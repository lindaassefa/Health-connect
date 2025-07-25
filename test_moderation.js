const axios = require('axios');

async function testModeration() {
  console.log('Testing AI Moderation Integration...\n');
  
  const testCases = [
    { text: 'hello world', expected: 'safe' },
    { text: 'fuck you', expected: 'blocked' },
    { text: 'shit', expected: 'blocked' },
    { text: 'This is a nice day', expected: 'safe' },
    { text: 'I hate you', expected: 'blocked' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: "${testCase.text}"`);
      
      const response = await axios.post('http://127.0.0.1:8000/api/moderate', {
        text: testCase.text,
        threshold: 0.7  // Higher threshold to reduce false positives
      });
      
      const result = response.data;
      console.log(`  Result: ${result.is_toxic ? 'BLOCKED' : 'ALLOWED'}`);
      console.log(`  Class: ${result.class_name}`);
      console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`  Recommendation: ${result.recommendation}`);
      
      if (testCase.expected === 'blocked' && result.is_toxic) {
        console.log('  ✅ PASS - Correctly blocked');
      } else if (testCase.expected === 'safe' && !result.is_toxic) {
        console.log('  ✅ PASS - Correctly allowed');
      } else {
        console.log('  ❌ FAIL - Incorrect result');
      }
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
}

testModeration().catch(console.error); 
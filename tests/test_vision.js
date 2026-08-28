async function testTextAndVision() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('Set GROQ_API_KEY before running this test.');

  // Test 1: Text summary with qwen/qwen3.6-27b
  console.log('Testing text with qwen/qwen3.6-27b...');
  const textRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: 'Return ONLY valid JSON: {"tldr": "...", "bullets": ["..."], "actions": ["..."], "tag": "General"}' },
        { role: 'user', content: 'Artificial intelligence is transforming software engineering.' }
      ],
      max_tokens: 500
    })
  });
  const textData = await textRes.json();
  console.log('Text Response:', textData?.choices?.[0]?.message?.content || textData);

  // Test 2: Vision with qwen/qwen3.6-27b using a 1x1 test png base64
  console.log('\nTesting vision with qwen/qwen3.6-27b...');
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const visionRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe what you see in this image in one sentence.' },
            { type: 'image_url', image_url: { url: dummyBase64 } }
          ]
        }
      ],
      max_tokens: 200
    })
  });
  const visionData = await visionRes.json();
  console.log('Vision Response:', visionData?.choices?.[0]?.message?.content || visionData);
}

testTextAndVision();


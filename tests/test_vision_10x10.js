async function testVision10x10() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('Set GROQ_API_KEY before running this test.');
  // 10x10 red square PNG base64
  const redSquareBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC";

  console.log('Testing vision with 10x10 image on qwen/qwen3.6-27b...');
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
            { type: 'text', text: 'Analyze this image. Provide: 1) Visual description, 2) Any OCR text detected in image, 3) Key items/objects identified. Return ONLY valid JSON: {"description": "...", "ocrText": "...", "identifiedItems": ["..."]}. Do NOT wrap in markdown code blocks.' },
            { type: 'image_url', image_url: { url: redSquareBase64 } }
          ]
        }
      ],
      max_tokens: 500
    })
  });
  const visionData = await visionRes.json();
  console.log('Vision Response:', visionData?.choices?.[0]?.message?.content || visionData);
}

testVision10x10();


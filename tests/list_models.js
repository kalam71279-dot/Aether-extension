async function check() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Set GROQ_API_KEY before running this test.');
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await res.json();
  if (data.data) {
    console.log('Available models:', data.data.map(m => m.id));
  } else {
    console.log('Error:', data);
  }
}
check();


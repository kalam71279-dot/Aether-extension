function extractJSON(content) {
  if (typeof content !== 'string') content = String(content || '');
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  try { return JSON.parse(cleaned); } catch (e) {}
  let unquoted = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(unquoted); } catch (e) {}
  const match = unquoted.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) {
    const rawJson = match[0];
    try { return JSON.parse(rawJson); } catch (e) {
      const sanitized = rawJson.replace(/,\s*([}\]])/g, '$1').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      try { return JSON.parse(sanitized); } catch (innerErr) {}
    }
  }
  throw new Error('Failed to parse: ' + content);
}

async function testGeo() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('Set GROQ_API_KEY before running this test.');

  const queries = ["Tokyo", "Eiffel Tower", "The Colosseum in Rome, Italy was built during the Roman Empire"];

  for (const q of queries) {
    console.log(`\nTesting Geo-Explorer for: "${q}"...`);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are a geographical and historical intelligence system. Analyze the place/location. Keep reasoning brief. Return ONLY valid JSON schema without markdown: {"name": "...", "country": "...", "lat": 0.0, "lon": 0.0, "summary": "...", "famousFor": ["...", "..."], "historicalFacts": ["...", "..."]}. Approximate lat/lon decimal coordinates accurately.'
          },
          { role: 'user', content: q }
        ],
        max_tokens: 2048,
        temperature: 0.3
      })
    });
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || data;
    console.log('Raw output:', raw);
    try {
      const parsed = extractJSON(raw);
      console.log('Parsed successfully:');
      console.log('- Name:', parsed.name);
      console.log('- Country:', parsed.country);
      console.log('- Lat:', parsed.lat, 'Lon:', parsed.lon, typeof parsed.lat, typeof parsed.lon);
      console.log('- Summary:', parsed.summary?.slice(0, 50) + '...');
      console.log('- Famous for count:', parsed.famousFor?.length);
      console.log('- Historical facts count:', parsed.historicalFacts?.length);
    } catch (e) {
      console.error('Extract error:', e.message);
    }
  }
}

testGeo();

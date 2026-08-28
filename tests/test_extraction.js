const assert = require('assert');

function extractJSON(content) {
  if (typeof content !== 'string') {
    content = String(content || '');
  }

  // Strip reasoning <think> tags from models
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // Strip markdown code fences
  let unquoted = cleaned
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(unquoted);
  } catch (e) {}

  // Extract first valid JSON object {} or array []
  const match = unquoted.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) {
    const rawJson = match[0];
    try {
      return JSON.parse(rawJson);
    } catch (e) {
      // Remove trailing commas and non-printable control characters
      const sanitized = rawJson
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      try {
        return JSON.parse(sanitized);
      } catch (innerErr) {}
    }
  }

  throw new Error('Failed to parse structured JSON from AI response.');
}

// Test 1: Markdown code fence with <think> tag and trailing comma
const t1 = `<think>
Let's analyze the text and format the output.
</think>
\`\`\`json
{
  "tag": "Research",
  "tldr": "Quantum computing uses qubits for superdense computation.",
  "bullets": [
    "Superposition allows parallel states",
    "Entanglement connects qubits",
  ],
  "actions": [
    "Read quantum physics papers",
  ]
}
\`\`\``;

const r1 = extractJSON(t1);
assert.strictEqual(r1.tag, 'Research');
assert.strictEqual(r1.bullets.length, 2);
console.log('✓ Test 1 Passed (Markdown + <think> + Trailing Commas)');

// Test 2: Conversational preamble and postscript
const t2 = `Here is the requested mindmap JSON structure:
{
  "nodes": [{"id": 1, "label": "Artificial Intelligence"}, {"id": 2, "label": "Machine Learning"}],
  "edges": [{"from": 1, "to": 2, "label": "includes"}]
}
Hope this structure matches your application requirements!`;

const r2 = extractJSON(t2);
assert.strictEqual(r2.nodes.length, 2);
assert.strictEqual(r2.edges[0].label, 'includes');
console.log('✓ Test 2 Passed (Conversational wrapper)');

// Test 3: Dictionary with Phonetics & Synonyms
const t3 = `{
  "word": "ephemeral",
  "pronunciation": "/ɪˈfem.ər.əl/",
  "definition": "Lasting for a very short time",
  "contextualMeaning": "Short-lived experience",
  "synonyms": ["transient", "fleeting", "momentary"],
  "antonyms": ["permanent", "eternal"],
  "eli5": "Like a soap bubble that only lasts for a moment before popping."
}`;

const r3 = extractJSON(t3);
assert.strictEqual(r3.word, 'ephemeral');
assert.strictEqual(r3.synonyms.length, 3);
console.log('✓ Test 3 Passed (Dictionary Schema)');

// Test 4: Geo-Explore Coordinates
const t4 = `{
  "name": "Kyoto",
  "country": "Japan",
  "lat": 35.0116,
  "lon": 135.7681,
  "summary": "Historic cultural capital of Japan with thousands of classical Buddhist temples.",
  "famousFor": ["Fushimi Inari", "Kinkaku-ji", "Geisha District"],
  "historicalFacts": ["Imperial capital from 794 to 1868", "Spared from atomic bombing during WWII"]
}`;

const r4 = extractJSON(t4);
assert.strictEqual(r4.name, 'Kyoto');
assert.strictEqual(r4.lat, 35.0116);
console.log('✓ Test 4 Passed (Geo-Explorer Schema)');

console.log('\nAll 4 extraction and parsing tests passed perfectly!');


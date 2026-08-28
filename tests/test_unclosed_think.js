function extractJSON(content) {
  if (typeof content !== 'string') {
    content = String(content || '');
  }

  // 1. First try stripping complete <think>...</think> blocks
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Try direct parse
  if (cleaned) {
    try { return JSON.parse(cleaned); } catch (e) {}

    let unquoted = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try { return JSON.parse(unquoted); } catch (e) {}

    const match = unquoted.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e) {
        const sanitized = match[0].replace(/,\s*([}\]])/g, '$1').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        try { return JSON.parse(sanitized); } catch (innerErr) {}
      }
    }
  }

  // 2. If cleaned was empty or failed (e.g. unclosed <think> or JSON generated inside reasoning),
  // extract from the FULL raw content!
  const rawMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (rawMatch) {
    try { return JSON.parse(rawMatch[0]); } catch (e) {
      const sanitized = rawMatch[0].replace(/,\s*([}\]])/g, '$1').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      try { return JSON.parse(sanitized); } catch (innerErr) {}
    }
  }

  // 3. Try to find the last complete JSON block inside content
  const matches = content.match(/\{[^{}]*("name"|"title"|"tldr"|"word")[^{}]*\}/g);
  if (matches && matches.length > 0) {
    try { return JSON.parse(matches[matches.length - 1]); } catch (e) {}
  }

  throw new Error('Failed to parse structured JSON from AI response.');
}

// Test with unclosed <think> tag that has JSON inside
const unclosedThink = `<think>
Here is my plan:
\`\`\`json
{
  "name": "Colosseum",
  "country": "Italy",
  "lat": 41.8902,
  "lon": 12.4922,
  "summary": "Ancient Roman amphitheatre",
  "famousFor": ["Gladiators"],
  "historicalFacts": ["Built in 72 AD"]
}
\`\`\`
Now generating final output... [truncated before </think>`;

const parsed = extractJSON(unclosedThink);
console.log('Successfully extracted from unclosed think block:');
console.log(parsed);

function repairTruncatedJSON(jsonStr) {
  let cleaned = jsonStr.trim();
  let inString = false;
  let isEscaped = false;
  const stack = [];

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (ch === '\\' && !isEscaped) {
        isEscaped = true;
      } else {
        if (ch === '"' && !isEscaped) {
          inString = false;
        }
        isEscaped = false;
      }
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === '{') {
        stack.push('}');
      } else if (ch === '[') {
        stack.push(']');
      } else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
  }

  if (inString) {
    cleaned += '"';
  }

  cleaned = cleaned.replace(/,\s*$/, '');

  while (stack.length > 0) {
    cleaned = cleaned.replace(/,\s*$/, '');
    cleaned += stack.pop();
  }

  return cleaned;
}

const truncated = '{"title": "Test Infographic", "sections": [{"heading": "Sec 1", "icon": "📊", "points": ["Point 1", "Point 2';
const repaired = repairTruncatedJSON(truncated);
console.log('Repaired JSON:', repaired);
const parsed = JSON.parse(repaired);
console.log('Parsed successfully:', parsed.title, parsed.sections.length);


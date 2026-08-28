const longArticle = `
Artificial Intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition has since been rejected by major AI researchers who now explain AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.

AI applications include advanced web search engines (e.g., Google Search), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), and automated decision-making in financial trading and medical diagnosis.

Artificial intelligence was founded as an academic discipline in 1956, and in the years since has experienced several waves of optimism, followed by disappointment and the loss of funding (known as an "AI winter"), followed by new approaches, success, and renewed funding. AI research has tried and discarded many different approaches since its founding, including simulating the brain, modeling human problem solving, formal logic, large databases of knowledge, and imitating animal behavior. In the first decades of the 21st century, highly mathematical and statistical machine learning has dominated the field, and this technique has proved highly successful, helping to solve many challenging problems throughout industry and academia.

The various sub-fields of AI research are centered around particular goals and the use of particular tools. The traditional goals of AI research include reasoning, knowledge representation, planning, learning, natural language processing, perception, and support for robotics. General intelligence (the ability to solve an arbitrary problem) is among the field's long-term goals. To solve these problems, AI researchers use search and mathematical optimization, formal logic, artificial neural networks, and methods based on statistics, probability, and economics. AI also draws upon computer science, psychology, linguistics, philosophy, and many other fields.
`;

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
  throw new Error('Failed to parse: ' + content.substring(0, 100));
}

async function testOptimized() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('Set GROQ_API_KEY before running this test.');

  // 1. Infographic Test
  console.log('--- Testing Optimized Infographic with max_tokens: 4096 ---');
  const infoRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          content: 'You are an infographic generator. Synthesize the provided text into 4 to 6 concise visual card sections. Keep reasoning brief. Return ONLY valid JSON schema without markdown blocks: {"title": "Title", "sections": [{"heading": "Section Heading", "icon": "📊", "points": ["Point 1", "Point 2"]}]}'
        },
        { role: 'user', content: longArticle.slice(0, 8000) }
      ],
      max_tokens: 4096,
      temperature: 0.2
    })
  });
  const infoData = await infoRes.json();
  const infoContent = infoData?.choices?.[0]?.message?.content || '';
  console.log('Finish reason:', infoData?.choices?.[0]?.finish_reason);
  const parsedInfo = extractJSON(infoContent);
  console.log('Parsed Infographic sections count:', parsedInfo.sections.length);
  console.log('Infographic Title:', parsedInfo.title);

  // 2. Mindmap Test
  console.log('\n--- Testing Optimized Mind Map with max_tokens: 4096 ---');
  const mmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          content: 'You are a mind map generator. Extract 6 to 10 core concepts and their relationships from the text into a clean hierarchy. Keep reasoning brief. Return ONLY valid JSON schema without markdown: {"nodes": [{"id": 1, "label": "Central Topic"}, {"id": 2, "label": "Subtopic A"}], "edges": [{"from": 1, "to": 2, "label": "relates to"}]}'
        },
        { role: 'user', content: longArticle.slice(0, 8000) }
      ],
      max_tokens: 4096,
      temperature: 0.2
    })
  });
  const mmData = await mmRes.json();
  const mmContent = mmData?.choices?.[0]?.message?.content || '';
  console.log('Finish reason:', mmData?.choices?.[0]?.finish_reason);
  const parsedMm = extractJSON(mmContent);
  console.log('Parsed Mindmap nodes count:', parsedMm.nodes.length);
  console.log('Parsed Mindmap edges count:', parsedMm.edges.length);
}

testOptimized();


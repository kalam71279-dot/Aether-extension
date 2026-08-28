const longArticle = `
Artificial Intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition has since been rejected by major AI researchers who now explain AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.

AI applications include advanced web search engines (e.g., Google Search), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), and automated decision-making in financial trading and medical diagnosis.

Artificial intelligence was founded as an academic discipline in 1956, and in the years since has experienced several waves of optimism, followed by disappointment and the loss of funding (known as an "AI winter"), followed by new approaches, success, and renewed funding. AI research has tried and discarded many different approaches since its founding, including simulating the brain, modeling human problem solving, formal logic, large databases of knowledge, and imitating animal behavior. In the first decades of the 21st century, highly mathematical and statistical machine learning has dominated the field, and this technique has proved highly successful, helping to solve many challenging problems throughout industry and academia.

The various sub-fields of AI research are centered around particular goals and the use of particular tools. The traditional goals of AI research include reasoning, knowledge representation, planning, learning, natural language processing, perception, and support for robotics. General intelligence (the ability to solve an arbitrary problem) is among the field's long-term goals. To solve these problems, AI researchers use search and mathematical optimization, formal logic, artificial neural networks, and methods based on statistics, probability, and economics. AI also draws upon computer science, psychology, linguistics, philosophy, and many other fields.
`;

async function testLongText() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('Set GROQ_API_KEY before running this test.');

  // Test Infographic
  console.log('Testing Infographic with long text...');
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
          content: 'You are a visual infographic designer. Structure key information into visual section cards. Return ONLY valid JSON schema: {"title": "Infographic Title", "sections": [{"heading": "Section Heading", "icon": "📊", "points": ["Key point 1", "Key point 2"]}]}. Choose suitable emojis for icons. Do NOT include markdown code blocks.'
        },
        { role: 'user', content: longArticle }
      ],
      max_tokens: 1500,
      temperature: 0.2
    })
  });
  const infoData = await infoRes.json();
  console.log('\n--- Infographic Raw Output ---');
  console.log(infoData?.choices?.[0]?.message?.content || infoData);
  console.log('Finish Reason:', infoData?.choices?.[0]?.finish_reason);

  // Test Mindmap
  console.log('\nTesting Mindmap with long text...');
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
          content: 'You are a mind map generator. Analyze the text and structure a concept map. Return ONLY valid JSON schema: {"nodes": [{"id": 1, "label": "Main Topic"}, {"id": 2, "label": "Subtopic A"}], "edges": [{"from": 1, "to": 2, "label": "relates to"}]}. Do NOT include markdown code blocks or explanations.'
        },
        { role: 'user', content: longArticle }
      ],
      max_tokens: 1500,
      temperature: 0.2
    })
  });
  const mmData = await mmRes.json();
  console.log('\n--- Mindmap Raw Output ---');
  console.log(mmData?.choices?.[0]?.message?.content || mmData);
  console.log('Finish Reason:', mmData?.choices?.[0]?.finish_reason);
}

testLongText();


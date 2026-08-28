/**
 * Aether OS - Background Service Worker
 * Handles AI API interactions, image encoding, and browser action events.
 */

const DEFAULT_OPENAI_PROVIDER = 'groq';
const DEFAULT_OPENAI_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_OPENAI_MODEL = 'qwen/qwen3.8-27b';
const DEFAULT_GROQ_VISION_MODEL = 'qwen/qwen3.6-27b';

/**
 * Fetch and convert an image URL to a Base64 Data URL.
 */
async function getBase64Image(url) {
  if (!url) throw new Error('No image URL provided');
  if (url.startsWith('data:')) return url;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: HTTP ${response.status}`);
  }

  try {
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${btoa(binary)}`;
  } catch (err) {
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image as data URL'));
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * Extract text content from OpenAI, Groq, OpenRouter, Gemini or Anthropic format response.
 */
function extractContentFromResponse(responseData) {
  if (responseData?.choices?.[0]?.message?.content) {
    const content = responseData.choices[0].message.content;
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content.map(part => typeof part === 'string' ? part : (part?.text || '')).join('');
    }
  }

  if (responseData?.candidates?.[0]?.content?.parts) {
    return responseData.candidates[0].content.parts.map(part => part?.text || '').join('');
  }

  if (responseData?.output?.[0]?.content?.[0]?.text) {
    return responseData.output[0].content[0].text;
  }

  return null;
}

/**
 * Remove provider reasoning and presentation wrappers from user-facing prose.
 */
function cleanAIReply(content, preserveMarkdown = false) {
  if (typeof content !== 'string') return String(content || '').trim();

  let cleaned = content
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .replace(/<\|(?:begin|end)_of_text\|>|<\|(?:start|end)_header_id\|>|<\|(?:eot|im_end|im_start)\|>/gi, '')
    .replace(/<\|channel\|>\s*(?:analysis|final|commentary)?\s*<\|message\|>/gi, '')
    .replace(/<\|(?:channel|analysis|assistant|final|message)\|>/gi, '')
    .replace(/^\s*(?:assistant|final answer|answer)\s*:\s*/i, '')
    .replace(/^\s*```(?:markdown|md|text)?\s*/i, '')
    .replace(/\s*```\s*$/i, '');

  if (!preserveMarkdown) {
    cleaned = cleaned
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1');
  }

  return cleaned
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Call the configured AI provider.
 */
async function callAI(payload) {
  try {
    const data = await chrome.storage.local.get(['apiKey', 'apiEndpoint', 'apiModel', 'apiProvider']);
    const provider = data.apiProvider || DEFAULT_OPENAI_PROVIDER;
    const storedApiKey = data.apiKey !== undefined && data.apiKey !== null && data.apiKey !== '' ? data.apiKey : '';
    const apiKey = storedApiKey;
    
    let apiEndpoint = data.apiEndpoint;
    if (!apiEndpoint) {
      if (provider === 'openai') apiEndpoint = 'https://api.openai.com/v1/chat/completions';
      else if (provider === 'groq') apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
      else if (provider === 'openrouter') apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
      else if (provider === 'pollinations') apiEndpoint = 'https://text.pollinations.ai/openai';
      else apiEndpoint = DEFAULT_OPENAI_ENDPOINT;
    }

    let apiModel = payload.model || data.apiModel;
    if (payload.isVision) {
      if (provider === 'groq') apiModel = DEFAULT_GROQ_VISION_MODEL;
      else if (provider === 'openrouter') apiModel = 'meta-llama/llama-3.2-11b-vision-instruct';
    } else if (!apiModel || apiModel.includes('llama-3.2-11b-vision-preview') || apiModel.includes('llama-3.3-70b-versatile') || apiModel === 'qwen/qwen3.6-27b') {
      if (provider === 'openai') apiModel = 'gpt-4o-mini';
      else if (provider === 'groq') apiModel = DEFAULT_OPENAI_MODEL;
      else if (provider === 'openrouter') apiModel = 'meta-llama/llama-3.3-70b-instruct';
      else if (provider === 'pollinations') apiModel = 'openai';
      else apiModel = DEFAULT_OPENAI_MODEL;
    }

    if (!apiKey && provider !== 'pollinations' && !apiEndpoint.includes('pollinations.ai')) {
      return { error: 'NO_API_KEY', message: 'Please configure your API key in Aether OS settings.' };
    }

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: apiModel,
        messages: payload.messages,
        max_tokens: payload.max_tokens || 2048,
        temperature: payload.temperature !== undefined ? payload.temperature : 0.3
      })
    });

    const responseData = await response.json();
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      return {
        error: 'RATE_LIMITED',
        message: retryAfter
          ? `Groq rate limit reached. Try again in ${retryAfter} seconds.`
          : 'Groq rate limit reached. Please wait a moment and try again.'
      };
    }
    const content = extractContentFromResponse(responseData);

    if (content) {
      return { success: true, content };
    }

    let errorMsg = 'Unknown API error';
    if (responseData.error) {
      errorMsg = typeof responseData.error === 'string' ? responseData.error : (responseData.error.message || JSON.stringify(responseData.error));
    } else if (Array.isArray(responseData) && responseData[0] && responseData[0].error) {
      errorMsg = JSON.stringify(responseData[0].error);
    } else {
      errorMsg = JSON.stringify(responseData);
    }
    return { error: 'API_ERROR', message: errorMsg };
  } catch (error) {
    return { error: 'NETWORK_ERROR', message: error.message };
  }
}

/**
 * Stack-based JSON repair for truncated model outputs.
 */
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

/**
 * Robust JSON extraction handling <think> tags, markdown fences, trailing commas, unclosed reasoning, and preambles.
 */
function extractJSON(content) {
  if (typeof content !== 'string') {
    content = String(content || '');
  }

  // 1. Strip reasoning <think> tags from models
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  if (cleaned) {
    try { return JSON.parse(cleaned); } catch (e) {}

    let unquoted = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try { return JSON.parse(unquoted); } catch (e) {}

    const match = unquoted.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      const rawJson = match[0];
      try {
        return JSON.parse(rawJson);
      } catch (e) {
        const sanitized = rawJson
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        try {
          return JSON.parse(sanitized);
        } catch (innerErr) {
          try {
            return JSON.parse(repairTruncatedJSON(sanitized));
          } catch (repairErr) {}
        }
      }
    }

    try {
      return JSON.parse(repairTruncatedJSON(unquoted));
    } catch (finalErr) {}
  }

  // 2. Fallback: Search the full raw content if <think> was unclosed
  const rawMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (rawMatch) {
    const rawJson = rawMatch[0];
    try { return JSON.parse(rawJson); } catch (e) {
      const sanitized = rawJson
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      try { return JSON.parse(sanitized); } catch (innerErr) {
        try { return JSON.parse(repairTruncatedJSON(sanitized)); } catch (repairErr) {}
      }
    }
  }

  // 3. Fallback: Search for any completed JSON object with standard keys inside the text
  const objectMatches = content.match(/\{[^{}]*("(?:name|title|tldr|word|lat|nodes|sections)")[^{}]*\}/g);
  if (objectMatches && objectMatches.length > 0) {
    for (let i = objectMatches.length - 1; i >= 0; i--) {
      try { return JSON.parse(objectMatches[i]); } catch (e) {}
    }
  }

  throw new Error('Failed to parse structured JSON from AI response.');
}

// Lifecycle Events
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['apiKey', 'apiProvider', 'apiEndpoint', 'apiModel'], (data) => {
    if (!data.apiKey || data.apiKey === LEGACY_OPENAI_API_KEY || !data.apiModel || data.apiModel === 'openai/gpt-oss-120b' || data.apiModel.includes('llama-3.2-11b-vision-preview') || data.apiModel.includes('llama-3.3-70b-versatile') || data.apiModel === 'qwen/qwen3.6-27b') {
      chrome.storage.local.set({
        apiProvider: DEFAULT_OPENAI_PROVIDER,
        apiEndpoint: DEFAULT_OPENAI_ENDPOINT,
        apiModel: DEFAULT_OPENAI_MODEL,
        apiKey: data.apiKey === LEGACY_OPENAI_API_KEY ? DEFAULT_OPENAI_API_KEY : (data.apiKey || DEFAULT_OPENAI_API_KEY)
      });
    }
  });

  chrome.contextMenus.create({
    id: 'aether-analyze-image',
    title: 'Analyze Image with Aether OS',
    contexts: ['image']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'aether-analyze-image') {
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'analyzeImage', imageUrl: info.srcUrl });
    }
  }
});

const FOCUS_SOCIAL_HOSTS = ['youtube.com', 'facebook.com', 'reddit.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com'];
const FOCUS_RESEARCH_HOSTS = ['wikipedia.org', 'stackoverflow.com', 'stackexchange.com', 'github.com', 'arxiv.org', 'jstor.org', 'pubmed.ncbi.nlm.nih.gov', 'scholar.google.com', 'sciencedirect.com', 'ieee.org', 'acm.org', 'nature.com'];

function hostMatches(hostname, domains) {
  return domains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
}

function shouldBlockFocusUrl(url, mode) {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) return false;
    if (mode === 'strict') return hostMatches(parsed.hostname, FOCUS_SOCIAL_HOSTS);
    if (mode === 'research') return hostMatches(parsed.hostname, FOCUS_SOCIAL_HOSTS);
  } catch (error) {
    return false;
  }
  return false;
}

chrome.webNavigation.onBeforeNavigate.addListener(details => {
  if (details.frameId !== 0 || details.tabId < 0) return;
  chrome.storage.local.get(['aetherFocusMode'], result => {
    const focus = result.aetherFocusMode;
    if (!focus?.active || !shouldBlockFocusUrl(details.url, focus.mode)) return;
    const blockedUrl = chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(details.url)}`);
    chrome.tabs.update(details.tabId, { url: blockedUrl });
  });
});

// Runtime Message Dispatcher
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setFocusMode') {
    const focus = message.active ? {
      active: true,
      mode: message.mode === 'research' ? 'research' : 'strict',
      goal: String(message.goal || '').trim().slice(0, 240),
      startedAt: Date.now()
    } : { active: false };
    chrome.storage.local.set({ aetherFocusMode: focus }, () => sendResponse({ success: true, focus }));
    return true;
  }

  // 1. Summarize
  if (message.type === 'summarize') {
    const cleanText = (message.text || '').slice(0, 12000);
    const messages = [
      {
        role: 'system',
        content: 'You are an expert AI summarizer. Analyze the text and return ONLY valid JSON matching this schema: {"tag": "Research"|"Coding"|"General", "tldr": "...", "bullets": ["...", "..."], "actions": ["...", "..."]}. Keep reasoning brief. Do NOT wrap in markdown code fences.'
      },
      { role: 'user', content: cleanText }
    ];
    callAI({ messages, max_tokens: 2048, temperature: 0.3 }).then(result => {
      if (result.success) {
        try {
          const parsed = extractJSON(result.content);
          sendResponse({ success: true, data: parsed });
        } catch (e) {
          sendResponse({
            success: true,
            data: {
              tag: 'General',
              tldr: result.content.replace(/```[a-z]*\s*|```/gi, '').trim(),
              bullets: [],
              actions: []
            }
          });
        }
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  // Translate
  if (message.type === 'translate') {
    const cleanText = (message.text || '').slice(0, 12000);
    const targetLang = message.targetLang || 'English';
    const messages = [
      {
        role: 'system',
        content: `You are an expert translator. Translate the following text into ${targetLang}. Return ONLY the translated text without any explanation, markdown formatting, or quotes.`
      },
      { role: 'user', content: cleanText }
    ];
    callAI({ messages, max_tokens: 2048, temperature: 0.3 }).then(result => {
      if (result.success) {
        sendResponse({ success: true, data: result.content });
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  // 2. Mind Map
  if (message.type === 'mindmap') {
    const cleanText = (message.text || '').slice(0, 12000);
    const messages = [
      {
        role: 'system',
        content: 'You are a mind map generator. Synthesize the text into a clean concept map with 6 to 10 core topic nodes and their relationships. Keep reasoning brief. Return ONLY valid JSON schema without markdown: {"nodes": [{"id": 1, "label": "Central Topic"}, {"id": 2, "label": "Subtopic A"}], "edges": [{"from": 1, "to": 2, "label": "relates to"}]}'
      },
      { role: 'user', content: cleanText }
    ];
    callAI({ messages, max_tokens: 2048, temperature: 0.2 }).then(result => {
      if (result.success) {
        try {
          const parsed = extractJSON(result.content);
          sendResponse({ success: true, data: parsed });
        } catch (e) {
          sendResponse({ success: false, error: 'JSON Parse Error: ' + e.message });
        }
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  // 3. Infographic
  if (message.type === 'infographic') {
    const cleanText = (message.text || '').slice(0, 12000);
    const messages = [
      {
        role: 'system',
        content: 'You are an infographic designer. Synthesize the text into 4 to 6 concise visual card sections with relevant emoji icons. Keep reasoning brief. Return ONLY valid JSON schema without markdown: {"title": "Infographic Title", "sections": [{"heading": "Section Heading", "icon": "📊", "points": ["Key point 1", "Key point 2"]}]}'
      },
      { role: 'user', content: cleanText }
    ];
    callAI({ messages, max_tokens: 2048, temperature: 0.2 }).then(result => {
      if (result.success) {
        try {
          const parsed = extractJSON(result.content);
          sendResponse({ success: true, data: parsed });
        } catch (e) {
          sendResponse({ success: false, error: 'JSON Parse Error: ' + e.message });
        }
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  // Conversational follow-ups for structured tools
  if (message.type === 'featureChat') {
    const toolPrompts = {
      summarize: 'You are continuing a conversation about a summary. Answer the user\'s follow-up clearly and use the summarized source as context.',
      mindmap: 'You are continuing a conversation about a mind map. Explain concepts and relationships from the source clearly. Do not generate JSON unless the user asks for it.',
      infographic: 'You are continuing a conversation about an infographic. Answer questions about its source and sections clearly. Do not generate JSON unless the user asks for it.',
      geo: 'You are continuing a conversation about a location. Answer follow-up questions accurately and use the location context from the conversation.'
    };
    const toolId = message.toolId;
    const history = Array.isArray(message.messages) ? message.messages : [];
    if (!toolPrompts[toolId] || history.length < 2) {
      sendResponse({ success: false, error: 'Invalid feature conversation.' });
      return true;
    }
    const messages = [
      { role: 'system', content: toolPrompts[toolId] },
      ...history.slice(-12).map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: String(item.content || '').slice(0, 6000)
      }))
    ];
    callAI({ messages, max_tokens: 2048, temperature: 0.3 }).then(result => {
      if (result.success) sendResponse({ success: true, data: result.content });
      else sendResponse({ success: false, error: result.message });
    });
    return true;
  }

  // 4. Dictionary
  if (message.type === 'dictionary') {
    const cleanWord = (message.word || '').slice(0, 200);
    const cleanContext = (message.context || '').slice(0, 1000);
    const messages = [
      {
        role: 'system',
        content: 'You are a context-aware dictionary assistant. Define the requested word or phrase. Keep reasoning brief. Return ONLY valid JSON schema without markdown: {"word": "...", "pronunciation": "/.../", "definition": "...", "contextualMeaning": "...", "synonyms": ["...", "..."], "antonyms": ["...", "..."], "eli5": "..."}'
      },
      { role: 'user', content: `Word: ${cleanWord}\nContext: ${cleanContext || 'Not provided'}` }
    ];
    callAI({ messages, max_tokens: 2048, temperature: 0.3 }).then(result => {
      if (result.success) {
        try {
          const parsed = extractJSON(result.content);
          sendResponse({ success: true, data: parsed });
        } catch (e) {
          sendResponse({
            success: true,
            data: {
              word: cleanWord,
              definition: result.content,
              contextualMeaning: result.content,
              synonyms: [],
              antonyms: [],
              eli5: ''
            }
          });
        }
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  // 5. Geo-Explore
  if (message.type === 'geoExplore') {
    const cleanLocation = (message.location || '').slice(0, 1000);
    const messages = [
      {
        role: 'system',
        content: 'You are a geographical intelligence system. Identify the place, city, landmark, or location from the user input. Return ONLY valid JSON schema without markdown: {"name": "Location Name", "country": "Country Name", "lat": 0.0, "lon": 0.0, "summary": "2-3 sentence overview of this location", "famousFor": ["Famous item 1", "Famous item 2"], "historicalFacts": ["Historical fact 1", "Historical fact 2"]}. Approximate decimal lat/lon coordinates accurately. Keep reasoning brief.'
      },
      { role: 'user', content: cleanLocation }
    ];
    callAI({ messages, max_tokens: 2048, temperature: 0.2 }).then(result => {
      if (result.success) {
        try {
          const parsed = extractJSON(result.content);
          sendResponse({ success: true, data: parsed });
        } catch (e) {
          sendResponse({ success: false, error: 'JSON Parse Error: ' + e.message });
        }
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  // 6. Image Analysis AI
  if (message.type === 'analyzeImageAI') {
    getBase64Image(message.imageUrl).then(base64Url => {
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image concisely. Provide a short visual description, detected OCR text, and up to 6 key items. Return ONLY valid JSON: {"description": "...", "ocrText": "...", "identifiedItems": ["...", "..."]}. Do NOT wrap in markdown code blocks.'
            },
            {
              type: 'image_url',
              image_url: { url: base64Url }
            }
          ]
        }
      ];
      return callAI({ messages, isVision: true, max_tokens: 500 });
    }).then(result => {
      if (result.success) {
        try {
          const parsed = extractJSON(result.content);
          sendResponse({ success: true, data: parsed });
        } catch (e) {
          sendResponse({
            success: true,
            data: {
              description: result.content,
              ocrText: '',
              identifiedItems: []
            }
          });
        }
      } else {
        sendResponse({ success: false, error: result.message });
      }
    }).catch(err => {
      sendResponse({ success: false, error: 'Failed to process image: ' + err.message });
    });
    return true;
  }

  // 7. Image Follow-up Question
  if (message.type === 'imageQuestion') {
    getBase64Image(message.imageUrl).then(base64Url => {
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Answer this question about the image directly and briefly: ${message.question}. Describe only what is visible or clearly inferable. Do not provide internal reasoning or an empty response.` },
            { type: 'image_url', image_url: { url: base64Url } }
          ]
        }
      ];
      return callAI({ messages, isVision: true, max_tokens: 700 });
    }).then(result => {
      if (result.success) {
        const answer = cleanAIReply(result.content);
        sendResponse(answer ? { success: true, answer } : { success: false, error: 'The vision model returned an empty answer.' });
      } else {
        sendResponse({ success: false, error: result.message });
      }
    }).catch(err => {
      sendResponse({ success: false, error: 'Failed to process image: ' + err.message });
    });
    return true;
  }

  // 8. API Status check
  // AI Chat (free-form conversation)
  if (message.type === 'aiChat') {
    const messages = message.messages || [];
    if (!messages.some(item => item?.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: 'Answer the user directly and concisely. Use short paragraphs or bullets when helpful. Do not show internal reasoning, planning, provider markers, or filler such as "Sure" or "Here is". Return only the useful answer.'
      });
    }
    callAI({ messages, max_tokens: 1200, temperature: 0.7 }).then(result => {
      if (result.success) {
        sendResponse({ success: true, data: cleanAIReply(result.content) });
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  if (message.type === 'getApiStatus') {
    chrome.storage.local.get(['apiKey', 'apiProvider'], (data) => {
      const isConfigured = !!data.apiKey || data.apiProvider === 'pollinations' || !!DEFAULT_OPENAI_API_KEY;
      sendResponse({ configured: isConfigured });
    });
    return true;
  }

  // 9. Web Grounding — Search Pipeline (DuckDuckGo + Wikipedia Fallback)
  if (message.type === 'EXECUTE_SEARCH_GROUNDING') {
    const query = (message.payload?.query || '').trim().slice(0, 300);
    if (!query) {
      sendResponse({ success: false, error: 'No search query provided.' });
      return true;
    }

    (async () => {
      let heading = '';
      let abstract = '';
      let displayAbstract = '';
      let url = '';
      let thumbnail = '';
      let source = '';

      try {
        // 1. DuckDuckGo Instant Answer API
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const ddgResp = await fetch(ddgUrl);
        if (ddgResp.ok) {
          const ddgData = await ddgResp.json();
          heading = ddgData.Heading || '';
          abstract = ddgData.AbstractText || '';
          url = ddgData.AbstractURL || '';
          if (ddgData.Image) {
            thumbnail = ddgData.Image.startsWith('http') ? ddgData.Image : `https://duckduckgo.com${ddgData.Image}`;
          }

          if (!abstract && ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
            for (const topic of ddgData.RelatedTopics) {
              if (topic.Text) {
                abstract = topic.Text;
                url = topic.FirstURL || url;
                break;
              }
              if (topic.Topics && topic.Topics.length > 0 && topic.Topics[0].Text) {
                abstract = topic.Topics[0].Text;
                url = topic.Topics[0].FirstURL || url;
                break;
              }
            }
          }
          if (abstract) source = 'DuckDuckGo';
          displayAbstract = abstract;
        }
      } catch (e) { }

      // 2. DuckDuckGo HTML Web Search (Explore the web)
      try {
        const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const htmlResp = await fetch(htmlUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (htmlResp.ok) {
          const html = await htmlResp.text();
          // Extract title, url, snippet
          const matches = [...html.matchAll(/<h2 class="result__title">[\s\S]*?<a class="result__url" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi)];
          
          if (matches.length > 0) {
            let webResults = '\n\n--- WEB SEARCH RESULTS ---\n';
            matches.slice(0, 5).forEach((m, idx) => {
              let realUrl = m[1];
              if (realUrl.includes('uddg=')) {
                try { realUrl = decodeURIComponent(realUrl.split('uddg=')[1].split('&')[0]); } catch(e){}
              }
              const title = m[2].replace(/<\/?[^>]+(>|$)/g, '').trim();
              const snippet = m[3].replace(/<\/?[^>]+(>|$)/g, '').trim();
              webResults += `[${idx+1}] ${title}\nURL: ${realUrl}\nSnippet: ${snippet}\n\n`;
            });
            
            abstract = (abstract ? abstract + '\n' : '') + webResults;
            if (!displayAbstract) {
              displayAbstract = matches[0][3].replace(/<\/?[^>]+(>|$)/g, '').trim();
            }
            if (!heading) heading = query;
            if (!source) source = 'Web Search';
          }
        }
      } catch (e) { }

      // 3. Fallback: Wikipedia REST API
      if (!abstract) {
        try {
          const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`;
          const wikiSearchResp = await fetch(wikiSearchUrl);
          if (wikiSearchResp.ok) {
            const wikiSearchData = await wikiSearchResp.json();
            const searchResults = wikiSearchData.query?.search || [];
            if (searchResults.length > 0) {
              const firstTitle = searchResults[0].title;
              const wikiSummaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstTitle)}`;
              const wikiSummaryResp = await fetch(wikiSummaryUrl);
              if (wikiSummaryResp.ok) {
                const summaryData = await wikiSummaryResp.json();
                heading = summaryData.title || firstTitle;
                abstract = summaryData.extract || '';
                url = summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(firstTitle)}`;
                thumbnail = summaryData.thumbnail?.source || '';
                source = 'Wikipedia';
              }
            }
          }
        } catch (wikiErr) { }
      }

      if (abstract) {
        sendResponse({ success: true, data: {
          heading,
          abstract,
          displayAbstract: (displayAbstract || abstract).slice(0, 700),
          url,
          thumbnail,
          source
        } });
      } else {
        sendResponse({ success: false, error: 'No results found on the web for this query.' });
      }
    })();
    return true;
  }

  // 10. Synthesize Grounded Answer — Combine vision/query + web data via AI
  if (message.type === 'SYNTHESIZE_GROUNDED_ANSWER') {
    const originalQuery = (message.payload?.query || '').slice(0, 2000);
    const searchAbstract = (message.payload?.abstract || '').slice(0, 8000);
    const searchHeading = (message.payload?.heading || '');
    const imageDescription = (message.payload?.imageDescription || '');

    let userContent = '';
    if (imageDescription) {
      userContent = `Visual Observation: ${imageDescription}\n\nSearch Query: ${originalQuery}\n\nWeb Search Result (${searchHeading}): ${searchAbstract}`;
    } else {
      userContent = `User Query: ${originalQuery}\n\nWeb Search Result (${searchHeading}): ${searchAbstract}`;
    }

    const messages = [
      {
        role: 'system',
        content: 'Synthesize a definitive, grounded answer combining the visual observation (if provided) and the verified web search abstract. Explicitly filter out any irrelevant navigation, boilerplate, or footer text from the search data. Return ONLY a properly categorized, summarized explanation of the search results. Highlight exact names, dates, locations, or identities. Be concise but authoritative. Do not speculate beyond what the sources confirm. Use Markdown formatting (headers, bullet points, bold text) to render the answer cleanly.'
      },
      { role: 'user', content: userContent }
    ];

    callAI({ messages, max_tokens: 1000, temperature: 0.2 }).then(result => {
      if (result.success) {
        sendResponse({ success: true, data: cleanAIReply(result.content, true) });
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }

  if (message.type === 'GET_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        sendResponse({ success: true, tab: tabs[0] });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }

  if (message.type === 'GET_ALL_TABS') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs: tabs || [] });
    });
    return true;
  }

  if (message.type === 'SWITCH_TO_TAB') {
    const tabId = message.tabId;
    chrome.tabs.update(tabId, { active: true }, () => {
      chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, { focused: true }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  // 11. Polish Text — Writing Assistant Backend
  if (message.type === 'POLISH_TEXT') {
    const text = (message.payload?.text || '').slice(0, 8000);
    const action = message.payload?.action || 'fix_grammar';
    const context = (message.payload?.context || '').slice(0, 1000);
    const targetLang = message.payload?.targetLang || 'English';

    if (!text) {
      sendResponse({ success: false, error: 'No text provided.' });
      return true;
    }

    const systemPrompts = {
      fix_grammar: 'You are an expert copy editor. Fix all grammar, spelling, and punctuation errors in the following text. Preserve the original tone and meaning. Return ONLY the corrected text with no explanations, no quotes, and no markdown formatting.',
      make_formal: 'You are a professional writing assistant. Rewrite the following text in a formal, professional tone suitable for business communication. Preserve the core meaning. Return ONLY the rewritten text with no explanations, no quotes, and no markdown formatting.',
      make_casual: 'You are a friendly writing assistant. Rewrite the following text in a casual, conversational tone. Preserve the core meaning. Return ONLY the rewritten text with no explanations, no quotes, and no markdown formatting.',
      make_concise: 'You are a concise writing expert. Shorten and tighten the following text while preserving all key information. Remove filler words, redundancies, and unnecessary qualifiers. Return ONLY the shortened text with no explanations, no quotes, and no markdown formatting.',
      translate: `You are an expert translator. Translate the following text into ${targetLang}. Return ONLY the translated text with no explanations, no quotes, and no markdown formatting.`,
      expand_prompt: `You are a helpful AI writing assistant. The user typed a shorthand prompt after "//". Generate the appropriate text based on their instruction. Consider the surrounding context if provided. Return ONLY the generated text — no explanations, no quotes, no markdown formatting, no prefixes like "Here is..." or "Sure!".${context ? `\n\nSurrounding context for tone/topic reference:\n${context}` : ''}`,
      generate_search_query: 'You are an expert search query generator. Based on the provided visual description, OCR text, and identified items from an image, generate a highly accurate, strict 3-to-5 word web search query to identify this specific entity, object, landmark, or concept. Return ONLY the search query, nothing else. Examples: "The Shard London skyscraper", "Goku Super Saiyan character", "Golden Gate Bridge San Francisco".'
    };

    const systemPrompt = systemPrompts[action] || systemPrompts.fix_grammar;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];

    callAI({ messages, max_tokens: 2048, temperature: action === 'expand_prompt' ? 0.7 : 0.3 }).then(result => {
      if (result.success) {
        sendResponse({ success: true, data: result.content });
      } else {
        sendResponse({ success: false, error: result.message });
      }
    });
    return true;
  }
});


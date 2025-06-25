const axios = require('axios');

// AI Provider configurations
const providers = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1/chat/completions',
    getConfig: () => ({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      enabled: !!process.env.OPENAI_API_KEY
    })
  },
  
  groq: {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1/chat/completions',
    getConfig: () => ({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      enabled: !!process.env.GROQ_API_KEY
    })
  },
  
  anthropic: {
    name: 'Anthropic',
    baseURL: 'https://api.anthropic.com/v1/messages',
    getConfig: () => ({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      enabled: !!process.env.ANTHROPIC_API_KEY
    })
  },
  
  google: {
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    getConfig: () => ({
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL || 'gemini-1.5-flash',
      enabled: !!process.env.GOOGLE_API_KEY
    })
  },
  
  ollama: {
    name: 'Ollama',
    baseURL: `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`,
    getConfig: () => ({
      apiKey: null, // Ollama doesn't require API key
      model: process.env.OLLAMA_MODEL || 'llama3.2',
      enabled: true // Always enabled, but may not be available
    })
  }
};

// Mock AI responses for development/fallback
const mockResponses = [
  "I'm a mock AI assistant. Here's a helpful response to your question about {topic}.",
  "This is a simulated AI response. In a real scenario, I would analyze your question and provide detailed information.",
  "Mock AI: I understand you're asking about {topic}. Here's what I can tell you...",
  "Development mode: This is a placeholder response. The AI service is configured to use mock responses.",
  "Hello! I'm currently running in mock mode. Your question about {topic} would normally get a comprehensive answer."
];

// Get mock response
function getMockResponse(prompt, subject = 'general') {
  const responses = mockResponses;
  const randomIndex = Math.floor(Math.random() * responses.length);
  let response = responses[randomIndex];
  
  // Try to extract topic from prompt
  const topic = subject !== 'general' ? subject : 
    prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
  
  response = response.replace('{topic}', topic);
  
  return {
    choices: [{
      message: {
        content: response,
        role: 'assistant'
      }
    }],
    usage: {
      prompt_tokens: Math.ceil(prompt.length / 4),
      completion_tokens: Math.ceil(response.length / 4),
      total_tokens: Math.ceil((prompt.length + response.length) / 4)
    },
    model: 'mock-ai',
    provider: 'mock'
  };
}

// OpenAI/Groq compatible request
async function callOpenAICompatible(provider, messages, config) {
  const response = await axios.post(provider.baseURL, {
    model: config.model,
    messages: messages,
    max_tokens: 1000,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  
  return {
    ...response.data,
    provider: provider.name.toLowerCase()
  };
}

// Anthropic Claude request
async function callAnthropic(provider, messages, config) {
  // Convert OpenAI format to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const response = await axios.post(provider.baseURL, {
    model: config.model,
    max_tokens: 1000,
    messages: userMessages,
    system: systemMessage?.content || undefined
  }, {
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    timeout: 30000
  });
  
  // Convert Anthropic response to OpenAI format
  return {
    choices: [{
      message: {
        content: response.data.content[0].text,
        role: 'assistant'
      }
    }],
    usage: response.data.usage,
    model: config.model,
    provider: 'anthropic'
  };
}

// Google Gemini request
async function callGoogle(provider, messages, config) {
  const prompt = messages.map(m => m.content).join('\n');
  const url = `${provider.baseURL}/${config.model}:generateContent?key=${config.apiKey}`;
  
  const response = await axios.post(url, {
    contents: [{
      parts: [{ text: prompt }]
    }]
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  
  // Convert Google response to OpenAI format
  const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  
  return {
    choices: [{
      message: {
        content: content,
        role: 'assistant'
      }
    }],
    usage: {
      prompt_tokens: Math.ceil(prompt.length / 4),
      completion_tokens: Math.ceil(content.length / 4),
      total_tokens: Math.ceil((prompt.length + content.length) / 4)
    },
    model: config.model,
    provider: 'google'
  };
}

// Ollama request
async function callOllama(provider, messages, config) {
  const response = await axios.post(provider.baseURL, {
    model: config.model,
    messages: messages,
    stream: false
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 60000 // Ollama can be slower
  });
  
  return {
    choices: [{
      message: response.data.message
    }],
    usage: {
      prompt_tokens: response.data.prompt_eval_count || 0,
      completion_tokens: response.data.eval_count || 0,
      total_tokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
    },
    model: config.model,
    provider: 'ollama'
  };
}

// Main AI call function with provider fallback
async function callAI(messages, options = {}) {
  const { subject = 'general', forceProvider = null } = options;
  
  // Check if mock mode is enabled
  if (process.env.USE_MOCK_AI === 'true') {
    console.log('Using mock AI responses');
    const prompt = messages[messages.length - 1]?.content || '';
    return getMockResponse(prompt, subject);
  }
  
  // Define provider priority
  const providerPriority = forceProvider ? [forceProvider] : ['openai', 'groq', 'anthropic', 'google', 'ollama'];
  
  let lastError = null;
  
  for (const providerName of providerPriority) {
    const provider = providers[providerName];
    if (!provider) continue;
    
    const config = provider.getConfig();
    if (!config.enabled && providerName !== 'ollama') {
      console.log(`Skipping ${provider.name}: not configured`);
      continue;
    }
    
    try {
      console.log(`Attempting to use ${provider.name} with model ${config.model}`);
      
      let response;
      switch (providerName) {
        case 'openai':
        case 'groq':
          response = await callOpenAICompatible(provider, messages, config);
          break;
        case 'anthropic':
          response = await callAnthropic(provider, messages, config);
          break;
        case 'google':
          response = await callGoogle(provider, messages, config);
          break;
        case 'ollama':
          response = await callOllama(provider, messages, config);
          break;
        default:
          throw new Error(`Unknown provider: ${providerName}`);
      }
      
      console.log(`Successfully used ${provider.name}`);
      return response;
      
    } catch (error) {
      console.error(`${provider.name} failed:`, error.message);
      lastError = error;
      
      // Continue to next provider
      continue;
    }
  }
  
  // All providers failed, check if we should fallback to mock
  if (process.env.FALLBACK_TO_MOCK === 'true') {
    console.log('All AI providers failed, falling back to mock responses');
    const prompt = messages[messages.length - 1]?.content || '';
    return getMockResponse(prompt, subject);
  }
  
  // No fallback, throw the last error
  throw lastError || new Error('No AI providers available');
}

// Get available providers status
function getProvidersStatus() {
  const status = {};
  
  for (const [name, provider] of Object.entries(providers)) {
    const config = provider.getConfig();
    status[name] = {
      name: provider.name,
      enabled: config.enabled,
      model: config.model,
      configured: name === 'ollama' || !!config.apiKey
    };
  }
  
  status.mock = {
    name: 'Mock AI',
    enabled: process.env.USE_MOCK_AI === 'true',
    model: 'mock-ai',
    configured: true
  };
  
  return status;
}

module.exports = {
  callAI,
  getProvidersStatus,
  getMockResponse,
  providers
};
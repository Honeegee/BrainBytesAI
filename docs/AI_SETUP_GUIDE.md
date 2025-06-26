# AI Setup Guide for BrainBytes

## Groq Setup (Recommended - Fast & Stable)

### Step 1: Get Your API Key
1. Visit [Groq Console](https://console.groq.com)
2. Sign up or sign in with your account
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the API key (starts with `gsk_...`)

### Step 2: Configure the AI Service
1. Open `ai-service/.env`
2. Replace `your_groq_api_key_here` with your actual API key:
   ```
   GROQ_API_KEY=gsk_...your_actual_key_here
   ```
3. Save the file

### Step 3: Restart the Service
```bash
docker-compose restart ai-service
```

### Step 4: Test the AI
```bash
# Test the AI service
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

## Alternative AI Providers

### Groq (Fast, Free Tier)
```env
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama3-8b-8192
USE_MOCK_AI=false
```
Get key from: https://console.groq.com

### OpenAI (Most Reliable, Paid)
```env
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-3.5-turbo
USE_MOCK_AI=false
```

### Ollama (Local, Free)
1. Install Ollama: https://ollama.ai
2. Run: `ollama run llama3.2`
3. Configure:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
USE_MOCK_AI=false
```

## Available Models

### Google Gemini
- `gemini-1.5-flash` (Recommended - Fast, free tier)
- `gemini-1.5-pro` (More capable, rate limited)

### Groq
- `llama3-8b-8192` (Fast, good quality)
- `llama3-70b-8192` (Better quality, slower)
- `mixtral-8x7b-32768` (Long context)

### OpenAI
- `gpt-3.5-turbo` (Balanced cost/performance)
- `gpt-4` (Highest quality)
- `gpt-4-turbo` (Latest features)

## Troubleshooting

### Check AI Service Status
```bash
curl http://localhost:3002/health
curl http://localhost:3002/api/providers
```

### View Logs
```bash
docker-compose logs ai-service
```

### Test Different Providers
You can enable multiple providers and the system will automatically fallback if one fails.

## Monitoring

Once configured, your AI service will:
- ✅ Appear in Prometheus metrics
- ✅ Work with the traffic simulation
- ✅ Provide real responses in the chat interface
- ✅ Track usage and performance metrics

## Next Steps

After setting up your API key:
1. Test the monitoring setup with real AI responses
2. Run the traffic simulation to generate metrics
3. View performance in Prometheus dashboard
4. Configure alerts for AI service issues
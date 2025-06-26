# BrainBytes AI - Complete Setup Guide

## Prerequisites

Before setting up the BrainBytes AI Tutoring Platform, ensure you have the following software installed:

### Required Software
- **Git**: Version control system
  - [Download Git](https://git-scm.com/downloads)
- **Docker Desktop**: Containerization platform (Version 20.10 or higher)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Web Browser**: Chrome, Firefox, Safari, or Edge
- **Code Editor** (Recommended: Visual Studio Code)
  - [Download VS Code](https://code.visualstudio.com/download)

### Optional for Local Development
- **Node.js and npm** (Version 18 or higher)
  - [Download Node.js LTS](https://nodejs.org/)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Honeegee/BrainBytesAI.git
cd BrainBytesAI
```

### 2. Environment Configuration

Copy the example environment files and configure them:

```bash
# Copy example files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

#### Required Configuration

**1. Backend Environment (backend/.env)**
- Update `MONGODB_URI` with your MongoDB connection string
- For Docker setup, use: `AI_SERVICE_URL=http://ai-service:3002`

**2. AI Service Environment (ai-service/.env)**
- Add your Groq API key: `GROQ_API_KEY=your_groq_api_key_here`
- Choose your preferred AI model (default is configured)

**3. Frontend Environment (frontend/.env.local)**
- Default configuration works for Docker setup
- Uses nginx proxy: `NEXT_PUBLIC_BACKEND_URL=http://localhost`

### 3. Start the Application

```bash
# Build and start all services with monitoring
docker-compose up -d --build

# Verify all services are running
docker-compose ps
```

### 4. Access the Application

**Main Application Access (via nginx proxy):**
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **AI Service**: http://localhost/api/ai

**Direct Service Access (for debugging):**
- **AI Service**: http://localhost:8090
- **Monitoring Dashboard**: http://localhost:8080
- **Grafana**: http://localhost:3003

## Detailed Environment Configuration

### Docker Setup (Recommended)

This is the recommended setup for development and closely mirrors the production environment.

#### Backend Configuration (backend/.env)
```bash
# Backend Environment Configuration for Development
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=AppName

# AI Service Configuration (Docker network)
AI_SERVICE_URL=http://ai-service:3002

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development

# Session Secret
SESSION_SECRET=your-session-secret-for-development

# CORS Origins
CORS_ORIGINS=http://localhost:3001,http://localhost:3000
```

#### AI Service Configuration (ai-service/.env)
```bash
# AI Service Configuration
PORT=3002
NODE_ENV=development

# Use mock AI for development when no API keys are configured
USE_MOCK_AI=false
FALLBACK_TO_MOCK=true

# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50

# AI Provider Configuration (choose one)
# Option 1: Groq (Fast, free tier available)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=deepseek-r1-distill-llama-70b

# Option 2: OpenAI (Most reliable, requires paid API key)
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-3.5-turbo

# Option 3: Ollama (Local, completely free)
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.2
```

#### Frontend Configuration (frontend/.env.local)
```bash
# Frontend Environment Configuration for Development

# Backend API URL (via nginx proxy for Docker)
NEXT_PUBLIC_BACKEND_URL=http://localhost

# AI Service URL (if calling directly)
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8090
```

### Local Development Setup (Alternative)

For local development without Docker (not recommended for beginners):

#### Backend Configuration
```bash
# Change AI service URL for local development
AI_SERVICE_URL=http://localhost:3002
```

#### Frontend Configuration
```bash
# Change backend URL for local development
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## Service Architecture

### Docker Network Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        nginx (Port 80)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  Frontend   │ │   Backend   │ │      AI Service         ││
│  │   :3000     │ │    :3000    │ │        :3002            ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
│                    Docker Network                           │
└─────────────────────────────────────────────────────────────┘

External Access:
- Frontend: http://localhost (via nginx)
- Backend API: http://localhost/api (via nginx)
- AI Service: http://localhost/api/ai (via nginx)
- Monitoring: http://localhost:8080 (via nginx)
- Grafana: http://localhost:3003 (direct)
```

### Service Communication
- **Frontend → Backend**: via nginx proxy (`/api/*`)
- **Frontend → AI Service**: via nginx proxy (`/api/ai/*`)
- **Backend → AI Service**: via Docker network (`http://ai-service:3002`)

## Database Setup

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster in the Asia-Pacific region
3. Create a database user
4. Whitelist your IP address
5. Copy the connection string to `MONGODB_URI` in backend/.env

### Local MongoDB (Alternative)
The docker-compose.yml can be extended to include a local MongoDB container if needed.

## Verification

### Health Checks
```bash
# Check all services are healthy
curl http://localhost/api/health      # Backend health
curl http://localhost:8090/health     # AI service health
curl http://localhost                 # Frontend loading

# Check AI service functionality
curl -X POST http://localhost/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, test message"}'
```

### Container Status
```bash
# Check running containers
docker-compose ps

# View logs for troubleshooting
docker-compose logs frontend
docker-compose logs backend
docker-compose logs ai-service
```

## Troubleshooting

### Common Issues

#### "AI service is currently unavailable"
1. **Check AI service URL in backend/.env:**
   - Should be `AI_SERVICE_URL=http://ai-service:3002` for Docker
   - Should be `AI_SERVICE_URL=http://localhost:3002` for local

2. **Verify AI service is running:**
   ```bash
   docker-compose logs ai-service
   curl http://localhost:8090/health
   ```

3. **Check API keys are configured:**
   - Verify `GROQ_API_KEY` in ai-service/.env
   - Or enable mock AI: `USE_MOCK_AI=true`

#### Port Conflicts
```bash
# Check for port conflicts
netstat -ano | findstr :3000
netstat -ano | findstr :3002
netstat -ano | findstr :80

# Stop conflicting services
docker-compose down
# Kill processes using ports if needed
taskkill /PID <process_id> /F
```

#### Container Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up -d --build --force-recreate

# Remove all containers and volumes (nuclear option)
docker-compose down -v
docker system prune -a
```

### Getting Help
- **📖 Documentation**: Check the [Documentation Index](../DOCUMENTATION_INDEX.md)
- **🐛 Issues**: Create [GitHub Issues](https://github.com/Honeegee/BrainBytesAI/issues)
- **📋 Troubleshooting**: See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

## Development Workflow

### Starting Development
```bash
# Start all services
docker-compose up -d

# Watch logs in real-time
docker-compose logs -f

# Access development tools
open http://localhost        # Frontend
open http://localhost:8080   # Monitoring dashboard
open http://localhost:3003   # Grafana
```

### Making Changes
```bash
# Restart specific service after changes
docker-compose restart backend
docker-compose restart ai-service
docker-compose restart frontend

# Rebuild service after major changes
docker-compose up -d --build backend
```

### Stopping Development
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v
```

## Production Considerations

### Environment Variables
- Use strong, unique secrets for JWT and session tokens
- Never commit `.env` files to version control
- Rotate API keys regularly
- Use environment-specific configuration

### Security
- Enable HTTPS in production
- Configure proper CORS origins
- Use secure session settings
- Implement rate limiting
- Regular security audits

## Next Steps

After successful setup:
1. **Test the Application**: Create a user account and test chat functionality
2. **Explore Monitoring**: Check the monitoring dashboard at http://localhost:8080
3. **Read Documentation**: Review the [API Documentation](../technical/API.md)
4. **Run Tests**: Execute `npm run test:all` to verify everything works
5. **Contribute**: Follow the [Contributing Guidelines](../../README.md#contributing)

---

**Need Help?** Check our [Troubleshooting Guide](../TROUBLESHOOTING.md) or create an issue on GitHub.

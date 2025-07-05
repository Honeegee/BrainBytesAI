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

### 🚀 For Absolute Beginners

**New to development?** Follow these steps in order:

1. **Install Required Software** (see Prerequisites above)
2. **Get API Keys** (we'll guide you through this)
3. **Clone and Configure** (copy-paste commands provided)
4. **Start the Application** (one command)
5. **Access Your App** (open in browser)

**Estimated Setup Time**: 15-20 minutes

### 1. Clone the Repository
```bash
git clone https://github.com/Honeegee/BrainBytesAI.git
```

### 2. Environment Configuration

Copy the example environment files and configure them:

```bash
# Copy example files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

#### Step-by-Step Configuration Guide

**STEP 1: Set Up MongoDB Database**

You need a MongoDB database for the application. We recommend MongoDB Atlas (free tier available):

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" and create an account
   - Verify your email address

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (FREE tier)
   - Select "Asia-Pacific" region (closest to Philippines)
   - Name your cluster (e.g., "brainbytes-cluster")
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `brainbytes-user` (or your preferred username)
   - Password: Generate a secure password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster...`)
   - Replace `<password>` with your actual password
   - Replace `<database>` with `brainbytes` (or your preferred database name)

**STEP 2: Set Up Groq AI API**

Groq provides fast AI inference. Get your free API key:

1. **Create Groq Account**
   - Go to [Groq Console](https://console.groq.com/)
   - Sign up with your email or GitHub account
   - Verify your email if required

2. **Generate API Key**
   - Once logged in, go to "API Keys" section
   - Click "Create API Key"
   - Give it a name like "BrainBytes Development"
   - Copy the API key (starts with `gsk_...`)
   - **Important**: Save this key securely - you won't see it again!

**STEP 3: Configure Environment Files**

Now configure your environment files with the credentials:

**Backend Environment (backend/.env)**
```bash
# Backend Environment Configuration for Development
NODE_ENV=development
PORT=3000

# Database Configuration - REPLACE WITH YOUR MONGODB CONNECTION STRING
MONGODB_URI=mongodb+srv://brainbytes-user:YOUR_PASSWORD@brainbytes-cluster.xxxxx.mongodb.net/brainbytes?retryWrites=true&w=majority&appName=brainbytes-cluster

# AI Service Configuration (Docker network)
AI_SERVICE_URL=http://ai-service:3002

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development-change-this-in-production

# Session Secret
SESSION_SECRET=your-session-secret-for-development-change-this-in-production

# CORS Origins
CORS_ORIGINS=http://localhost:3001,http://localhost:3000
```

**AI Service Environment (ai-service/.env)**
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

# Groq Configuration - REPLACE WITH YOUR GROQ API KEY
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=deepseek-r1-distill-llama-70b


```

**Frontend Environment (frontend/.env.local)**
```bash
# Frontend Environment Configuration for Development

# Backend API URL (via nginx proxy for Docker)
NEXT_PUBLIC_BACKEND_URL=http://localhost

```

#### Configuration Verification

Before starting the application, verify your configuration:

```bash
# Check if your MongoDB connection string is valid
# Replace with your actual connection string
echo "MONGODB_URI=mongodb+srv://..." | grep -o "mongodb+srv://[^@]*@[^/]*"

# Check if your Groq API key is set
grep "GROQ_API_KEY" ai-service/.env
```

#### Troubleshooting Configuration

**MongoDB Connection Issues:**
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Check that your username/password are correct
- Verify the database name in the connection string

**Groq API Issues:**
- Verify your API key is correct and active
- Check your Groq account usage limits
- If Groq is unavailable, set `USE_MOCK_AI=true` for testing

**Need Help?**
- MongoDB Atlas has a [detailed setup guide](https://docs.atlas.mongodb.com/getting-started/)
- Groq provides [API documentation](https://console.groq.com/docs)
- Check our [Troubleshooting Guide](../TROUBLESHOOTING.md) for common issues

#### Common Beginner Mistakes

**❌ Mistake 1: Forgetting to replace placeholder values**
```bash
# DON'T leave this as-is:
MONGODB_URI=mongodb+srv://username:password@cluster...
GROQ_API_KEY=your_groq_api_key_here

# DO replace with your actual values:
MONGODB_URI=mongodb+srv://myuser:mypass123@mycluster.abc123.mongodb.net/brainbytes...
GROQ_API_KEY=gsk_abc123xyz789...
```

**❌ Mistake 2: Wrong file locations**
- Environment files must be in the correct directories:
  - `backend/.env` (not `backend/.env.example`)
  - `ai-service/.env` (not `ai-service/.env.example`)
  - `frontend/.env.local` (not `frontend/.env.example`)

**❌ Mistake 3: Copying connection strings incorrectly**
- Don't include extra spaces or line breaks
- Make sure to replace `<password>` with your actual password
- Don't forget to replace `<database>` with your database name

**❌ Mistake 4: Not whitelisting IP in MongoDB Atlas**
- Go to Network Access in MongoDB Atlas
- Add your IP address or use "Allow Access from Anywhere" for development

**✅ Quick Verification Checklist**
Before running `docker-compose up`:
- [ ] All three `.env` files created and configured
- [ ] MongoDB connection string has real username/password
- [ ] Groq API key starts with `gsk_`
- [ ] No placeholder text like `your_api_key_here` remains
- [ ] IP address whitelisted in MongoDB Atlas

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
- **AI Service**: http://localhost/api/ai/

**Direct Service Access:**
- **AI Service**: http://localhost:8090

**Monitoring Services:**

*Via Nginx Proxy (Recommended for Production):*
- **Monitoring Dashboard**: http://localhost:8080 (landing page with links)
- **Grafana**: http://localhost:8080/grafana/
- **Prometheus**: http://localhost:8080/prometheus/
- **Alertmanager**: http://localhost:8080/alertmanager/
- **cAdvisor**: http://localhost:8080/cadvisor/

*Direct Access (Alternative):*
- **Grafana**: http://localhost:3003
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **cAdvisor**: http://localhost:8081
- **Node Exporter**: http://localhost:9100

**Grafana Credentials:**
- Username: `admin`
- Password: `brainbytes123`

**Note**: After making configuration changes, restart the services with `docker-compose down && docker-compose up -d --build`

## Alternative Setup Options

### Local Development Setup (Without Docker)

**Note**: Docker setup is recommended for beginners. This section is for advanced users who prefer local development.

If you want to run services locally without Docker:

#### Prerequisites for Local Setup
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas
- All environment files configured as shown in the step-by-step guide above

#### Local Configuration Changes

**Backend Configuration (backend/.env)**
```bash
# Change AI service URL for local development
AI_SERVICE_URL=http://localhost:3002
```

**Frontend Configuration (frontend/.env.local)**
```bash
# Change backend URL for local development
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

#### Running Services Locally
```bash
# Terminal 1: Start AI Service
cd ai-service
npm install
npm run dev

# Terminal 2: Start Backend
cd backend
npm install
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

### Using Alternative AI Providers

If you prefer different AI providers instead of Groq:

#### Option 1: OpenAI (Most Reliable)
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In `ai-service/.env`, comment out Groq and add:
```bash
# GROQ_API_KEY=gsk_your_groq_key_here
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

#### Option 2: Ollama (Completely Free, Local)
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Configure `ai-service/.env`:
```bash
# Comment out Groq and add:
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

#### Option 3: Mock AI (For Testing)
If you want to test without any AI provider:
```bash
# In ai-service/.env, set:
USE_MOCK_AI=true
```

### Environment File Templates

If you need clean templates for your environment files:

#### Backend Template (backend/.env)
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string_here
AI_SERVICE_URL=http://ai-service:3002
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
CORS_ORIGINS=http://localhost:3001,http://localhost:3000
```

#### AI Service Template (ai-service/.env)
```bash
PORT=3002
NODE_ENV=development
USE_MOCK_AI=false
FALLBACK_TO_MOCK=true
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=deepseek-r1-distill-llama-70b
```

#### Frontend Template (frontend/.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8090
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
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  Grafana    │ │ Prometheus  │ │     Alertmanager        ││
│  │   :3003     │ │    :9090    │ │        :9093            ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
│  ┌─────────────┐ ┌─────────────┐                           │
│  │Node Exporter│ │  cAdvisor   │                           │
│  │   :9100     │ │    :8080    │                           │
│  └─────────────┘ └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘

External Access:
- Frontend: http://localhost (via nginx port 80)
- Backend API: http://localhost/api (via nginx port 80)
- AI Service: http://localhost/api/ai/ (via nginx port 80)
- AI Service Direct: http://localhost:8090 (via nginx port 8090)

Monitoring Access:
*Via Nginx Proxy (Recommended):*
- Grafana: http://localhost:8080/grafana/
- Prometheus: http://localhost:8080/prometheus/
- Alertmanager: http://localhost:8080/alertmanager/
- cAdvisor: http://localhost:8080/cadvisor/

*Direct Access (Alternative):*
- Grafana: http://localhost:3003
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093
- cAdvisor: http://localhost:8081
- Node Exporter: http://localhost:9100
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

# Check monitoring services
curl http://localhost:9090/-/healthy  # Prometheus health
curl http://localhost:3003/api/health # Grafana health
curl http://localhost:9093/-/healthy  # Alertmanager health
curl http://localhost:9100/metrics    # Node Exporter metrics
curl http://localhost:8081/metrics    # cAdvisor metrics (correct port)

# Check AI service functionality (note the trailing slash)
curl -X POST http://localhost/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, test message"}'

# Alternative AI service test via direct port
curl -X POST http://localhost:8090/api/chat \
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

# View monitoring service logs
docker-compose logs grafana
docker-compose logs prometheus
docker-compose logs alertmanager
docker-compose logs node-exporter
docker-compose logs cadvisor
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

## Monitoring Setup

BrainBytes AI includes comprehensive monitoring capabilities with Prometheus, Grafana, and Alertmanager. The monitoring stack provides real-time insights into application performance, system health, and user experience.

### Quick Monitoring Setup

The monitoring stack is automatically included when you start the application:

```bash
# Start application with monitoring (default)
docker-compose up -d --build

# Or use the dedicated monitoring script
./start-app-with-monitoring.bat
```

### Monitoring Access Points

**Via Nginx Proxy (Recommended for Production):**
- **Grafana**: http://localhost:8080/grafana/
- **Prometheus**: http://localhost:8080/prometheus/
- **Alertmanager**: http://localhost:8080/alertmanager/
- **cAdvisor**: http://localhost:8080/cadvisor/

**Direct Access (Alternative):**
- **Grafana**: http://localhost:3003
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **cAdvisor**: http://localhost:8081
- **Node Exporter**: http://localhost:9100

**Grafana Credentials:**
- Username: `admin`
- Password: `brainbytes123`

**Metrics Endpoints:**
- **Node Exporter**: http://localhost:9100/metrics
- **cAdvisor**: http://localhost:8081/metrics
- **AI Service**: http://localhost:8090/metrics

### Key Monitoring Features

1. **Application Performance Monitoring**
   - Response times and throughput
   - Error rates and success metrics
   - AI service performance tracking

2. **System Resource Monitoring**
   - CPU, memory, and disk usage
   - Container health and resource consumption
   - Network performance metrics

3. **Filipino Context Optimizations**
   - Mobile performance tracking
   - Data usage monitoring
   - Cost optimization alerts

4. **Automated Alerting**
   - High error rate notifications
   - Resource exhaustion warnings
   - Service availability alerts

### Monitoring Documentation

For comprehensive monitoring setup and usage, see the dedicated monitoring documentation:

- **[Monitoring Overview](../monitoring/README.md)** - Complete monitoring system guide
- **[Quick Start Guide](../monitoring/QUICK_START.md)** - 10-minute monitoring setup
- **[System Architecture](../monitoring/01-system-architecture.md)** - Monitoring stack architecture
- **[Metrics Catalog](../monitoring/02-metrics-catalog.md)** - Available metrics and their meanings
- **[Query Reference](../monitoring/03-query-reference.md)** - Useful PromQL queries
- **[Alert Rules](../monitoring/04-alert-rules.md)** - Alert configuration and responses
- **[Dashboard Catalog](../monitoring/05-dashboard-catalog.md)** - Grafana dashboard guide
- **[Monitoring Procedures](../monitoring/06-monitoring-procedures.md)** - Operational procedures
- **[Filipino Context](../monitoring/07-filipino-context.md)** - Filipino-specific optimizations
- **[Demo & Simulation](../monitoring/08-demo-simulation.md)** - Testing and demo scenarios

### Monitoring Troubleshooting

If monitoring services aren't accessible:

```bash
# Check monitoring containers
docker-compose ps | grep -E "(prometheus|grafana|alertmanager)"

# View monitoring logs
docker-compose logs grafana
docker-compose logs prometheus
docker-compose logs alertmanager

# Restart monitoring stack after configuration changes
docker-compose down
docker-compose up -d --build

# Or restart specific services
docker-compose restart grafana prometheus alertmanager
```

**Common Issues:**

**1. Grafana Redirect Loop (ERR_TOO_MANY_REDIRECTS):**
```bash
# Clear browser cookies for localhost
# Or try incognito/private browsing mode
# Restart Grafana service:
docker-compose restart grafana
```

**2. 404 Not Found for monitoring services:**
- Ensure you're using the correct URLs:
  - ✅ `http://localhost:8080/cadvisor/` (not `/containers/`)
  - ✅ `http://localhost:8080/grafana/` (with trailing slash)
  - ✅ `http://localhost:8080/prometheus/` (with trailing slash)

**3. Services not responding:**
```bash
# Check if nginx is running and configured correctly
docker-compose logs nginx

# Verify all services are up
docker-compose ps
```

**Important**: After updating nginx, docker-compose, or monitoring configurations, always restart the entire stack:
```bash
docker-compose down && docker-compose up -d --build
```

This ensures all configuration changes are properly applied and services can communicate correctly through the proxy.

## Next Steps

After successful setup:
1. **Test the Application**: Create a user account and test chat functionality
2. **Explore Monitoring**: Check Grafana dashboards at http://localhost:3003
3. **Set Up Alerts**: Configure alert notifications in Alertmanager
4. **Read Documentation**: Review the [Monitoring Documentation](../monitoring/README.md)
5. **Review API Docs**: Check the [API Documentation](../technical/API.md)
6. **Run Tests**: Execute `npm run test:all` to verify everything works
7. **Contribute**: Follow the [Contributing Guidelines](../../README.md#contributing)

---

**Need Help?** Check our [Troubleshooting Guide](../TROUBLESHOOTING.md) or create an issue on GitHub.

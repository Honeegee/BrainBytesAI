# BrainBytes Setup Guide

## Prerequisites

Before setting up the BrainBytes AI Tutoring Platform, ensure you have the following software installed:

### Required Software
- **Git**: Version control system
  - [Download Git](https://git-scm.com/downloads)
- **Docker Desktop**: Containerization platform
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Node.js and npm** (Optional, but recommended for local development)
  - [Download Node.js LTS](https://nodejs.org/)
- **Code Editor** (Recommended: Visual Studio Code)
  - [Download VS Code](https://code.visualstudio.com/download)

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Honeegee/BrainBytesAI.git
cd brainbytes
```

### 2. Environment Variables

Create the following `.env` files in their respective directories:

#### Backend Environment (backend/.env)
```bash
PORT=3000
MONGODB_URI=mongodb://mongo:27017/brainbytes
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
COOKIE_SECURE=false
SESSION_SECRET=your_session_secret_key
```

#### AI Service Environment (ai-service/.env)
```bash
PORT=3002
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50
```

#### Frontend Environment (frontend/.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
PORT=3001
```

### 3. Docker Configuration

#### Starting the Application
```bash
# Ensure Docker is running
docker-compose down  # Remove any existing containers
docker-compose up -d --build  # Build and start containers in detached mode
```

### 4. Accessing the Application

After starting the containers, access the following URLs:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **AI Service**: http://localhost:3002

## Database Management

### Local Development Database
- The database runs in a Docker container named `mongo`
- Data is stored locally in a Docker volume
- Each developer has an isolated local MongoDB instance

### Sharing Database Content
To share database content between developers:

1. Export data:
```bash
docker exec mongo mongodump
```

2. Import data:
```bash
docker exec mongo mongorestore
```

## Troubleshooting

### Common Issues
- Ensure all required ports (3000, 3001, 3002) are free
- Check Docker Desktop is running
- Verify environment variables are correctly set
- Confirm you're using compatible versions of Docker and Node.js

### Checking Container Status
```bash
docker-compose ps  # List running containers
docker-compose logs  # View container logs
```

## Development Workflow

### Running Specific Services
```bash
# Run only specific services
docker-compose up -d frontend backend
```

### Stopping the Application
```bash
docker-compose down
```

## Security Notes
- Never commit `.env` files to version control
- Use strong, unique secrets for JWT and session tokens
- Rotate API keys regularly
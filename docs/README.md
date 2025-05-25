# BrainBytes AI Tutoring Platform

## Overview

BrainBytes is an innovative AI-powered tutoring platform designed to provide accessible academic assistance to Filipino students. The platform leverages modern web technologies and AI to create an interactive, personalized learning experience.

## Key Features

- 🤖 AI-Powered Tutoring
- 📚 Personalized Learning Materials
- 🔒 Secure User Authentication
- 📊 Progress Tracking
- 💬 Interactive Chat Interface

## Technology Stack

- **Frontend**: Next.js
- **Backend**: Node.js/Express.js
- **Database**: MongoDB
- **Containerization**: Docker
- **AI Integration**: Groq API (deepseek-r1-distill-llama-70b model)
- **DevOps**: GitHub Actions, Oracle Cloud Free Tier
- **Monitoring**: Prometheus & Grafana

## Architecture

![System Architecture](architecture.png)

The architecture follows a microservices pattern with three main components:
- **Frontend Service**: Next.js React application handling user interface
- **Backend Service**: Node.js API server managing data and authentication
- **AI Service**: Dedicated service for AI-powered tutoring capabilities

## Development Environment Setup Verification

| Team Member | Docker Installed | Git Installed | VS Code Installed | Can Run Hello World Container |
|-------------|-----------------|---------------|-------------------|------------------------------|
| Honey Grace Denolan | ✓ | ✓ | ✓ | ✓ |
| Rhico Abueme | ✓ | ✓ | ✓ | ✓ |
| Zyra Joy Dongon | ✓ | ✓ | ✓ | ✓ |
| Adam Raymond Belda | ✓ | ✓ | ✓ | ✓ |

## Quick Start

### Prerequisites

- Docker Desktop
- Git
- Web Browser

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Honeegee/BrainBytesAI.git
   ```

2. Set up environment variables (see [Setup Guide](SETUP.md))

3. Start the application:
   ```bash
   docker-compose up -d --build
   ```

4. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - AI Service: http://localhost:3002

## Documentation

- [Setup Guide](SETUP.md)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [AI Integration](AI_INTEGRATION.md)



## Contributing

1. Clone the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License


## Contact

Project Link: [https://github.com/Honeegee/brainbytes](https://github.com/Honeegee/brainbytes)

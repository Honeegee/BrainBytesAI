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

## Quick Start

### Prerequisites

- Docker Desktop
- Git
- Web Browser

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Honeegee/BrainBytesAI.git
   cd brainbytes
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

## Team

- **Felicity Diana Sario** - Team Lead
- **Honey Grace Denolan** - Backend Developer
- **Rhico Abueme** - Frontend Developer
- **Zyra Joy Dongon** - DevOps Engineer
- **Adam Raymond Belda** - Team Member

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[Specify License]

## Contact

Project Link: [https://github.com/your-organization/brainbytes](https://github.com/your-organization/brainbytes)
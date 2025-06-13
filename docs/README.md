# BrainBytes AI Tutoring Platform

[![CI/CD Pipeline](https://github.com/Honeegee/BrainBytesAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/ci-cd.yml)
[![Code Quality & Security](https://github.com/Honeegee/BrainBytesAI/actions/workflows/code-quality.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/code-quality.yml)
[![Deploy to Environments](https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy.yml)

## 📋 Overview

BrainBytes is an innovative AI-powered tutoring platform designed to provide accessible academic assistance to Filipino students. The platform leverages modern web technologies and AI to create an interactive, personalized learning experience.

## ✨ Key Features

- 🤖 **AI-Powered Tutoring**: Intelligent responses using Groq API with deepseek-r1-distill-llama-70b model
- 📚 **Personalized Learning Materials**: Customized content based on student needs
- 🔒 **Secure User Authentication**: JWT-based authentication with session management
- 📊 **Progress Tracking**: Monitor learning progress and performance metrics
- 💬 **Interactive Chat Interface**: Real-time conversation with AI tutor
- 🌐 **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: JWT tokens with secure storage

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **API Integration**: Axios for external service calls

### AI Service
- **AI Provider**: Groq API
- **Model**: deepseek-r1-distill-llama-70b
- **Architecture**: Microservice pattern
- **Response Processing**: Custom response formatting

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Cloud Platform**: Amazon Web Services (AWS)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus & Grafana

## 🏛️ Architecture

![System Architecture](architecture.png)

The architecture follows a microservices pattern with three main components:
- **Frontend Service** (Port 3001): Next.js React application
- **Backend Service** (Port 3000): Node.js API server
- **AI Service** (Port 3002): Dedicated AI processing service

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop**: Version 20.10 or higher
- **Git**: Version 2.30 or higher
- **Web Browser**: Chrome, Firefox, Safari, or Edge

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Honeegee/BrainBytesAI.git
   ```

2. **Set up environment variables**:
   ```bash
   # Copy environment templates
   cp frontend/.env.local.example frontend/.env.local
   cp backend/.env.example backend/.env
   cp ai-service/.env.example ai-service/.env
   
   # Edit environment files with your configuration
   # See Setup Guide for detailed instructions
   ```

3. **Start the application**:
   ```bash
   # Build and start all services
   docker-compose up -d --build
   
   # Verify services are running
   docker-compose ps
   ```

4. **Access the application**:
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:3000
   - **AI Service**: http://localhost:3002

### Verification

```bash
# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3002/api/health

# Check frontend accessibility
curl http://localhost:3001
```

## 📚 Documentation

> **📊 [Complete Documentation Index](DOCUMENTATION_INDEX.md)** - Navigate all project documentation

### 🚀 Getting Started
- **[Setup Guide](guides/SETUP.md)** - Complete installation and configuration
- **[Project README](README.md)** - This overview document

### 🔧 Technical References
- **[API Documentation](technical/API.md)** - Comprehensive API reference
- **[Database Schema](technical/DATABASE.md)** - Database design and models
- **[AI Integration](technical/AI_INTEGRATION.md)** - AI service implementation

### 🧪 Testing & Quality
- **[Testing Guide](testing/TESTING_GUIDE.md)** - Complete testing strategy
- **[Performance Testing](testing/PERFORMANCE_TESTING.md)** - Load testing guide

### 🚀 Deployment & Operations
- **[CI/CD Documentation](deployment/CI_CD_DOCUMENTATION.md)** - GitHub Actions workflows

### 📊 Project Management
- **[Task Distribution](project/task-distribution.md)** - Roadmap and assignments

## 👥 Development Team

| Team Member | Role | Setup Status | Contact |
|-------------|------|--------------|---------|
| **Honey Grace Denolan** | Project Lead & Full-Stack | ✅ Complete | Lead Developer |
| **Rhico Abueme** | Backend Developer | ✅ Complete | Backend Specialist |
| **Zyra Joy Dongon** | Frontend Developer | ✅ Complete | UI/UX Specialist |
| **Adam Raymond Belda** | AI Integration Specialist | ✅ Complete | AI/ML Developer |

### Team Setup Verification
- ✅ Docker Desktop installed and configured
- ✅ Git version control setup
- ✅ VS Code development environment
- ✅ Project repositories cloned and accessible
- ✅ Local development environment tested

## 🛠️ Development Workflow

### Local Development

```bash
# Install dependencies for all services
npm run install:all

# Start development servers with hot reload
docker-compose -f docker-compose.dev.yml up

# Run all tests
npm run test:all

# Code quality checks
npm run lint:all
npm run prettier:all
npm run audit:all
```

### Testing Strategy

Our comprehensive testing approach includes:

| Test Type | Coverage | Tools | Purpose |
|-----------|----------|-------|---------|
| **Unit Tests** | 80%+ business logic | Jest | Individual component testing |
| **Integration Tests** | All API endpoints | Supertest, MongoDB Memory Server | Service interaction testing |
| **E2E Tests** | Critical user flows | Playwright, Puppeteer | Complete workflow testing |
| **Performance Tests** | Key endpoints | Artillery | Load and stress testing |

### Code Quality Standards

- **Linting**: ESLint with Airbnb configuration
- **Formatting**: Prettier with consistent rules
- **Testing**: Comprehensive test coverage required
- **Security**: Regular vulnerability scanning
- **Documentation**: Inline comments and README updates

### Available Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| [`npm run test:all`](package.json) | Run all tests across services | Runs unit, integration, and e2e tests |
| [`npm run lint:all`](package.json) | Lint all code across services | Checks code style and potential issues |
| [`npm run prettier:all`](package.json) | Check code formatting across services | Validates Prettier formatting compliance |
| [`npm run prettier:fix:all`](package.json) | Fix code formatting across services | Automatically formats code with Prettier |
| [`npm run audit:all`](package.json) | Security audit all services | Checks for security vulnerabilities |

#### Prettier Commands

```bash
# Check formatting across all services
npm run prettier:all

# Fix formatting issues across all services
npm run prettier:fix:all

# Individual service formatting
npm run prettier:frontend    # Check frontend formatting
npm run prettier:backend     # Check backend formatting
npm run prettier:ai-service  # Check AI service formatting

# Individual service formatting fixes
npm run prettier:fix:frontend    # Fix frontend formatting
npm run prettier:fix:backend     # Fix backend formatting
npm run prettier:fix:ai-service  # Fix AI service formatting
```

## 📊 Performance Benchmarks

| Metric | Target | Current Status | Trend |
|--------|--------|----------------|--------|
| **Response Time (Mean)** | < 200ms | ~170ms | 📈 Improving |
| **Response Time (P95)** | < 500ms | ~450ms | ✅ Meeting target |
| **Success Rate** | > 99% | 99.5% | ✅ Exceeding target |
| **Throughput** | > 30 req/sec | ~30 req/sec | ✅ Meeting target |
| **Uptime** | > 99.9% | 99.95% | ✅ Exceeding target |

## 🤝 Contributing

### Development Process

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-amazing-feature
   ```

2. **Implement Changes**:
   - Follow coding standards and best practices
   - Write comprehensive tests
   - Update documentation as needed

3. **Quality Assurance**:
   ```bash
   npm run test:all
   npm run lint:all
   npm run prettier:all
   npm run audit:all
   ```

4. **Submit Pull Request**:
   - Provide clear description of changes
   - Include relevant test results
   - Request appropriate reviewers

### Review Process

- ✅ All PRs require at least one approval
- ✅ Automated CI/CD checks must pass
- ✅ Code coverage must not decrease
- ✅ Security scans must show no critical vulnerabilities
- ✅ Documentation updates included

## 🔒 Security

### Security Measures
- **Authentication**: JWT tokens with secure storage
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Comprehensive sanitization and validation
- **HTTPS**: SSL/TLS encryption for all communications
- **Environment Variables**: Secure secrets management
- **CORS**: Properly configured cross-origin policies
- **Rate Limiting**: API endpoint protection
- **Security Headers**: Comprehensive security header implementation

### Reporting Security Issues
For security vulnerabilities, please email: **security@brainbytes.app**

## 📈 Project Status

### Current Status
- 🟢 **Development**: Active feature development
- 🟢 **Testing**: Comprehensive test coverage (80%+)
- 🟢 **CI/CD**: Automated pipeline operational
- 🟢 **Documentation**: Complete and up-to-date
- 🟢 **Performance**: Meeting all benchmarks

### Recent Updates
- ✅ Complete documentation reorganization
- ✅ Enhanced testing strategy implementation
- ✅ Performance optimization completed
- ✅ Security audit passed
- ✅ CI/CD pipeline enhanced

## 📞 Support

### Getting Help
- **📖 Documentation**: Check the [Documentation Index](DOCUMENTATION_INDEX.md)
- **🐛 Issues**: Create [GitHub Issues](https://github.com/Honeegee/BrainBytesAI/issues) for bugs
- **💬 Discussions**: Use [GitHub Discussions](https://github.com/Honeegee/BrainBytesAI/discussions) for questions
- **📧 Email**: team@brainbytes.app

### Community
- **Discord Server**: [Join our community](https://discord.gg/brainbytes) (Coming Soon)
- **Twitter**: [@BrainBytesAI](https://twitter.com/brainbytesai) (Coming Soon)
- **Blog**: [Development Blog](https://blog.brainbytes.app) (Coming Soon)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

- **🏠 Homepage**: [https://brainbytes.app](https://brainbytes.app) (Coming Soon)
- **📊 GitHub**: [https://github.com/Honeegee/BrainBytesAI](https://github.com/Honeegee/BrainBytesAI)
- **📋 Documentation**: [Documentation Index](DOCUMENTATION_INDEX.md)
- **🚀 Live Demo**: [https://demo.brainbytes.app](https://demo.brainbytes.app) (Coming Soon)

---

<div align="center">

**🧠 BrainBytes AI**  
*Empowering Filipino students through intelligent tutoring technology*

Made with ❤️ by the BrainBytes AI Team

</div>

# BrainBytes AI Tutoring Platform

<div align="center">

[![CI/CD Pipeline](https://github.com/Honeegee/BrainBytesAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/ci-cd.yml)
[![Code Quality & Security](https://github.com/Honeegee/BrainBytesAI/actions/workflows/code-quality.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/code-quality.yml)
[![Deploy to Heroku](https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml)

**🎓 An innovative AI-powered tutoring platform designed for Filipino students**

[🚀 Live Demo](https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com) • [📖 Documentation](docs/DOCUMENTATION_INDEX.md) • [🐛 Report Bug](https://github.com/Honeegee/BrainBytesAI/issues) • [💡 Request Feature](https://github.com/Honeegee/BrainBytesAI/discussions)

> **🎓 Milestone 2: CI/CD Implementation and Cloud Deployment - COMPLETE**
> **📋 [Final Submission Document](docs/MILESTONE_2_FINAL_SUBMISSION.md)**
> **🔍 Run Validation**: `bash scripts/final-validation.sh` or `scripts/final-validation.bat`

## 📋 Overview

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Architecture](#️-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Monitoring](#-monitoring)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [Support](#-support)
- [License](#-license)

## 🌟 Overview

BrainBytes is a comprehensive AI-powered tutoring platform that leverages cutting-edge technology to provide personalized educational assistance to Filipino students. Built with modern web technologies and deployed on cloud infrastructure, it offers an interactive, scalable, and secure learning environment.

### 🎯 Mission
Empowering Filipino students through intelligent tutoring technology that adapts to individual learning needs and provides accessible academic support.

### 🏆 Key Achievements
- ✅ **Production Ready**: Fully deployed on Heroku with staging and production environments
- ✅ **CI/CD Pipeline**: Automated testing, security scanning, and deployment
- ✅ **Comprehensive Testing**: 80%+ code coverage with unit, integration, and E2E tests
- ✅ **Monitoring & Observability**: Full-stack monitoring with Prometheus and Grafana
- ✅ **Security Hardened**: Automated vulnerability scanning and secure authentication

## ✨ Features

### 🤖 AI-Powered Learning
- **Intelligent Tutoring**: Advanced AI responses using Groq API with deepseek-r1-distill-llama-70b model
- **Personalized Content**: Adaptive learning materials based on student performance
- **Interactive Chat**: Real-time conversation interface with context-aware responses

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication system
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Session Management**: Secure session handling with automatic expiration
- **Input Validation**: Comprehensive sanitization and validation

### 📊 Analytics & Monitoring
- **Progress Tracking**: Detailed learning analytics and performance metrics
- **Real-time Monitoring**: System health monitoring with Prometheus
- **Performance Insights**: Response time tracking and optimization
- **Business Intelligence**: User engagement and subject popularity analytics

### 🌐 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Progressive Web App**: Offline capability and mobile-first design
- **Accessibility**: WCAG 2.1 compliant interface
- **Multi-language Support**: English and Filipino language support

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.3 | React framework with SSR/SSG |
| **React** | 18.2.0 | UI library |
| **Tailwind CSS** | 3.3.6 | Utility-first CSS framework |
| **Chart.js** | 4.4.9 | Data visualization |
| **Lucide React** | 0.509.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥18.0.0 | JavaScript runtime |
| **Express.js** | Latest | Web application framework |
| **MongoDB** | Atlas | NoSQL database |
| **Mongoose** | Latest | MongoDB ODM |
| **JWT** | Latest | Authentication tokens |

### AI Service
| Technology | Version | Purpose |
|------------|---------|---------|
| **Groq API** | Latest | AI model provider |
| **deepseek-r1-distill-llama-70b** | Latest | Language model |
| **Axios** | 1.9.0 | HTTP client |

### Infrastructure & DevOps
| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | Latest | Containerization |
| **Docker Compose** | Latest | Multi-container orchestration |
| **nginx** | Alpine | Reverse proxy and load balancer |
| **Heroku** | Latest | Cloud platform (Production) |
| **GitHub Actions** | Latest | CI/CD pipeline |

### Monitoring Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Prometheus** | Latest | Metrics collection |
| **Grafana** | Latest | Visualization and dashboards |
| **Alertmanager** | Latest | Alert management |
| **cAdvisor** | Latest | Container metrics |
| **Node Exporter** | Latest | Host metrics |
| **Redis** | 7-alpine | Caching and session storage |

## 🏛️ Architecture

### System Overview
![System Architecture](docs/architecture.png)

The architecture follows a microservices pattern with different configurations:

### Development Environment
- **nginx Proxy** (Port 80): Routes traffic to all services
- **Frontend**: Next.js application served via nginx
- **Backend**: Express.js API server via nginx
- **AI Service**: Dedicated AI processing service via nginx
- **Monitoring**: Prometheus, Grafana, Alertmanager (Port 8080)

### Production Environment (Heroku)
- **Frontend**: [`brainbytes-frontend-production`](https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com)
- **Backend**: [`brainbytes-backend-production`](https://brainbytes-backend-production-d355616d0f1f.herokuapp.com)
- **AI Service**: [`brainbytes-ai-production`](https://brainbytes-ai-production-3833f742ba79.herokuapp.com)
- **Database**: MongoDB Atlas (Asia-Pacific region)

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Docker Desktop** (v20.10+) - [Download](https://www.docker.com/products/docker-desktop)
- **Git** (v2.30+) - [Download](https://git-scm.com/downloads)
- **Node.js** (v18.0+) - [Download](https://nodejs.org/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Honeegee/BrainBytesAI.git
   ```

2. **Environment Setup**
   ```bash
  # Copy example environment files for each service
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   cp ai-service/.env.example ai-service/.env

# Copy the root .env file
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   
   **Backend (`.env`)**:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

   **AI Service (`.env`)**:
   ```env
   GROQ_API_KEY=your_groq_api_key
   PORT=3002
   ```

   **Frontend (`.env.local`)**:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost
   NEXT_PUBLIC_API_URL=http://localhost
   ```

   **Root Folder Environment for Heroku Monitoring (.env)**
   ```bash
   HEROKU_API_TOKEN=your_heroku_api_token_here
   NODE_ENV=development
   ```

4. **Start the Application**
   ```bash
   # Build and start all services
   npm run dev

   # Or start in detached mode
   npm run dev:detached
   ```

5. **Verify Installation**
   ```bash
   # Check service status
   docker-compose ps

   # Test API endpoints
   curl http://localhost/api/health
   curl http://localhost:8090/health
   ```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application interface |
| **Backend API** | http://localhost/api | REST API endpoints |
| **AI Service** | http://localhost:8090 | AI processing service |
| **Monitoring** | http://localhost:8080 | Prometheus, Grafana dashboards |
| **Grafana** | http://localhost:8080/grafana | Visualization dashboards |

**Default Grafana Credentials**: `admin` / `brainbytes123`

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| [`npm run dev`](package.json:6) | Start development environment |
| [`npm run dev:detached`](package.json:7) | Start in background mode |
| [`npm run stop`](package.json:8) | Stop all services |
| [`npm run clean`](package.json:9) | Clean containers and volumes |
| [`npm run logs`](package.json:20) | View all service logs |
| [`npm run test:all`](package.json:40) | Run all tests |
| [`npm run lint:all`](package.json:24) | Lint all services |
| [`npm run prettier:all`](package.json:32) | Check code formatting |

### Service-Specific Commands

**Frontend**:
```bash
npm run logs:frontend        # View frontend logs
npm run lint:frontend        # Lint frontend code
npm run test:frontend        # Run frontend tests
```

**Backend**:
```bash
npm run logs:backend         # View backend logs
npm run lint:backend         # Lint backend code
npm run test:backend         # Run backend tests
```

**AI Service**:
```bash
npm run logs:ai-service      # View AI service logs
npm run lint:ai-service      # Lint AI service code
npm run test:ai-service      # Run AI service tests
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards and best practices
   - Write comprehensive tests
   - Update documentation as needed

3. **Quality Checks**
   ```bash
   npm run test:all           # Run all tests
   npm run lint:all           # Check code style
   npm run prettier:all       # Check formatting
   npm run audit:all          # Security audit
   ```

4. **Submit Pull Request**
   - Provide clear description of changes
   - Include test results and coverage
   - Request appropriate reviewers

## 🧪 Testing

### Testing Strategy

| Test Type | Coverage | Tools | Purpose |
|-----------|----------|-------|---------|
| **Unit Tests** | 80%+ | Jest | Component and function testing |
| **Integration Tests** | All APIs | Supertest | Service interaction testing |
| **E2E Tests** | Critical flows | Playwright | End-to-end workflow testing |
| **Performance Tests** | Key endpoints | Artillery | Load and stress testing |

### Running Tests

```bash
# Run all tests
npm run test:all

# Run tests with coverage
npm run test:all:coverage

# Run specific test suites
npm run test:frontend        # Frontend tests only
npm run test:backend         # Backend tests only
npm run test:ai-service      # AI service tests only
npm run test:e2e            # End-to-end tests only
```

### Test Configuration

- **Jest**: Unit and integration testing
- **Playwright**: E2E testing with browser automation
- **Puppeteer**: Additional browser testing capabilities
- **Artillery**: Performance and load testing

## 🚀 Deployment

### Environments

| Environment | Frontend | Backend | AI Service | Status |
|-------------|----------|---------|------------|--------|
| **Production** | [Frontend](https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com) | [Backend](https://brainbytes-backend-production-d355616d0f1f.herokuapp.com) | [AI Service](https://brainbytes-ai-production-3833f742ba79.herokuapp.com) | 🟢 Active |
| **Staging** | [Frontend](https://brainbytes-frontend-staging-7593f4655363.herokuapp.com) | [Backend](https://brainbytes-backend-staging-de872da2939f.herokuapp.com) | [AI Service](https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com) | 🟢 Active |

### CI/CD Pipeline

The project uses a comprehensive 3-workflow GitHub Actions pipeline:

1. **Code Quality & Security** - Linting, testing, and vulnerability scanning
2. **CI/CD Pipeline** - Build, test, and deploy to staging
3. **Deploy to Heroku** - Production deployment with approval gates

### Manual Deployment

```bash
# Deploy to staging
npm run staging:up

# Deploy to production (requires approval)
npm run production:up
```

### Database

- **Development**: Local MongoDB or MongoDB Atlas
- **Production**: MongoDB Atlas (Asia-Pacific region)
- **Backup**: Automated daily backups via MongoDB Atlas

## 📊 Monitoring

### Metrics Collection

The platform includes comprehensive monitoring with:

- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: User engagement, subject popularity, learning progress
- **Infrastructure Metrics**: CPU, memory, disk usage, network I/O
- **Container Metrics**: Docker container performance and resource usage

### Dashboards

Access monitoring dashboards at `http://localhost:8080/grafana`:

- **Application Overview**: High-level application health
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Error rates and failure analysis
- **Business Intelligence**: User engagement and learning analytics

### Alerting

Automated alerts for:
- High error rates (>5%)
- Slow response times (>500ms)
- High resource usage (>80%)
- Service downtime

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

### Code Standards

- **ESLint**: Airbnb configuration for consistent code style
- **Prettier**: Automated code formatting
- **TypeScript**: Type safety where applicable
- **Testing**: Comprehensive test coverage required
- **Documentation**: Update docs for new features

### Review Process

- ✅ All PRs require at least one approval
- ✅ Automated CI/CD checks must pass
- ✅ Code coverage must not decrease
- ✅ Security scans must show no critical vulnerabilities
- ✅ Documentation updates included

## 📚 Documentation

### 📖 Complete Documentation Index
> **[📊 Documentation Hub](docs/DOCUMENTATION_INDEX.md)** - Navigate all project documentation

### 🚀 Getting Started
- **[Setup Guide](docs/guides/SETUP.md)** - Complete installation and configuration
- **[Project Overview](README.md)** - This document

### 🔧 Technical References
- **[API Documentation](docs/technical/API.md)** - Comprehensive API reference
- **[Database Schema](docs/technical/DATABASE.md)** - Database design and models
- **[AI Integration](docs/technical/AI_INTEGRATION.md)** - AI service implementation
- **[Monitoring Setup](docs/monitoring/QUICK_START.md)** - Monitoring and metrics

### 🧪 Testing & Quality
- **[Testing Guide](docs/testing/TESTING_GUIDE.md)** - Complete testing strategy
- **[Performance Testing](docs/testing/PERFORMANCE_TESTING.md)** - Load testing guide
- **[Comprehensive Testing](docs/testing/Comprehensive_testing_doc.md)** - Testing documentation

### 🚀 Deployment & Operations
- **[Deployment Plan](docs/deployment/COMPREHENSIVE_DEPLOYMENT_PLAN.md)** - Complete deployment strategy
- **[CI/CD Documentation](docs/deployment/CI_CD_DOCUMENTATION.md)** - GitHub Actions workflows
- **[Heroku Setup](docs/deployment/HEROKU_SETUP.md)** - Platform-specific setup
- **[Operational Runbook](docs/deployment/OPERATIONAL_RUNBOOK.md)** - Operations guide

### 📊 Architecture & Diagrams
- **[System Architecture](docs/diagrams/systemArchitecture.md)** - Complete system design
- **[Data Flow](docs/diagrams/dataFlow.md)** - Information architecture
- **[Network Topology](docs/diagrams/networkTopology.md)** - Infrastructure layout
- **[CI/CD Pipeline](docs/diagrams/cicdPipeline.md)** - Pipeline visualization

## 👥 Development Team

| Team Member | Role | Specialization | Status |
|-------------|------|----------------|--------|
| **Honey Grace Denolan** | Project Lead & Full-Stack Developer | Architecture & DevOps | ✅ Active |
| **Rhico Abueme** | Backend Developer | API & Database Design | ✅ Active |
| **Zyra Joy Dongon** | Frontend Developer | UI/UX & React Development | ✅ Active |
| **Adam Raymond Belda** | AI Integration Specialist | Machine Learning & AI Services | ✅ Active |

### Team Setup Status
- ✅ Docker Desktop configured across all environments
- ✅ Git workflow and branching strategy established
- ✅ VS Code development environment standardized
- ✅ Local development environments tested and verified
- ✅ CI/CD pipeline operational with automated testing

## 📊 Performance Benchmarks

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Response Time (Mean)** | < 200ms | ~170ms | 🟢 Exceeding |
| **Response Time (P95)** | < 500ms | ~450ms | 🟢 Meeting |
| **Success Rate** | > 99% | 99.5% | 🟢 Exceeding |
| **Throughput** | > 30 req/sec | ~30 req/sec | 🟢 Meeting |
| **Uptime** | > 99.9% | 99.95% | 🟢 Exceeding |
| **Code Coverage** | > 80% | 85%+ | 🟢 Exceeding |

## 🔒 Security

### Security Measures
- **🔐 Authentication**: JWT tokens with secure storage and rotation
- **🛡️ Password Security**: bcrypt hashing with configurable salt rounds
- **🔍 Input Validation**: Comprehensive sanitization and validation
- **🌐 HTTPS**: SSL/TLS encryption for all communications
- **🔑 Secrets Management**: Environment-based configuration
- **🚫 CORS**: Properly configured cross-origin policies
- **⚡ Rate Limiting**: API endpoint protection against abuse
- **🛡️ Security Headers**: Comprehensive security header implementation
- **🔍 Vulnerability Scanning**: Automated security audits in CI/CD

### Reporting Security Issues
For security vulnerabilities, please email: **security@brainbytes.app**

## 📞 Support

### Getting Help
- **📖 Documentation**: Check the [Documentation Index](docs/DOCUMENTATION_INDEX.md)
- **🐛 Bug Reports**: Create [GitHub Issues](https://github.com/Honeegee/BrainBytesAI/issues)
- **💬 Discussions**: Use [GitHub Discussions](https://github.com/Honeegee/BrainBytesAI/discussions)
- **📧 Email**: team@brainbytes.app

### Community
- **Discord**: [Join our community](https://discord.gg/brainbytes) (Coming Soon)
- **Twitter**: [@BrainBytesAI](https://twitter.com/BrainBytesAI) (Coming Soon)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🔗 Quick Links

### 🌐 Live Environments
- **🚀 [Production App](https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com)**
- **🧪 [Staging App](https://brainbytes-frontend-staging-7593f4655363.herokuapp.com)**

### 📊 Development Resources
- **📋 [GitHub Repository](https://github.com/Honeegee/BrainBytesAI)**
- **⚙️ [GitHub Actions](https://github.com/Honeegee/BrainBytesAI/actions)**
- **📖 [Complete Documentation](docs/DOCUMENTATION_INDEX.md)**

### 🎓 Project Milestones
- **📋 [Milestone 2 Final Submission](docs/MILESTONE_2_FINAL_SUBMISSION.md)**
- **🔍 [Validation Scripts](scripts/final-validation.sh)**

---

<div align="center">

**🧠 BrainBytes AI**  
*Empowering Filipino students through intelligent tutoring technology*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Honeegee/BrainBytesAI)
[![Built with Docker](https://img.shields.io/badge/Built%20with-Docker-blue.svg)](https://www.docker.com/)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-green.svg)](https://groq.com/)

**Made with ❤️ by the BrainBytes AI Team**

</div>

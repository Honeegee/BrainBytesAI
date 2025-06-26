# BrainBytes AI Tutoring Platform

[![CI/CD Pipeline](https://github.com/Honeegee/BrainBytesAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/ci-cd.yml)
[![Code Quality & Security](https://github.com/Honeegee/BrainBytesAI/actions/workflows/code-quality.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/code-quality.yml)
[![Deploy to Heroku](https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml/badge.svg)](https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml)

> **🎓 Milestone 2: CI/CD Implementation and Cloud Deployment - COMPLETE**
> **📋 [Final Submission Document](docs/MILESTONE_2_FINAL_SUBMISSION.md)**
> **🔍 Run Validation**: `bash scripts/final-validation.sh` or `scripts/final-validation.bat`

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
- **Cloud Platform**: Heroku (Production & Staging)
- **Database**: MongoDB Atlas (Asia-Pacific region)
- **CI/CD**: GitHub Actions (3-workflow pipeline)
- **Security**: Automated vulnerability scanning

### Monitoring & Observability
- **Metrics Collection**: Prometheus with custom business metrics
- **System Monitoring**: Node Exporter for host metrics
- **Container Monitoring**: cAdvisor for Docker containers
- **Performance Tracking**: HTTP request duration, AI response times
- **Business Intelligence**: User engagement, subject popularity
- **Philippine Context**: Mobile usage, bandwidth optimization metrics

## 🏛️ Architecture

![System Architecture](docs/architecture.png)

The architecture follows a microservices pattern with different configurations:

### Development Environment (Docker + nginx)
- **nginx Proxy** (Port 80): Reverse proxy for all services
- **Frontend Service**: Next.js React application (via nginx)
- **Backend Service**: Node.js API server (via nginx)
- **AI Service**: Dedicated AI processing service (via nginx)
- **Monitoring Stack**: Prometheus, Grafana, Alertmanager (via nginx:8080)

### Production Environment (Heroku)
- **Frontend Service**: Direct Heroku app deployment
- **Backend Service**: Direct Heroku app deployment
- **AI Service**: Direct Heroku app deployment
- **Monitoring**: Grafana Cloud integration

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
   # Copy example files and configure
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   cp ai-service/.env.example ai-service/.env
   
   # Configure required variables:
   # 1. Backend (.env): Add your MongoDB connection string
   # 2. AI Service (.env): Add your Groq API key
   # 3. Frontend (.env.local): Usually defaults work for Docker setup
   ```

   **Environment Configuration Guide:**
   - **Docker Setup** (Recommended): Use `http://ai-service:3002` for inter-container communication
   - **Local Development**: Use `http://localhost:3002` for direct service access
   - **Frontend**: Access via nginx proxy at `http://localhost` for Docker setup

3. **Start the application**:
   ```bash
   # Build and start all services
   docker-compose up -d --build
   
   # Verify services are running
   docker-compose ps
   ```

4. **Access the application**:
   - **Frontend**: http://localhost (via nginx proxy)
   - **Backend API**: http://localhost/api (via nginx proxy)
   - **AI Service**: http://localhost:8090 (via nginx proxy)
   - **Monitoring**: http://localhost:8080 (Prometheus, Grafana, etc.)

### Verification

```bash
# Test API endpoints (via nginx proxy)
curl http://localhost/api/health
curl http://localhost:8090/health

# Check frontend accessibility (via nginx proxy)
curl http://localhost

# Direct service access (if needed for debugging)
curl http://localhost:9090  # Prometheus
curl http://localhost:3000  # Grafana
```

## 📚 Documentation

> **📊 [Complete Documentation Index](docs/DOCUMENTATION_INDEX.md)** - Navigate all project documentation
>


### 🚀 Getting Started
- **[Setup Guide](docs/guides/SETUP.md)** - Complete installation and configuration
- **[Project README](README.md)** - This overview document

### 🔧 Technical References
- **[API Documentation](docs/technical/API.md)** - Comprehensive API reference
- **[Database Schema](docs/technical/DATABASE.md)** - Database design and models
- **[AI Integration](docs/technical/AI_INTEGRATION.md)** - AI service implementation
- **[Prometheus Monitoring](docs/PROMETHEUS_MONITORING.md)** - Monitoring and metrics setup

### 🧪 Testing & Quality
- **[Testing Guide](docs/testing/TESTING_GUIDE.md)** - Complete testing strategy
- **[Performance Testing](docs/testing/PERFORMANCE_TESTING.md)** - Load testing guide
- **[Comprehensive Testing](docs/testing/Comprehensive_testing_doc.md)** - Complete testing documentation

### 🚀 Deployment & Operations
- **[Comprehensive Deployment Plan](docs/deployment/COMPREHENSIVE_DEPLOYMENT_PLAN.md)** - Complete deployment strategy
- **[CI/CD Documentation](docs/deployment/CI_CD_DOCUMENTATION.md)** - GitHub Actions workflows
- **[Heroku Setup Guide](docs/deployment/HEROKU_SETUP.md)** - Platform-specific setup
- **[Architecture Diagrams](docs/deployment/ARCHITECTURE_DIAGRAM.md)** - System architecture visualization
- **[Operational Runbook](docs/deployment/OPERATIONAL_RUNBOOK.md)** - Operations & maintenance

### 📊 System Diagrams
- **[System Architecture](docs/diagrams/systemArchitecture.md)** - Complete system design
- **[Data Flow](docs/diagrams/dataFlow.md)** - Information architecture
- **[Network Topology](docs/diagrams/networkTopology.md)** - Infrastructure layout
- **[CI/CD Pipeline](docs/diagrams/cicdPipeline.md)** - Pipeline visualization
- **[Technology Stack](docs/diagrams/technologyStack.md)** - Tech stack overview

### 📊 Project Management
- **[Task Distribution](docs/project/task-distribution.md)** - Roadmap and assignments

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
docker-compose up

# Start with monitoring (Prometheus + metrics)
docker-compose up -d

# Generate test metrics data
cd monitoring && npm run simulate

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



### **🔍 Pre-Submission Validation**
```bash
# Linux/macOS
bash scripts/final-validation.sh

# Windows
scripts/final-validation.bat
```

### Current Implementation Status
- 🟢 **Core Platform**: Fully implemented and deployed
- 🟢 **Heroku Deployment**: Production & staging environments operational
- 🟢 **CI/CD Pipeline**: 3-workflow GitHub Actions pipeline operational
- 🟢 **Security**: Automated scanning and JWT authentication implemented
- 🟢 **Documentation**: Comprehensive documentation (3,142+ lines) 
- 🟡 **Philippine Optimizations**: Documented roadmap, basic responsive design implemented



### Implementation Breakdown
- ✅ **Cloud Environment**: Heroku deployment with MongoDB Atlas (100% complete)
- ✅ **Security Hardening**: Automated vulnerability scanning
- ✅ **CI/CD Pipeline**: Matrix testing, E2E tests, deployment automation
- ✅ **Documentation**: Architecture diagrams, operational procedures, accessible via GitHub Pages
- ✅ **Documentation Accessibility**: All technical docs now properly accessible
- ⚠️ **Philippine-Specific Features**: Planned enhancements (PWA, offline capability, advanced mobile optimization)

## 📞 Support

### Getting Help
- **📖 Documentation**: Check the [Documentation Index](DOCUMENTATION_INDEX.md)
- **🐛 Issues**: Create [GitHub Issues](https://github.com/Honeegee/BrainBytesAI/issues) for bugs
- **💬 Discussions**: Use [GitHub Discussions](https://github.com/Honeegee/BrainBytesAI/discussions) for questions
- **📧 Email**: team@brainbytes.app



## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

### Live Environments
- **🚀 Production Frontend**: [https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com](https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com)
- **🔧 Production Backend**: [https://brainbytes-backend-production-d355616d0f1f.herokuapp.com](https://brainbytes-backend-production-d355616d0f1f.herokuapp.com)
- **🤖 Production AI Service**: [https://brainbytes-ai-production-3833f742ba79.herokuapp.com](https://brainbytes-ai-production-3833f742ba79.herokuapp.com)
- **🧪 Staging Frontend**: [https://brainbytes-frontend-staging-7593f4655363.herokuapp.com](https://brainbytes-frontend-staging-7593f4655363.herokuapp.com)
- **🧪 Staging Backend**: [https://brainbytes-backend-staging-de872da2939f.herokuapp.com](https://brainbytes-backend-staging-de872da2939f.herokuapp.com)
- **🧪 Staging AI Service**: [https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com](https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com)

### Documentation & Development
- **🎓 Milestone 2 Final Submission**: [docs/MILESTONE_2_FINAL_SUBMISSION.md](docs/MILESTONE_2_FINAL_SUBMISSION.md)
- **📊 GitHub Repository**: [https://github.com/Honeegee/BrainBytesAI](https://github.com/Honeegee/BrainBytesAI)
- **📋 Complete Documentation**: [Documentation Index](docs/DOCUMENTATION_INDEX.md)
- **⚙️ GitHub Actions**: [CI/CD Workflows](https://github.com/Honeegee/BrainBytesAI/actions)


---

<div align="center">

**🧠 BrainBytes AI**  
*Empowering Filipino students through intelligent tutoring technology*

Made with ❤️ by the BrainBytes AI Team

</div>

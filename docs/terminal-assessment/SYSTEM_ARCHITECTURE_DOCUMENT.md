# BrainBytesAI System Architecture Document
## Complete Containerized Architecture (Updated July 2025)

**Document Version**: 2.0  
**Date**: July 2025  
**Author**: BrainBytesAI Development Team

---

## Executive Summary

BrainBytesAI is a production-ready, containerized AI-powered educational platform designed specifically for Filipino students. The system demonstrates enterprise-level DevOps practices with comprehensive monitoring, automated deployment, and operational excellence.

---

## Containerized Architecture Diagram

![System Architecture](../architecture.png)

---

## Component Interactions

### Core Services
1. **Frontend Service** (Next.js)
   - Containerized with Docker
   - Port 3000 exposed
   - 1GB memory limit
   - Depends on backend service

2. **Backend Service** (Node.js/Express)
   - Containerized with Docker
   - Port 3000 exposed
   - 1GB memory limit
   - Connects to MongoDB Atlas and Redis
   - Depends on AI service

3. **AI Service** (Node.js)
   - Containerized with Docker
   - Port 3002 exposed
   - 2GB memory limit
   - Integrates with Groq API

4. **Nginx Reverse Proxy**
   - Routes traffic to all services
   - Handles ports 80/8080
   - Load balances between containers

---

## Cloud Deployment Configuration

### Heroku Platform Architecture
```mermaid
graph LR
    subgraph "Production Environment"
        FE_PROD[Frontend\nbrainbytes-frontend-production]
        BE_PROD[Backend\nbrainbytes-backend-production]
        AI_PROD[AI Service\nbrainbytes-ai-production]
    end
    
    subgraph "Staging Environment"
        FE_STAGE[Frontend\nbrainbytes-frontend-staging]
        BE_STAGE[Backend\nbrainbytes-backend-staging]
        AI_STAGE[AI Service\nbrainbytes-ai-service-staging]
    end
    
    CI[CI/CD Pipeline] -->|Deploys| FE_STAGE
    CI -->|Deploys| BE_STAGE
    CI -->|Deploys| AI_STAGE
    
    QA[QA Testing] -->|Approves| PROD_DEPLOY
    PROD_DEPLOY[Production Deployment] --> FE_PROD
    PROD_DEPLOY --> BE_PROD
    PROD_DEPLOY --> AI_PROD
```

### Deployment Features:
- Automated deployments via GitHub Actions
- Environment-specific configuration
- Health verification checks
- Rollback capabilities

---

## CI/CD Pipeline Structure

```mermaid
graph TD
    A[Code Push/PR] --> B[Code Quality & Security Scan]
    A --> C[CI/CD Pipeline]
    
    B --> B1[ESLint & Prettier]
    B --> B2[Security Audit]
    B --> B3[Secrets Scanning]
    B --> B4[Code Analysis]
    
    C --> C1[Setup & Dependencies]
    C1 --> C2[Matrix Testing]
    C2 --> C3[Docker Build & Health Checks]
    C3 --> C4[E2E Testing with MongoDB Atlas]
    C4 --> C5[Performance Testing]
    C5 --> C6[Test Reporting]
    
    A --> D{Branch?}
    D -->|develop| E[Auto Deploy to Staging]
    D -->|main| F[All Tests Pass]
    
    F --> G[Ready for Production Deploy]
    G --> H[Manual Trigger Required]
    H -->|Triggered| I[Deploy to Production]
    
    E --> K[Staging Health Checks]
    I --> L[Production Health Checks]
    
    style G fill:#2196f3,stroke:#1565c0,stroke-width:2px
    style H fill:#ff9800,stroke:#e65100,stroke-width:3px
    style I fill:#4caf50,stroke:#2e7d32,stroke-width:2px
```

### Pipeline Stages:
1. **Code Quality Checks**
   - ESLint, Prettier
   - Security scans
   - Dependency audits

2. **Testing Matrix**
   - Unit tests across Node.js versions
   - Integration tests
   - Coverage reporting

3. **Docker Validation**
   - Image builds
   - Container health checks

4. **E2E Testing**
   - Playwright tests
   - MongoDB Atlas integration

5. **Performance Testing**
   - Artillery load tests
   - Response time metrics

6. **Deployment**
   - Staging deployment (automatic)
   - Production deployment (manual approval)

---

## Monitoring Architecture

### Containerized Monitoring Stack
```mermaid
graph TD
    PM[Prometheus] -->|Scrapes| FE[Frontend Metrics]
    PM -->|Scrapes| BE[Backend Metrics]
    PM -->|Scrapes| AI[AI Service Metrics]
    PM -->|Scrapes| CA[cAdvisor]
    PM -->|Scrapes| NE[Node Exporter]
    PM -->|Alerts| AM[Alertmanager]
    GR[Grafana] -->|Visualizes| PM
```

### Key Metrics:
- Container resource usage
- API response times
- Error rates
- User engagement
- AI processing performance

---

## Security Architecture

### Layers:
1. **Network Security**
   - HTTPS enforcement
   - CORS configuration
   - Rate limiting via Nginx

2. **Application Security**
   - Input validation
   - JWT authentication
   - Role-based access

3. **Container Security**
   - Resource limits
   - Read-only filesystems
   - Non-root users

---

## Performance Optimization

### Strategies:
1. **Frontend**
   - Server-side rendering
   - Code splitting
   - CDN caching

2. **Backend**
   - Redis caching
   - Connection pooling
   - Async processing

3. **Infrastructure**
   - Load balancing
   - Auto-scaling
   - Container optimization

---

## Technology Stack

### Core Technologies:
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI Service**: Node.js, Groq API
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana, Alertmanager
- **Deployment**: Heroku

---

## Conclusion

This architecture provides:
- Fully containerized microservices
- Comprehensive CI/CD automation
- Production-grade monitoring
- Scalable cloud deployment
- Security best practices
- Optimized performance

The system is designed for high availability while maintaining excellent performance for Filipino students.

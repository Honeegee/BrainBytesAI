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

```mermaid
graph TD
    subgraph "Docker Containers"
        FE[Frontend\nNext.js\nPort: 3000]
        BE[Backend\nNode.js\nPort: 3000]
        AI[AI Service\nNode.js\nPort: 3002]
        NG[Nginx\nReverse Proxy\nPorts: 80/8080]
        PM[Prometheus\nMetrics\nPort: 9090]
        GR[Grafana\nVisualization\nPort: 3003]
        AM[Alertmanager\nPort: 9093]
        CA[cAdvisor\nContainer Metrics\nPort: 8081]
        NE[Node Exporter\nSystem Metrics\nPort: 9100]
    end

    subgraph "External Services"
        DB[(MongoDB Atlas)]
        REDIS[(Redis)]
        GROQ[Groq API]
        HEROKU[Heroku Platform]
    end

    %% Internal connections
    NG -->|Routes| FE
    NG -->|Routes| BE
    NG -->|Routes| AI
    NG -->|Routes| PM
    NG -->|Routes| GR
    
    FE -->|API Calls| BE
    BE -->|AI Requests| AI
    BE -->|Database| DB
    BE -->|Cache| REDIS
    AI -->|LLM API| GROQ
    
    %% Monitoring connections
    PM -->|Scrapes| FE
    PM -->|Scrapes| BE
    PM -->|Scrapes| AI
    PM -->|Scrapes| CA
    PM -->|Scrapes| NE
    PM -->|Alerts| AM
    GR -->|Visualizes| PM
    CA -->|Container Metrics| PM
    NE -->|System Metrics| PM
    
    %% Deployment
    HEROKU -->|Hosts| FE
    HEROKU -->|Hosts| BE
    HEROKU -->|Hosts| AI
```

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
graph LR
    subgraph "GitHub Actions"
        CODE[Code Push] --> LINT[Lint & Format]
        LINT --> SEC[Security Scan]
        SEC --> TEST[Test Matrix]
        TEST --> BUILD[Docker Build]
        BUILD --> E2E[E2E Tests]
        E2E --> PERF[Performance Tests]
        PERF --> DEPLOY_STAGE[Deploy Staging]
        DEPLOY_STAGE --> APPROVAL[Manual Approval]
        APPROVAL --> DEPLOY_PROD[Deploy Production]
    end
    
    subgraph "Monitoring"
        DEPLOY_PROD --> MONITOR[Prometheus/Grafana]
        MONITOR --> ALERT[Alertmanager]
    end
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

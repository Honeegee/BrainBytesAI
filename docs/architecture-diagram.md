# BrainBytesAI Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    %% External Services
    subgraph "External Services"
        ATLAS[(MongoDB Atlas)]
        OPENAI[OpenAI API]
        GITHUB[GitHub Repository]
    end

    %% CI/CD Pipeline
    subgraph "CI/CD Pipeline"
        GHA[GitHub Actions]
        QUALITY[Code Quality & Security]
        DEPLOY[Deployment Pipeline]
        E2E[E2E Tests]
    end

    %% Production Environment
    subgraph "Production Environment"
        direction TB
        PROD_FE[Frontend Container<br/>Next.js + React<br/>Port: 3001]
        PROD_BE[Backend Container<br/>Node.js + Express<br/>Port: 3000]
        PROD_AI[AI Service Container<br/>Node.js + Express<br/>Port: 3002]
        
        PROD_FE --> PROD_BE
        PROD_BE --> PROD_AI
    end

    %% Staging Environment
    subgraph "Staging Environment"
        direction TB
        STAGE_FE[Frontend Container<br/>Next.js + React<br/>Port: 3001]
        STAGE_BE[Backend Container<br/>Node.js + Express<br/>Port: 3000]
        STAGE_AI[AI Service Container<br/>Node.js + Express<br/>Port: 3002]
        
        STAGE_FE --> STAGE_BE
        STAGE_BE --> STAGE_AI
    end

    %% Development Environment
    subgraph "Development Environment"
        direction TB
        DEV_FE[Frontend Container<br/>Next.js + React<br/>Port: 3001]
        DEV_BE[Backend Container<br/>Node.js + Express<br/>Port: 3000]
        DEV_AI[AI Service Container<br/>Node.js + Express<br/>Port: 3002]
        
        DEV_FE --> DEV_BE
        DEV_BE --> DEV_AI
    end

    %% Testing Infrastructure
    subgraph "Testing Infrastructure"
        UNIT[Unit Tests<br/>Jest]
        INT[Integration Tests<br/>Jest + Supertest]
        E2E_TESTS[E2E Tests<br/>Playwright]
        COVERAGE[Code Coverage<br/>Jest]
    end

    %% User Layer
    subgraph "User Interface"
        BROWSER[Web Browser]
        MOBILE[Mobile Browser]
    end

    %% Connections
    BROWSER --> PROD_FE
    MOBILE --> PROD_FE
    
    GITHUB --> GHA
    GHA --> QUALITY
    GHA --> DEPLOY
    GHA --> E2E
    
    DEPLOY --> DEV_FE
    DEPLOY --> STAGE_FE
    DEPLOY --> PROD_FE
    
    PROD_BE --> ATLAS
    STAGE_BE --> ATLAS
    DEV_BE --> ATLAS
    
    PROD_AI --> OPENAI
    STAGE_AI --> OPENAI
    DEV_AI --> OPENAI
    
    E2E_TESTS --> DEV_FE
    UNIT --> DEV_BE
    INT --> DEV_BE
    COVERAGE --> DEV_BE

    %% Styling
    classDef frontend fill:#61DAFB,stroke:#000,color:#000
    classDef backend fill:#339933,stroke:#000,color:#fff
    classDef ai fill:#FF6B6B,stroke:#000,color:#fff
    classDef database fill:#47A248,stroke:#000,color:#fff
    classDef external fill:#FFA500,stroke:#000,color:#000
    classDef cicd fill:#2088FF,stroke:#000,color:#fff
    classDef testing fill:#9932CC,stroke:#000,color:#fff

    class PROD_FE,STAGE_FE,DEV_FE frontend
    class PROD_BE,STAGE_BE,DEV_BE backend
    class PROD_AI,STAGE_AI,DEV_AI ai
    class ATLAS database
    class OPENAI,GITHUB external
    class GHA,QUALITY,DEPLOY,E2E cicd
    class UNIT,INT,E2E_TESTS,COVERAGE testing
```

## Technology Stack Details

```mermaid
graph LR
    subgraph "Frontend Stack"
        NEXTJS[Next.js 15.3.3]
        REACT[React 18.2.0]
        TAILWIND[Tailwind CSS 3.3.5]
        CHART[Chart.js 4.4.9]
        AXIOS_FE[Axios 1.9.0]
        LUCIDE[Lucide React Icons]
    end

    subgraph "Backend Stack"
        EXPRESS[Express 4.17.1]
        MONGOOSE[Mongoose 8.15.1]
        JWT[JSON Web Tokens]
        BCRYPT[BCrypt.js]
        PASSPORT[Passport.js]
        HELMET[Helmet Security]
        CORS[CORS Middleware]
        MULTER[Multer File Upload]
        SENTIMENT[Sentiment Analysis]
    end

    subgraph "AI Service Stack"
        EXPRESS_AI[Express 4.18.2]
        AXIOS_AI[Axios 1.6.2]
        NODE_FETCH[Node Fetch]
        COMMON_RESP[Common Responses]
    end

    subgraph "Testing Stack"
        JEST[Jest 29.7.0]
        SUPERTEST[Supertest 6.3.4]
        PLAYWRIGHT[Playwright E2E]
        MONGODB_MEM[MongoDB Memory Server]
        PUPPETEER[Puppeteer]
    end

    subgraph "DevOps Stack"
        DOCKER[Docker Containers]
        DOCKER_COMPOSE[Docker Compose]
        GITHUB_ACTIONS[GitHub Actions]
        ESLINT[ESLint]
        PRETTIER[Prettier]
        NODEMON[Nodemon]
    end

    classDef frontend fill:#61DAFB,stroke:#000,color:#000
    classDef backend fill:#339933,stroke:#000,color:#fff
    classDef ai fill:#FF6B6B,stroke:#000,color:#fff
    classDef testing fill:#9932CC,stroke:#000,color:#fff
    classDef devops fill:#2088FF,stroke:#000,color:#fff

    class NEXTJS,REACT,TAILWIND,CHART,AXIOS_FE,LUCIDE frontend
    class EXPRESS,MONGOOSE,JWT,BCRYPT,PASSPORT,HELMET,CORS,MULTER,SENTIMENT backend
    class EXPRESS_AI,AXIOS_AI,NODE_FETCH,COMMON_RESP ai
    class JEST,SUPERTEST,PLAYWRIGHT,MONGODB_MEM,PUPPETEER testing
    class DOCKER,DOCKER_COMPOSE,GITHUB_ACTIONS,ESLINT,PRETTIER,NODEMON devops
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (Next.js)
    participant BE as Backend (Express)
    participant AI as AI Service
    participant DB as MongoDB Atlas
    participant EXT as OpenAI API

    U->>FE: Interacts with UI
    FE->>BE: API Request (JWT Auth)
    
    alt User Management
        BE->>DB: User CRUD Operations
        DB-->>BE: User Data
    end
    
    alt AI Chat Request
        BE->>AI: Forward Chat Request
        AI->>AI: Check Common Responses
        
        alt Complex Query
            AI->>EXT: OpenAI API Call
            EXT-->>AI: AI Response
        end
        
        AI-->>BE: Processed Response
        BE->>DB: Store Chat History
    end
    
    BE-->>FE: JSON Response
    FE-->>U: Updated UI
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Source Control"
        REPO[GitHub Repository]
        MAIN[Main Branch]
        DEV_BRANCH[Development Branch]
        FEATURE[Feature Branches]
    end

    subgraph "CI/CD Pipeline"
        TRIGGER[Push/PR Trigger]
        LINT[Linting & Formatting]
        TEST[Unit & Integration Tests]
        SECURITY[Security Scan]
        BUILD[Docker Build]
        E2E_PIPELINE[E2E Tests]
        DEPLOY_STAGE[Deploy to Staging]
        DEPLOY_PROD[Deploy to Production]
    end

    subgraph "Environments"
        DEV_ENV[Development<br/>docker-compose.yml]
        STAGE_ENV[Staging<br/>docker-compose.staging.yml]
        PROD_ENV[Production<br/>docker-compose.production.yml]
    end

    subgraph "Infrastructure"
        CONTAINERS[Docker Containers]
        NETWORK[App Network Bridge]
        VOLUMES[Persistent Volumes]
        RESOURCES[Resource Limits]
    end

    REPO --> TRIGGER
    TRIGGER --> LINT
    LINT --> TEST
    TEST --> SECURITY
    SECURITY --> BUILD
    BUILD --> E2E_PIPELINE
    E2E_PIPELINE --> DEPLOY_STAGE
    DEPLOY_STAGE --> DEPLOY_PROD
    
    DEPLOY_STAGE --> STAGE_ENV
    DEPLOY_PROD --> PROD_ENV
    
    DEV_ENV --> CONTAINERS
    STAGE_ENV --> CONTAINERS
    PROD_ENV --> CONTAINERS
    
    CONTAINERS --> NETWORK
    CONTAINERS --> VOLUMES
    CONTAINERS --> RESOURCES

    classDef source fill:#333,stroke:#000,color:#fff
    classDef pipeline fill:#2088FF,stroke:#000,color:#fff
    classDef env fill:#28A745,stroke:#000,color:#fff
    classDef infra fill:#6C757D,stroke:#000,color:#fff

    class REPO,MAIN,DEV_BRANCH,FEATURE source
    class TRIGGER,LINT,TEST,SECURITY,BUILD,E2E_PIPELINE,DEPLOY_STAGE,DEPLOY_PROD pipeline
    class DEV_ENV,STAGE_ENV,PROD_ENV env
    class CONTAINERS,NETWORK,VOLUMES,RESOURCES infra
```

## Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        CSP[Content Security Policy]
        XSS[XSS Protection]
        CORS_FE[CORS Configuration]
        JWT_STORAGE[Secure JWT Storage]
    end

    subgraph "Backend Security"
        HELMET_SEC[Helmet Security Headers]
        RATE_LIMIT[Rate Limiting]
        INPUT_VAL[Input Validation]
        AUTH_MID[Authentication Middleware]
        BCRYPT_HASH[Password Hashing]
        SESSION_SEC[Secure Sessions]
    end

    subgraph "Database Security"
        ATLAS_AUTH[Atlas Authentication]
        ENCRYPTION[Data Encryption at Rest]
        NETWORK_SEC[Network Security]
        BACKUP[Automated Backups]
    end

    subgraph "CI/CD Security"
        SECRET_SCAN[Secret Scanning]
        VULN_SCAN[Vulnerability Scanning]
        DEP_CHECK[Dependency Checking]
        CODE_ANALYSIS[Static Code Analysis]
        ENV_VARS[Environment Variables]
    end

    subgraph "Infrastructure Security"
        CONTAINER_SEC[Container Security]
        NETWORK_ISO[Network Isolation]
        RESOURCE_LIMITS[Resource Limits]
        LOG_MONITOR[Logging & Monitoring]
    end

    classDef frontend fill:#61DAFB,stroke:#000,color:#000
    classDef backend fill:#339933,stroke:#000,color:#fff
    classDef database fill:#47A248,stroke:#000,color:#fff
    classDef cicd fill:#2088FF,stroke:#000,color:#fff
    classDef infra fill:#6C757D,stroke:#000,color:#fff

    class CSP,XSS,CORS_FE,JWT_STORAGE frontend
    class HELMET_SEC,RATE_LIMIT,INPUT_VAL,AUTH_MID,BCRYPT_HASH,SESSION_SEC backend
    class ATLAS_AUTH,ENCRYPTION,NETWORK_SEC,BACKUP database
    class SECRET_SCAN,VULN_SCAN,DEP_CHECK,CODE_ANALYSIS,ENV_VARS cicd
    class CONTAINER_SEC,NETWORK_ISO,RESOURCE_LIMITS,LOG_MONITOR infra
```

## Network Architecture

```mermaid
graph TB
    subgraph "External Network"
        INTERNET[Internet]
        DNS[DNS Resolution]
    end

    subgraph "Application Network (app-network)"
        direction TB
        LB[Load Balancer]
        
        subgraph "Frontend Tier"
            FE_CONT[Frontend Container:3001]
        end
        
        subgraph "Backend Tier"
            BE_CONT[Backend Container:3000]
        end
        
        subgraph "AI Service Tier"
            AI_CONT[AI Service Container:3002]
        end
    end

    subgraph "External Services"
        ATLAS_NET[MongoDB Atlas Network]
        OPENAI_NET[OpenAI API Network]
    end

    subgraph "Port Mapping"
        PORT_3001[Host:3001 → Frontend:3000]
        PORT_3000[Host:3000 → Backend:3000]
        PORT_3002[Host:3002 → AI Service:3002]
    end

    INTERNET --> DNS
    DNS --> LB
    LB --> FE_CONT
    FE_CONT --> BE_CONT
    BE_CONT --> AI_CONT
    
    BE_CONT --> ATLAS_NET
    AI_CONT --> OPENAI_NET
    
    FE_CONT -.-> PORT_3001
    BE_CONT -.-> PORT_3000
    AI_CONT -.-> PORT_3002

    classDef external fill:#FFA500,stroke:#000,color:#000
    classDef network fill:#0066CC,stroke:#000,color:#fff
    classDef frontend fill:#61DAFB,stroke:#000,color:#000
    classDef backend fill:#339933,stroke:#000,color:#fff
    classDef ai fill:#FF6B6B,stroke:#000,color:#fff
    classDef ports fill:#6C757D,stroke:#000,color:#fff

    class INTERNET,DNS,ATLAS_NET,OPENAI_NET external
    class LB network
    class FE_CONT frontend
    class BE_CONT backend
    class AI_CONT ai
    class PORT_3001,PORT_3000,PORT_3002 ports
```

---

## Architecture Summary

This BrainBytesAI system is a modern, containerized educational AI platform with the following key characteristics:

### **Core Services**
- **Frontend**: Next.js 15 with React 18, Tailwind CSS, and Chart.js for data visualization
- **Backend**: Express.js API with comprehensive authentication, security middleware, and MongoDB integration
- **AI Service**: Dedicated service for handling AI interactions with OpenAI API and common response caching

### **Database Architecture**
- **MongoDB Atlas**: Cloud-hosted database with encryption at rest and automated backups
- **No local database**: All environments connect directly to Atlas clusters

### **DevOps & Deployment**
- **Multi-environment**: Development, Staging, and Production configurations
- **Docker containerization**: All services run in isolated containers with resource limits
- **CI/CD Pipeline**: Automated testing, security scanning, and deployment via GitHub Actions
- **Comprehensive testing**: Unit, integration, and E2E testing with Playwright

### **Security Features**
- JWT-based authentication with secure session management
- Comprehensive security headers via Helmet
- Rate limiting and input validation
- Automated security scanning and dependency checking
- Container security and network isolation

### **Monitoring & Quality**
- Code quality enforcement with ESLint and Prettier
- Automated security scans and vulnerability detection
- Resource monitoring and logging
- Performance optimization with memory limits and caching

This architecture provides a scalable, secure, and maintainable foundation for an educational AI platform.
# CI/CD Pipeline

```mermaid
graph TB
    subgraph "Development"
        DEV_GH[📚 GitHub Repository<br/>Source Code<br/>Documentation]
    end
    
    subgraph "CI/CD Pipeline"
        subgraph "GitHub Actions"
            CQ[🔍 Code Quality<br/>ESLint, Prettier<br/>Security Scan]
            CI[🧪 CI/CD Pipeline<br/>Unit Tests<br/>Integration Tests<br/>E2E Tests]
            CD[🚀 Deploy Pipeline<br/>Docker Build<br/>Multi-platform<br/>Health Checks]
        end
    end
    
    subgraph "Container Registry"
        REG[📦 GitHub Container Registry<br/>ghcr.io<br/>Docker Images<br/>Multi-platform]
    end
    
    subgraph "Deployment Targets"
        STAGING[🟡 Staging Environment<br/>Auto-deploy from main<br/>Heroku Apps]
        PROD[🟢 Production Environment<br/>Manual approval required<br/>Heroku Apps]
    end
    
    subgraph "External Services"
        GROQ_API[🧠 Groq API<br/>AI Processing]
        MONGO[🗄️ MongoDB Atlas<br/>Database Clusters]
    end
    
    %% Development Flow
    DEV_GH -->|Push/PR| CQ
    CQ -->|Quality Gates Pass| CI
    CI -->|Tests Pass| CD
    CD -->|Build Images| REG
    
    %% Deployment Flow
    REG -->|Auto Deploy| STAGING
    REG -->|Manual Deploy| PROD
    
    %% External Dependencies
    STAGING -->|API Integration| GROQ_API
    STAGING -->|Database Connection| MONGO
    PROD -->|API Integration| GROQ_API
    PROD -->|Database Connection| MONGO
    
    %% Styling
    classDef devClass fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef cicdClass fill:#f1f8e9,stroke:#2e7d32,stroke-width:2px
    classDef registryClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef deployClass fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef externalClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class DEV_GH devClass
    class CQ,CI,CD cicdClass
    class REG registryClass
    class STAGING,PROD deployClass
    class GROQ_API,MONGO externalClass
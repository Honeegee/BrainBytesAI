# Technology Stack

```mermaid
graph LR
    subgraph "Frontend Stack"
        FE_TECH[🌐 Frontend Technologies<br/>• Next.js 14<br/>• React 18<br/>• Tailwind CSS<br/>• Jest Testing<br/>• ESLint/Prettier]
    end
    
    subgraph "Backend Stack"
        BE_TECH[⚙️ Backend Technologies<br/>• Node.js 18/20/22<br/>• Express.js<br/>• MongoDB Driver<br/>• JWT Authentication<br/>• Multer File Upload]
    end
    
    subgraph "AI Stack"
        AI_TECH[🤖 AI Technologies<br/>• Node.js Runtime<br/>• Groq SDK<br/>• LLM Processing<br/>• Context Management<br/>• Response Formatting]
    end
    
    subgraph "Database Stack"
        DB_TECH[🗄️ Database Technologies<br/>• MongoDB Atlas<br/>• Mongoose ODM<br/>• Connection Pooling<br/>• Replica Sets<br/>• Auto-scaling]
    end
    
    subgraph "DevOps Stack"
        DEVOPS_TECH[🔧 DevOps Technologies<br/>• GitHub Actions<br/>• Docker Containers<br/>• Heroku Platform<br/>• Playwright E2E<br/>• Artillery Load Testing]
    end
    
    subgraph "Monitoring Stack"
        MON_TECH[📊 Monitoring Technologies<br/>• Heroku Metrics<br/>• MongoDB Monitoring<br/>• GitHub Insights<br/>• Application Logs<br/>• Health Checks]
    end
    
    %% Technology Dependencies
    FE_TECH -->|API Calls| BE_TECH
    BE_TECH -->|Service Calls| AI_TECH
    BE_TECH -->|Data Operations| DB_TECH
    DEVOPS_TECH -->|Deploys| FE_TECH
    DEVOPS_TECH -->|Deploys| BE_TECH
    DEVOPS_TECH -->|Deploys| AI_TECH
    MON_TECH -->|Monitors| FE_TECH
    MON_TECH -->|Monitors| BE_TECH
    MON_TECH -->|Monitors| AI_TECH
    MON_TECH -->|Monitors| DB_TECH
    
    %% Styling
    classDef frontendClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef backendClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef aiClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dataClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef devopsClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef monitorClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class FE_TECH frontendClass
    class BE_TECH backendClass
    class AI_TECH aiClass
    class DB_TECH dataClass
    class DEVOPS_TECH devopsClass
    class MON_TECH monitorClass
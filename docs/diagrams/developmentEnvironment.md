# Development Environment

```mermaid
graph TB
    subgraph "Development Machine"
        subgraph "Frontend Service"
            DEV_FE[🌐 Next.js Frontend<br/>localhost:3001<br/>Hot Reload]
        end
        
        subgraph "Backend Service"
            DEV_BE[⚙️ Backend API<br/>localhost:3000<br/>Express Server]
        end
        
        subgraph "AI Service"
            DEV_AI[🤖 AI Service<br/>localhost:3002<br/>Groq Integration]
        end
    end
    
    subgraph "External Services"
        DEV_DB[(🗄️ MongoDB Atlas<br/>Development Cluster<br/>mongodb+srv://...)]
        GROQ_DEV[🧠 Groq API<br/>Development Keys]
    end
    
    %% Development Flow
    DEV_FE -->|API Calls :3000| DEV_BE
    DEV_BE -->|Service Calls :3002| DEV_AI
    DEV_BE -->|Database Queries| DEV_DB
    DEV_AI -->|LLM Requests| GROQ_DEV
    
    %% Styling
    classDef devClass fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef externalClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class DEV_FE,DEV_BE,DEV_AI devClass
    class DEV_DB,GROQ_DEV externalClass
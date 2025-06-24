# Production Deployment

```mermaid
graph TB
    subgraph "Internet Traffic"
        USERS[🌍 Global Users<br/>Primary: Philippines<br/>HTTPS Traffic]
    end
    
    subgraph "Heroku Platform"
        subgraph "Production Apps"
            P_FE[🌐 Frontend Production<br/>brainbytes-frontend-production.herokuapp.com<br/>Port 80/443]
            P_BE[⚙️ Backend Production<br/>brainbytes-backend-production.herokuapp.com<br/>Port 80/443]
            P_AI[🤖 AI Service Production<br/>brainbytes-ai-production.herokuapp.com<br/>Port 80/443]
        end
        
        subgraph "Staging Apps"
            S_FE[🌐 Frontend Staging<br/>brainbytes-frontend-staging.herokuapp.com<br/>Port 80/443]
            S_BE[⚙️ Backend Staging<br/>brainbytes-backend-staging.herokuapp.com<br/>Port 80/443]
            S_AI[🤖 AI Service Staging<br/>brainbytes-ai-service-staging.herokuapp.com<br/>Port 80/443]
        end
    end
    
    subgraph "Database Layer"
        P_DB[(🗄️ MongoDB Atlas<br/>Production Cluster<br/>Singapore Region<br/>Port 27017)]
        S_DB[(🗄️ MongoDB Atlas<br/>Staging Cluster<br/>Singapore Region<br/>Port 27017)]
    end
    
    subgraph "External APIs"
        GROQ[🧠 Groq API<br/>AI Processing<br/>HTTPS Endpoints]
    end
    
    %% Production Flow
    USERS -->|HTTPS| P_FE
    P_FE -->|Internal API Calls| P_BE
    P_BE -->|Microservice Calls| P_AI
    P_BE -->|Database Queries| P_DB
    P_AI -->|LLM API Calls| GROQ
    
    %% Staging Flow
    USERS -->|HTTPS Testing| S_FE
    S_FE -->|Internal API Calls| S_BE
    S_BE -->|Microservice Calls| S_AI
    S_BE -->|Database Queries| S_DB
    S_AI -->|LLM API Calls| GROQ
    
    %% Styling
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef prodClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef stagingClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dbClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef externalClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class USERS userClass
    class P_FE,P_BE,P_AI,P_DB prodClass
    class S_FE,S_BE,S_AI,S_DB stagingClass
    class GROQ externalClass
# Network Topology

```mermaid
graph TB
    subgraph "Internet"
        USERS[🌍 Global Users<br/>Primary: Philippines<br/>HTTPS Traffic]
    end
    
    subgraph "Heroku Cloud Platform"
        subgraph "Edge Network"
            EDGE[🌐 Heroku Edge Network<br/>Global CDN<br/>SSL Termination<br/>DDoS Protection]
        end
        
        subgraph "Routing Layer"
            ROUTER[🔀 Heroku Router<br/>Load Balancing<br/>Request Routing<br/>SSL/TLS Handling]
        end
        
        subgraph "Application Dynos - Production"
            direction LR
            P_DYNO_FE[📱 Frontend Dyno<br/>web process<br/>512MB RAM<br/>1x CPU]
            P_DYNO_BE[⚙️ Backend Dyno<br/>web process<br/>512MB RAM<br/>1x CPU]
            P_DYNO_AI[🤖 AI Service Dyno<br/>web process<br/>512MB RAM<br/>1x CPU]
        end
        
        subgraph "Application Dynos - Staging"
            direction LR
            S_DYNO_FE[📱 Frontend Dyno<br/>web process<br/>512MB RAM<br/>1x CPU]
            S_DYNO_BE[⚙️ Backend Dyno<br/>web process<br/>512MB RAM<br/>1x CPU]
            S_DYNO_AI[🤖 AI Service Dyno<br/>web process<br/>512MB RAM<br/>1x CPU]
        end
    end
    
    subgraph "MongoDB Atlas - Asia Pacific"
        subgraph "Production Cluster"
            P_PRIMARY[(🗄️ Primary Node<br/>M0 Sandbox<br/>Singapore Region)]
            P_REPLICA[(🔄 Replica Set<br/>Automatic Failover<br/>Data Replication)]
        end
        
        subgraph "Staging Cluster"
            S_PRIMARY[(🗄️ Primary Node<br/>M0 Sandbox<br/>Singapore Region)]
            S_REPLICA[(🔄 Replica Set<br/>Automatic Failover<br/>Data Replication)]
        end
    end
    
    subgraph "External APIs"
        GROQ[🧠 Groq API<br/>AI/ML Processing<br/>HTTPS Endpoints<br/>Rate Limited]
    end
    
    %% User to Heroku Flow
    USERS -->|HTTPS Requests<br/>DNS Resolution| EDGE
    EDGE -->|Traffic Distribution<br/>Geographic Routing| ROUTER
    
    %% Production Routing
    ROUTER -->|brainbytes-frontend-production.herokuapp.com<br/>HTTPS| P_DYNO_FE
    ROUTER -->|brainbytes-backend-production.herokuapp.com<br/>HTTPS| P_DYNO_BE
    ROUTER -->|brainbytes-ai-production.herokuapp.com<br/>HTTPS| P_DYNO_AI
    
    %% Staging Routing
    ROUTER -->|brainbytes-frontend-staging.herokuapp.com<br/>HTTPS| S_DYNO_FE
    ROUTER -->|brainbytes-backend-staging.herokuapp.com<br/>HTTPS| S_DYNO_BE
    ROUTER -->|brainbytes-ai-service-staging.herokuapp.com<br/>HTTPS| S_DYNO_AI
    
    %% Production Internal Communication
    P_DYNO_FE -->|REST API Calls<br/>Internal Heroku Network| P_DYNO_BE
    P_DYNO_BE -->|Microservice Calls<br/>Internal Network| P_DYNO_AI
    
    %% Staging Internal Communication
    S_DYNO_FE -->|REST API Calls<br/>Internal Heroku Network| S_DYNO_BE
    S_DYNO_BE -->|Microservice Calls<br/>Internal Network| S_DYNO_AI
    
    %% Database Connections
    P_DYNO_BE -->|MongoDB Connection<br/>TLS Encrypted<br/>Connection Pooling| P_PRIMARY
    P_PRIMARY -.->|Replication<br/>Automatic Sync| P_REPLICA
    
    S_DYNO_BE -->|MongoDB Connection<br/>TLS Encrypted<br/>Connection Pooling| S_PRIMARY
    S_PRIMARY -.->|Replication<br/>Automatic Sync| S_REPLICA
    
    %% External API Calls
    P_DYNO_AI -->|HTTPS API Calls<br/>Authentication Headers<br/>Rate Limiting| GROQ
    S_DYNO_AI -->|HTTPS API Calls<br/>Authentication Headers<br/>Rate Limiting| GROQ
    
    %% Response Flow
    EDGE -->|Response Caching<br/>Compression<br/>Security Headers| USERS
    
    %% Styling
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef infraClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef prodClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef stagingClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dbClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef externalClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class USERS userClass
    class EDGE,ROUTER infraClass
    class P_DYNO_FE,P_DYNO_BE,P_DYNO_AI,P_PRIMARY,P_REPLICA prodClass
    class S_DYNO_FE,S_DYNO_BE,S_DYNO_AI,S_PRIMARY,S_REPLICA stagingClass
    class GROQ externalClass
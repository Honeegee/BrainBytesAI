# Data Flow Sequence

```mermaid
sequenceDiagram
    participant U as 👤 User<br/>(Philippines)
    participant CDN as 🌐 Heroku Edge
    participant FE as 📱 Frontend<br/>(Next.js)
    participant BE as ⚙️ Backend API<br/>(Express)
    participant AI as 🤖 AI Service<br/>(Node.js)
    participant DB as 🗄️ MongoDB<br/>(Atlas)
    participant GROQ as 🧠 Groq API
    
    Note over U,GROQ: User Chat Interaction Flow
    
    U->>+CDN: HTTPS Request<br/>brainbytes-frontend-production.herokuapp.com
    CDN->>+FE: Route to Frontend Dyno
    FE->>-CDN: Serve React App<br/>(Static Assets)
    CDN->>-U: Frontend Application<br/>(Cached at Edge)
    
    Note over U,GROQ: Authentication Flow
    
    U->>+FE: Login Request<br/>(username/password)
    FE->>+BE: POST /api/auth/login<br/>(credentials)
    BE->>+DB: Query User Collection<br/>(authentication)
    DB->>-BE: User Data<br/>(if valid)
    BE->>-FE: JWT Token<br/>(session cookie)
    FE->>-U: Authentication Success<br/>(redirect to dashboard)
    
    Note over U,GROQ: Chat Processing Flow
    
    U->>+FE: Send Chat Message<br/>("Help me with calculus")
    FE->>+BE: POST /api/messages<br/>(message + JWT)
    BE->>BE: Validate JWT Token<br/>(middleware)
    BE->>+AI: POST /api/chat<br/>(user message + context)
    AI->>+GROQ: LLM API Request<br/>(structured prompt)
    GROQ->>-AI: AI Response<br/>(generated content)
    AI->>-BE: Processed Response<br/>(formatted chat)
    BE->>+DB: Store Chat History<br/>(user_id + messages)
    DB->>-BE: Confirmation<br/>(document saved)
    BE->>-FE: Chat Response<br/>(AI message)
    FE->>-U: Display AI Response<br/>(real-time UI update)
    
    Note over U,GROQ: File Upload Flow
    
    U->>+FE: Upload Learning Material<br/>(PDF/DOCX file)
    FE->>+BE: POST /api/learning-materials<br/>(multipart/form-data)
    BE->>BE: File Validation<br/>(size, type, security)
    BE->>+DB: Store File Metadata<br/>(file info + user_id)
    DB->>-BE: File Document Created
    BE->>-FE: Upload Success<br/>(file metadata)
    FE->>-U: Upload Confirmation<br/>(file listed)
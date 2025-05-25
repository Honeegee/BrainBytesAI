# BrainBytesAI - Complete Code Structure

## Project Overview
BrainBytesAI is a full-stack application with AI integration, featuring a Next.js frontend, Node.js backend, and dedicated AI service.

## Root Directory Structure

```
BrainBytesAI/
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
├── PROJECT_STRUCTURE.md
├── ai-service/
├── backend/
├── docs/
├── frontend/
└── scripts/
```

## AI Service (`ai-service/`)

```
ai-service/
├── .env.example
├── commonResponses.js
├── Dockerfile
├── package.json
└── server.js
```

**Purpose:** Handles AI-related functionality and responses
- `server.js` - Main AI service server
- `commonResponses.js` - Predefined AI response templates
- `Dockerfile` - Containerization for AI service
- `.env.example` - Environment variables template

## Backend (`backend/`)

```
backend/
├── .dockerignore
├── .env.example
├── Dockerfile
├── make-executable.js
├── make-script-executable.sh
├── package.json
├── package-lock.json
├── run-api-tests.sh
├── run-auth-tests.sh
├── run-basic-test.sh
├── server.js
├── middleware/
│   ├── fileUpload.js
│   └── security.js
├── models/
│   ├── auth.js
│   ├── learningMaterial.js
│   ├── message.js
│   └── userProfile.js
├── routes/
│   ├── auth.js
│   ├── learningMaterials.js
│   ├── messages.js
│   ├── userProfiles.js
│   └── users.js
└── tests/
    ├── _setup.js.bak
    ├── api-testing-readme.md
    ├── api.test.js
    ├── basic.test.js
    ├── db-persistence.test.js
    ├── package.json.update
    ├── README.md
    ├── setup.js
    ├── auth/
    │   ├── auth.test.js
    │   └── middleware.test.js
    └── helpers/
        └── db-handler.js
```

**Purpose:** Core API server and business logic
- `server.js` - Main backend server
- `middleware/` - Custom middleware (security, file upload)
- `models/` - Data models and database schemas
- `routes/` - API endpoint definitions
- `tests/` - Comprehensive test suites

## Frontend (`frontend/`)

```
frontend/
├── .env.local.example
├── Dockerfile
├── jest-puppeteer.config.js
├── jest.config.js
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── components/
│   ├── ChatFilter.js
│   ├── ChatHistory.js
│   ├── ChatMessageContent.js
│   ├── ErrorBoundary.js
│   ├── Layout.js
│   ├── LearningMaterials.js
│   ├── LearningMaterialUpload.js
│   ├── PasswordStrength.js
│   └── withAuth.js
├── lib/
│   └── api.js
├── pages/
│   ├── _app.js
│   ├── _document.js
│   ├── chat.js
│   ├── dashboard.js
│   ├── index.js
│   ├── learning.js
│   ├── login.js
│   ├── profile.js
│   └── signup.js
├── public/
│   ├── logo.png
│   └── wave.mp4
├── styles/
│   └── globals.css
└── tests/
    └── e2e/
        ├── chat.test.js
        └── setup.js
```

**Purpose:** Next.js React frontend application
- `pages/` - Next.js page components and routing
- `components/` - Reusable React components
- `lib/` - Utility functions and API helpers
- `public/` - Static assets
- `styles/` - CSS styling
- `tests/` - End-to-end testing

## Documentation (`docs/`)

```
docs/
├── API.md
├── architecture.png
├── checklist.md
├── DATABASE.md
├── README.md
├── SECURITY_AND_MONITORING.md
├── SETUP.md
└── task-distribution.md
```

**Purpose:** Project documentation and guides
- `API.md` - API endpoint documentation
- `DATABASE.md` - Database schema and setup
- `SETUP.md` - Installation and setup instructions
- `SECURITY_AND_MONITORING.md` - Security guidelines

## Scripts (`scripts/`)

```
scripts/
├── monitor-resources.ps1
└── security-scan.ps1
```

**Purpose:** Utility scripts for monitoring and security
- PowerShell scripts for Windows environment

## Key Technologies

### Frontend Stack
- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Jest + Puppeteer** - Testing framework

### Backend Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Authentication** - Custom auth system
- **File Upload** - Middleware for handling uploads

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control

### Testing
- **Backend Tests** - API, authentication, database persistence
- **Frontend Tests** - End-to-end testing with Puppeteer
- **Test Helpers** - Database handlers and setup utilities

## Development Workflow

1. **Setup**: Use docker-compose for full stack development
2. **Backend**: RESTful API with comprehensive testing
3. **Frontend**: Component-based React architecture
4. **AI Service**: Dedicated microservice for AI functionality
5. **Testing**: Automated testing across all layers
6. **Documentation**: Comprehensive docs for all aspects

## Configuration Files

- `docker-compose.yml` - Multi-service orchestration
- `package.json` - Root dependencies and scripts
- Environment templates (`.env.example`) in each service
- Service-specific configurations (Next.js, Tailwind, Jest)

This structure follows microservices architecture with clear separation of concerns, comprehensive testing, and Docker-based deployment strategy.

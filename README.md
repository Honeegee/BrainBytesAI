# BrainBytes AI Tutoring Platform

## Project Overview
BrainBytes is an AI-powered tutoring platform designed to provide accessible academic assistance to Filipino students. This project implements the platform using modern DevOps practices and containerization.

## Team Members
- Felicity Diana Sario - Team Lead - lr.fdsario@mmdc.mcl.edu.ph
- Honey Grace Denolan - Backend Developer - lr.hgdenolan@mmdc.mcl.edu.ph
- Rhico Abueme - Frontend Developer - lr.rabueme@mmdc.mcl.edu.ph
- Zyra Joy Dongon - DevOps Engineer - lr.zjdongon@mmdc.mcl.edu.ph

## Project Goals
- Implement a containerized application with proper networking
- Create an automated CI/CD pipeline using GitHub Actions
- Deploy the application to Oracle Cloud Free Tier
- Set up monitoring and observability tools

## Technology Stack
- Frontend: Next.js
- Backend: Node.js/Express.js
- Database: MongoDB
- Containerization: Docker
- CI/CD: GitHub Actions
- Cloud Provider: Oracle Cloud Free Tier
- Monitoring: Prometheus & Grafana
- AI Integration: OpenRouter API (Mistral-7B model)

## Development Environment Setup Verification

| Team Member | Docker Installed | Git Installed | VS Code Installed | Can Run Hello World Container |
|-------------|-----------------|---------------|-------------------|------------------------------|
| Felicity Diana Sario | ✓ | ✓ | ✓ | ✓ |
| Honey Grace Denolan | ✓ | ✓ | ✓ | ✓ |
| Rhico Abueme | ✓ | ✓ | ✓ | ✓ |
| Zyra Joy Dongon | ✓ | ✓ | ✓ | ✓ |

## Project Architecture

![BrainBytes Architecture](architecture.png)

## Task Distribution Plan

### Week 1: Container Basics
- Set up project repository and basic documentation
- Research and document containerization approach
- Complete Docker installation and verification

### Week 2: Platform Development
- Implement frontend container (Next.js)
- Implement backend container (Node.js)
- Configure MongoDB and container networking

### Week 3: Platform Development (continued)
- Implement chat interface frontend
- Implement backend API endpoints
- Set up container networking and environment configurations

### Week 4: Integration and Testing
- Integrate OpenRouter AI API
- Implement message history and UI improvements
- Set up monitoring tools
- Create project documentation
- Final testing and preparation for submission

## Current Progress
- [x] Basic project structure set up
- [x] Docker containers configured
- [x] Frontend development completed
- [x] Backend API implementation
- [x] MongoDB integration
- [x] AI integration with OpenRouter
- [x] Chat interface implementation
- [x] User authentication and security
- [x] Error handling and monitoring
- [ ] CI/CD pipeline
- [ ] Cloud deployment

## Running the Application

### Prerequisites
- Docker and Docker Compose installed
- Node.js 14+ (for local development)

### Environment Setup

#### Environment Variables
Create the following `.env` files:

```bash
# backend/.env
PORT=3000
MONGODB_URI=mongodb://mongo:27017/brainbytes
FRONTEND_URL=http://localhost:3001
JWT_SECRET=brainbytes_jwt_secret_key_2024

# ai-service/.env
PORT=3002
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_REFERRER=https://brainbytes.ai

# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
API_URL=http://backend:3000
```

#### Database Setup
When running the application through Docker, each developer will have their own local MongoDB instance:
- The database runs in a Docker container named `mongo`
- Data is stored locally on your machine in a Docker volume
- Your data will NOT be shared with other developers
- Each developer needs to set up their own initial data
- To share database content between developers, you'll need to:
  1. Export your data using `docker exec mongo mongodump`
  2. Share the dump files with other developers
  3. They can import using `docker exec mongo mongorestore`

### Starting the Application
1. Clone the repository
2. Run the application (make sure Docker is Running):
```bash
docker-compose down && docker-compose up -d --build
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- AI Service: http://localhost:3002

## Security Features

The platform implements several security measures:

### Authentication & Authorization
- JWT-based authentication
- Password strength validation
- Remember me functionality
- Protected routes with middleware
- Session management

### Data Security
- Password hashing
- Environment variable protection
- CORS configuration
- Rate limiting
- Input validation and sanitization

### Error Handling
- Global error handling middleware
- Structured error responses
- Client-side error boundary
- Graceful degradation
- Error logging and monitoring

## API Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

#### POST /auth/login
Login existing user
```json
{
  "email": "test@example.com",
  "password": "Test12345,",
  "rememberMe": false
}
```

#### POST /auth/logout
Logout current user

### Learning Materials Endpoints

#### GET /learning-materials
Get all learning materials with pagination and filters
- Query Parameters:
  - `subject`: Filter by subject
  - `topic`: Filter by topic
  - `resourceType`: Filter by resource type
  - `difficulty`: Filter by difficulty level
  - `tags`: Filter by tags (comma-separated)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 50)
  - `fields`: Select specific fields (comma-separated)
  - `search`: Search in content

#### POST /learning-materials
Create new learning material
```json
{
  "subject": "Mathematics",
  "topic": "Algebra",
  "content": "Content text",
  "resourceType": "explanation",
  "difficulty": "intermediate",
  "tags": ["algebra", "equations"]
}
```

#### GET /learning-materials/subjects
Get list of distinct subjects

#### GET /learning-materials/subjects/:subject
Get materials by subject with pagination

#### GET /learning-materials/:id
Get specific learning material by ID

#### PUT /learning-materials/:id
Update learning material

#### DELETE /learning-materials/:id
Delete learning material

### Chat Endpoints

#### POST /messages
Create a new chat message
```json
{
  "content": "How do I solve quadratic equations?",
  "sessionId": "unique-session-id"
}
```

#### GET /messages/:sessionId
Get chat history for a session

## Database Schema

### Learning Material Schema
```javascript
{
  subject: String,          // Required, indexed
  topic: String,           // Required
  content: String,         // Required
  resourceType: String,    // Required, enum: ['definition', 'explanation', 'example', 'practice']
  difficulty: String,      // enum: ['beginner', 'intermediate', 'advanced']
  tags: [String],         // Optional array of tags
  createdAt: Date,        // Auto-generated, indexed
  updatedAt: Date         // Auto-updated on changes
}
```

Database Indexes:
- Compound index on `{ subject: 1, topic: 1 }`
- Index on `tags`
- Index on `{ resourceType: 1, difficulty: 1 }`
- Index on `createdAt`

### User Profile Schema
```javascript
{
  email: String,          // Required, unique
  name: String,           // Required
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-updated on changes
}
```

### Auth Schema
```javascript
{
  email: String,          // Required, unique
  password: String,       // Required, hashed
  userProfile: ObjectId,  // Reference to UserProfile
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  sessionId: String,      // Required, indexed
  content: String,        // Required
  role: String,          // enum: ['user', 'assistant']
  createdAt: Date,       // Auto-generated, indexed
  metadata: Object       // Optional context data
}
```

## AI Integration Details

The platform integrates with OpenRouter API using the Mistral-7B model for intelligent tutoring:

### Features
- Natural language understanding
- Contextual conversation memory
- Reference resolution (understanding pronouns and context)
- Concise, focused responses
- Real-time chat interface
- Message history persistence
- Contextual learning suggestions

### Technical Implementation
- Dedicated AI service container running on port 3002
- RESTful API endpoint at `/api/chat`
- Secure API key management
- CORS protection with allowed origins
- Conversation history management
- Health check endpoint at `/health`
- Automatic error recovery
- Request rate limiting
- Response caching

The AI service maintains conversation context to provide more natural and coherent tutoring interactions with students.

## Error Handling & Monitoring

### Error Types & Handling
- Network errors with automatic retry
- API validation errors with detailed feedback
- Database connection issues with failover
- Rate limit exceeded notifications
- Authentication/Authorization failures
- Input validation errors

### Monitoring & Logging
- Request/Response logging
- Error tracking and aggregation
- Performance metrics collection
- Resource usage monitoring
- User session analytics
- API endpoint health checks
- Database query performance
- Container health monitoring
- Real-time alerting system

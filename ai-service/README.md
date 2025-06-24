# AI Service

This service handles AI-related functionality for the BrainBytes AI application.

## Environment Setup

### Local Development

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual API keys:
   - Replace `your_groq_api_key_here` with your actual Groq API key
   - Adjust other settings as needed

### Environment Files

- `.env.example` - Template with placeholder values (committed to repo)
- `.env` - Local development environment (gitignored)

### Docker Deployment

The service is containerized using Docker. Environment variables are loaded from:

- Development: `ai-service/.env` (local file)
- Staging: GitHub secrets passed as environment variables (via `docker-compose.staging.yml`)
- Production: GitHub secrets passed as environment variables

## Configuration

| Variable            | Description                       | Default       |
| ------------------- | --------------------------------- | ------------- |
| `PORT`              | Service port                      | `3002`        |
| `GROQ_API_KEY`      | Groq API key for AI functionality | Required      |
| `NODE_ENV`          | Environment mode                  | `development` |
| `RATE_LIMIT_WINDOW` | Rate limiting window (minutes)    | `15`          |
| `RATE_LIMIT_MAX`    | Max requests per window           | `50`          |

## Running the Service

### Local Development

```bash
npm install
npm start
```

### Docker

```bash
# Development
docker-compose up ai-service

# Staging
docker-compose -f docker-compose.staging.yml up ai-service
```

The service will be available at `http://localhost:3002`.

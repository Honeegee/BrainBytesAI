# Task Distribution Plan

This document outlines the primary responsibilities for each team member. Collaboration is encouraged, and tasks may be shared or re-assigned as needed under the guidance of the Team Lead.

## Team Members & Primary Roles:
- **Felicity Diana Sario**: Team Lead (Project Management, Coordination, Code Review, Documentation Oversight)
- **Honey Grace Denolan**: Backend Developer (API, Database, AI Service Backend)
- **Rhico Abueme**: Frontend Developer (UI/UX, Frontend API Integration)
- **Zyra Joy Dongon**: DevOps Engineer (Docker, CI/CD, Deployment, Monitoring)
- **Adam Raymond Belda**: Team Member (Testing, Documentation Support, Feature Support)

## Development Environment Setup Verification

| Team Member | Docker Installed | Git Installed | VS Code Installed | Can Run Hello World Container |
|-------------|-----------------|---------------|-------------------|------------------------------|
| Felicity Diana Sario |Has issues with myCamu|
| Honey Grace Denolan | ✓ | ✓ | ✓ | ✓ |
| Rhico Abueme | ✓ | ✓ | ✓ | ✓ |
| Zyra Joy Dongon | ✓ | ✓ | ✓ | ✓ |
| Adam Raymond Belda | ✓ | ✓ | ✓ | ✓ |

## Task Breakdown by Phase

| Phase                                   | Task                                                 | Lead / Primary          | Support / Notes                                                                                                |
| :-------------------------------------- | :--------------------------------------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------- |
| **1. Project Setup & Foundational Work** | Project Repository & Initial Docs Setup             | Felicity, Zyra          | Create GitHub repo, initial docs (README, etc.), basic project structure.                                      |
|                                         | Containerization Strategy & Docker Setup             | Zyra (Lead)             | Honey, Rhico. Research, Dockerfiles, `docker-compose.yml`. Update `Setup.md`.                                  |
|                                         | Development Environment Verification                 | All Team Members        | Verify Docker, Git, VS Code. Update `Setup.md` table.                                                          |
| **2. Core Service Development**         | Backend API Development (Core Features)              | Honey (Lead)            | Adam (Support). Auth, profiles, learning materials, initial chat. DB models.                                   |
|                                         | Frontend Development (Core UI & Pages)               | Rhico (Lead)            | Adam (Support). Main UI, core pages, basic API integration.                                                    |
|                                         | AI Service Setup (Initial)                           | Honey (Integration Lead) | Zyra (Container Setup). Basic AI service, initial Groq API comms.                                                |
|                                         | Database Configuration & Seeding (Initial)           | Honey                   | Configure MongoDB in Docker. Initial data seeds if needed.                                                       |
| **3. Feature Enhancement & Integration** | Chat Interface Implementation (Frontend)             | Rhico                   | Real-time chat UI, message display, input, AI response handling.                                                 |
|                                         | Advanced Backend Features & AI Integration           | Honey                   | Refine chat API, message history, smooth AI integration.                                                         |
|                                         | User Profile Enhancements (F/E & B/E)                | Rhico (F/E), Honey (B/E) | Avatar uploads, preferred subjects, activity tracking.                                                           |
|                                         | Learning Materials Management (F/E & B/E)            | Rhico (F/E), Honey (B/E) | CRUD for learning materials, file uploads, search/filter.                                                        |
|                                         | Security Hardening                                   | Honey (B/E), Rhico (F/E) | Zyra (Infra). JWT, hashing, validation, CORS, rate limiting, security headers.                                   |
| **4. DevOps, Testing & Documentation**  | CI/CD Pipeline Implementation                        | Zyra                    | GitHub Actions for automated build, test, deploy.                                                              |
|                                         | Cloud Deployment (Oracle Cloud)                      | Zyra                    | Prepare and execute deployment.                                                                                |
|                                         | Monitoring & Observability Setup                     | Zyra                    | Integrate Prometheus & Grafana (or chosen tools).                                                              |
|                                         | Comprehensive Testing                                | Adam (Testing Lead)     | All Team Members. Unit, integration, E2E tests. UAT.                                                           |
|                                         | Project Documentation Completion                     | Felicity (Lead)         | All Team Members. Finalize `README.md`, `Setup.md`, API docs, architecture, user guides.                        |
|                                         | Final Review & Submission Preparation                | Felicity                | All Team Members. Code freeze, final checks, ensure deliverables.                                                |

## Ongoing Tasks (Throughout all phases)
-   **Version Control (Git & GitHub):** All team members. Regular commits, meaningful messages, branch management.
-   **Code Reviews:** Felicity, Honey, Rhico, Zyra (reviewing each other's relevant work).
-   **Regular Team Meetings & Communication:** All team members, led by Felicity.
-   **Troubleshooting & Bug Fixing:** All team members.

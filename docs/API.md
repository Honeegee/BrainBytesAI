# BrainBytes API Documentation

## Base URL
All API endpoints are prefixed with `/api`

## Authentication Endpoints

### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "rememberMe": false
  }
  ```
- **Success Response**: 
  - **Code**: 201 Created
  - **Content**: User profile details

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "rememberMe": false
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Authentication token, user profile

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Success Response**:
  - **Code**: 200 OK

## User Profile Endpoints

### Create User Profile
- **URL**: `/api/users`
- **Method**: `POST`
- **Request Body** (form-data):
  - `email` (String, required)
  - `name` (String, required)
  - `avatar` (File, optional)
  - `preferredSubjects[]` (String array, optional)
- **Success Response**:
  - **Code**: 201 Created
  - **Content**: Created user profile

### Get User Profiles
- **URL**: `/api/users`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of user profiles

### Get Specific User Profile
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Specific user profile

### Update User Profile
- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Request Body** (form-data):
  - `email` (String)
  - `name` (String)
  - `avatar` (File, optional)
  - `removeAvatar` (String, optional)
  - `preferredSubjects[]` (String array, optional)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Updated user profile

### Delete User Profile
- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **Success Response**:
  - **Code**: 204 No Content

### Get User Activity
- **URL**: `/api/users/:id/activity`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: User activity and progress details

## Learning Materials Endpoints

### Get Learning Materials
- **URL**: `/api/materials`
- **Method**: `GET`
- **Query Parameters**:
  - `subject` (String): Filter by subject
  - `topic` (String): Filter by topic
  - `resourceType` (String): Filter by resource type
  - `difficulty` (String): Filter by difficulty
  - `page` (Number): Page number
  - `limit` (Number): Items per page
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Paginated learning materials

### Create Learning Material
- **URL**: `/api/materials`
- **Method**: `POST`
- **Request Body** (form-data):
  - `subject` (String, required)
  - `topic` (String, required)
  - `resourceType` (String, required)
  - `difficulty` (String)
  - `tags` (JSON array of strings)
  - `content` (String)
  - `file` (File, optional)
- **Success Response**:
  - **Code**: 201 Created
  - **Content**: Created learning material

### Get Learning Material
- **URL**: `/api/materials/:id`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Specific learning material

### Update Learning Material
- **URL**: `/api/materials/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "topic": "Updated Topic",
    "content": "Updated content"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Updated learning material

### Delete Learning Material
- **URL**: `/api/materials/:id`
- **Method**: `DELETE`
- **Success Response**:
  - **Code**: 204 No Content

## Chat & Messages Endpoints

### Send Message
- **URL**: `/api/messages`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "text": "How do I solve quadratic equations?",
    "chatId": "unique-chat-id",
    "subject": "Mathematics"
  }
  ```
- **Success Response**:
  - **Code**: 201 Created
  - **Content**: Message and AI response

### Get Chat Messages
- **URL**: `/api/messages`
- **Method**: `GET`
- **Query Parameters**:
  - `chatId` (String, required)
  - `subject` (String, optional)
  - `page` (Number)
  - `limit` (Number)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Paginated chat messages

### Get Chat Sessions
- **URL**: `/api/messages/chats`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (Number)
  - `limit` (Number)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Chat sessions summary

### Update Chat Title
- **URL**: `/api/messages/chats/:chatId/title`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "title": "New Chat Title"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Updated chat session

### Delete Chat Session
- **URL**: `/api/messages/chats/:chatId`
- **Method**: `DELETE`
- **Success Response**:
  - **Code**: 204 No Content

## AI Service Endpoints

### Get AI Response
- **URL**: `/api/chat`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "prompt": "What is photosynthesis?",
    "conversationHistory": "Previous context...",
    "learningContext": {
      "subject": "Biology"
    }
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: AI-generated response

### AI Service Health Check
- **URL**: `/api/chat/health`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
    ```json
    {
      "status": "healthy"
    }
    ```

## Error Handling

All endpoints follow a consistent error response format:
```json
{
  "error": true,
  "message": "Detailed error description",
  "statusCode": 400
}
```

Common HTTP Status Codes:
- 200 OK: Successful request
- 201 Created: Resource successfully created
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Unexpected server error
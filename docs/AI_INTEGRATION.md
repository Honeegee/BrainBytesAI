# AI Integration Documentation

## Overview

BrainBytes integrates a sophisticated AI tutoring system powered by the Groq API using the deepseek-r1-distill-llama-70b model. The AI service is designed to provide intelligent, context-aware responses while maintaining a consistent educational tone suitable for students.

## Architecture

### Components

1. **AI Service (`ai-service/`)**
   - Express.js server handling AI interactions
   - Groq API integration
   - Common response management
   - Input normalization and processing

2. **Response Processing Pipeline**
   ```
   User Input → Normalization → Question Type Detection → Response Generation → Delivery
   ```

### Question Type Detection

The system automatically detects various types of questions:

- **Math Expressions**: Direct mathematical calculations
- **Definitions**: "What is" or "Who is" questions
- **Explanations**: "Explain" or "How does" queries
- **Examples**: Requests for examples or demonstrations
- **General**: Other types of questions

## Integration Components

### 1. Chat Management System

The platform includes a comprehensive chat management system:
- Multiple chat sessions support
- Chat history persistence
- Chat title management
- Subject-based filtering
- Real-time typing indicators
- Message timestamps
- User profile integration

### 2. Common Responses System

Pre-defined responses for frequently asked questions across subjects:
- Mathematics (calculations, concepts)
- Science (physics, chemistry, biology)
- History (events, figures)
- Programming (concepts, examples)
- General topics (greetings, learning tips)

Each response includes:
- Structured content
- Complexity level (basic/intermediate)
- Subject categorization
- Sentiment analysis

### 3. Input Processing

```javascript
User Query → Normalization → Math Expression Check → Common Response Check → AI Processing
```

- **Normalization**: Cleans and standardizes input
- **Math Expression Handling**: Processes basic mathematical operations
- **Common Response Check**: Checks against predefined responses
- **AI Processing**: Routes to Groq API if no common response found

### 4. Response Formatting

All responses follow a consistent structure:

```
🗣️ Context/Acknowledgment
📚 Main Explanation
🔍 Examples/Practical Applications
💬 Follow-up Prompts
```

## Configuration & Best Practices

### Server Configuration

1. **CORS Configuration**
   Allowed Origins:
   - http://localhost:3001 (Frontend)
   - http://localhost:3000 (Backend)

2. **Environment Variables**
   Required in `.env`:
   ```
   PORT=3002
   GROQ_API_KEY=your_api_key_here
   ```

### Development Best Practices

1. **Error Handling**
   - All API calls include proper error handling
   - Meaningful error messages are returned to the client
   - Timeouts are set to 30 seconds for API calls

2. **Input Validation**
   - All inputs are sanitized and normalized
   - Mathematical expressions are safely evaluated
   - Invalid inputs are handled gracefully

3. **Response Quality**
   - Responses maintain educational tone
   - Complex concepts are broken down
   - Examples are provided where appropriate
   - Follow-up questions are encouraged

## Frontend Integration

### Chat Interface Features

1. **Message Management**
```javascript
// Send message
const messageData = {
  text: message.trim(),
  subject: selectedSubject,
  chatId: currentChatId,
  isFirstMessage: isNewChat
};
const response = await api.post('/api/messages', messageData);
```

2. **Chat Session Management**
```javascript
// Create new chat
const chatId = Date.now().toString();
setChatSessions(prev => [{
  id: chatId,
  title: 'New chat',
  createdAt: new Date().toISOString()
}, ...prev]);

// Delete chat
await api.delete(`/api/messages/chats/${chatId}`);

// Update chat title
await api.put(`/api/messages/chats/${chatId}/title`, {
  title: newTitle
});
```

3. **Real-time Features**
- Typing indicators
- Message timestamps
- Subject filtering
- Error handling
- Loading states

## Limitations & Considerations

1. **Rate Limiting**
   - API rate limits per user session
   - Implement appropriate caching strategies
   - Handle concurrent chat sessions efficiently

2. **Performance**
   - Average response time: 1-3 seconds
   - Timeout set to 30 seconds
   - Message pagination for long chat histories
   - Efficient chat session management

3. **Content Management**
   - Educational content focus
   - Subject-based filtering
   - Sentiment analysis for responses
   - Professional tone maintenance
   - Chat history persistence



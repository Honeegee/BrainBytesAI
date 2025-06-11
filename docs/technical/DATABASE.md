# BrainBytes Database Schema

## Overview
The BrainBytes platform uses MongoDB as its database, with a schema designed to support flexible and efficient data storage for an AI-powered tutoring platform.

## Database Collections

### 1. User Profiles (`userprofiles`)

#### Schema Structure
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  avatar: { type: String, default: '' },
  preferredSubjects: [{ 
    type: String, 
    trim: true,
    enum: ['Math', 'Science', 'History', 'Programming', 'General']
  }],
  learningProgress: {
    type: Map,
    of: Number // Tracks progress per subject (0-100)
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### Key Features
- Strict email validation
- Enforced subject categories
- Progress tracking per subject
- Automatic timestamps
- Data sanitization (trimming, lowercase)

#### Indexes
- `{ email: 1 }` (Unique)
- `{ preferredSubjects: 1 }`

### 2. Authentication (`auths`)

#### Schema Structure
```javascript
{
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase, one lowercase, one number and one special character'
    }
  },
  userProfile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserProfile', 
    required: true 
  },
  refreshToken: { type: String },
  lastLogin: { type: Date }
}
```

#### Key Features
- Strong password requirements
- Secure token management
- Reference to user profile
- Login activity tracking

### 3. Learning Materials (`learningmaterials`)

#### Schema Structure
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  subject: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  resourceType: { 
    type: String, 
    enum: ['definition', 'explanation', 'example', 'practice', 'video', 'article'], 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'intermediate' 
  },
  tags: [{ type: String, trim: true }],
  filePath: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}
```

#### Key Features
- User ownership tracking
- Categorized resource types
- Difficulty levels
- File upload support
- Searchable tags

#### Indexes
- `{ userId: 1 }`
- `{ subject: 1, topic: 1 }` (Compound)
- `{ tags: 1 }`
- `{ resourceType: 1, difficulty: 1 }` (Compound)
- `{ createdAt: 1 }`

### 4. Messages (`messages`)

#### Schema Structure
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  text: { type: String, required: true },
  subject: { type: String, default: '' },
  chatId: { type: String, required: true },
  isAiResponse: { type: Boolean, default: false },
  metadata: {
    responseTime: Number,
    complexity: String,
    sources: [String]
  },
  createdAt: { type: Date, default: Date.now }
}
```

#### Key Features
- Conversation tracking
- AI response flagging
- Performance metrics
- Source references
- Subject categorization

#### Indexes
- `{ userId: 1 }`
- `{ chatId: 1, createdAt: -1 }`
- `{ subject: 1, createdAt: -1 }`
- `{ "metadata.complexity": 1 }`

### 5. Dashboard Views (Virtual Schema)

#### Data Structure
```javascript
{
  userStats: {
    totalSessions: Number,
    activeSubjects: [String],
    completionRate: Number,
    recentActivity: [{
      date: Date,
      interactions: Number,
      subjects: [String]
    }]
  },
  learningProgress: {
    bySubject: Map<String, {
      completion: Number,
      lastAccessed: Date,
      resourceCount: Number
    }>
  },
  recommendations: [{
    subject: String,
    topic: String,
    resourceType: String,
    reason: String
  }]
}
```

#### Key Features
- Aggregated from multiple collections
- Real-time calculated metrics
- Personalized recommendations
- Progress visualization data
- Optimized for dashboard performance

#### Data Sources
- User profile data
- Message history
- Learning material interactions
- System activity logs

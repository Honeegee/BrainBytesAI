# MongoDB Atlas Migration Guide for BrainBytesAI

## Why Switch to MongoDB Atlas for Heroku Deployment?

✅ **Free M0 Sandbox Tier** - Perfect for homework/development  
✅ **Zero Database Administration** - No need to manage MongoDB yourself  
✅ **Global Distribution** - Can choose Singapore region (closest to Philippines)  
✅ **Automatic Backups** - Built-in backup and restore  
✅ **Heroku Integration** - Works seamlessly with Heroku apps  
✅ **Easy Migration** - Simple export/import from your local MongoDB  

## Step-by-Step Migration Process

### Step 1: Backup Your Current Local Data

```bash
# Start your local MongoDB (if not running)
docker-compose up -d mongo

# Wait for MongoDB to be ready
sleep 10

# Export your current database
docker exec -it $(docker ps -q -f name=mongo) mongodump --db brainbytes --out /backup

# Copy backup from container to your local machine
docker cp $(docker ps -q -f name=mongo):/backup ./mongodb-backup

# Verify backup was created
ls -la mongodb-backup/brainbytes/
```

### Step 2: Create MongoDB Atlas Account and Cluster

1. **Sign up for MongoDB Atlas**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Try Free"
   - Create account with your email

2. **Create a New Project**
   - Project Name: `BrainBytesAI`
   - Click "Next" → "Create Project"

3. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose **FREE** M0 Sandbox
   - **Cloud Provider**: AWS
   - **Region**: Asia Pacific (Singapore) - closest to Philippines
   - **Cluster Name**: `BrainBytesAI-Cluster`
   - Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Configure Database Access and Security

#### Configure Database User
```bash
# In Atlas Dashboard:
# 1. Go to "Database Access" in left sidebar
# 2. Click "Add New Database User"
# 3. Authentication Method: Password
# 4. Username: brainbytes_user
# 5. Password: [Click "Autogenerate Secure Password" and SAVE IT]
# 6. Database User Privileges: "Read and write to any database"
# 7. Click "Add User"
```

#### Configure Network Access
```bash
# In Atlas Dashboard:
# 1. Go to "Network Access" in left sidebar  
# 2. Click "Add IP Address"
# 3. Click "Allow Access from Anywhere" (0.0.0.0/0)
# 4. Comment: "Heroku dynos and development"
# 5. Click "Confirm"
```

### Step 4: Get Connection String

```bash
# In Atlas Dashboard:
# 1. Go to "Databases" 
# 2. Click "Connect" on your cluster
# 3. Choose "Connect your application"
# 4. Driver: Node.js, Version: 4.1 or later
# 5. Copy the connection string - it looks like:
# mongodb+srv://brainbytes_user:<password>@brainbytesai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Replace <password> with your actual password
# Add database name: /brainbytes before the ?
# Final format:
# mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes?retryWrites=true&w=majority
```

### Step 5: Import Your Data to Atlas

#### Option A: Using MongoDB Compass (Recommended - GUI)
```bash
# 1. Download MongoDB Compass: https://www.mongodb.com/products/compass
# 2. Install and open Compass
# 3. Connect to Atlas using your connection string
# 4. Create database "brainbytes"
# 5. Import collections from your backup folder:
#    - users collection from mongodb-backup/brainbytes/users.bson
#    - Any other collections you have
```

#### Option B: Using Command Line Tools
```bash
# Install MongoDB Database Tools
# Windows: Download from https://www.mongodb.com/try/download/database-tools
# macOS: brew install mongodb/brew/mongodb-database-tools
# Linux: wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.7.0.tgz

# Import your data to Atlas
mongorestore --uri "mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes" ./mongodb-backup/brainbytes/

# Verify import was successful
mongosh "mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes"
# In mongo shell:
show collections
db.users.countDocuments()  # Should show your user count
```

### Step 6: Update Your Local Development Environment

Create environment-specific database configuration:

```javascript
// backend/config/database.js
const mongoose = require('mongoose');

const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      // Keep local MongoDB for development
      uri: process.env.LOCAL_DATABASE_URL || 'mongodb://localhost:27017/brainbytes',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    
    staging: {
      // Use Atlas for staging
      uri: process.env.STAGING_DATABASE_URL,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        retryWrites: true,
        w: 'majority'
      }
    },
    
    production: {
      // Use Atlas for production
      uri: process.env.PROD_DATABASE_URL,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    
    test: {
      // Use in-memory MongoDB for testing
      uri: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/brainbytes_test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    }
  };
  
  return configs[env];
};

const connectDatabase = async () => {
  try {
    const config = getDatabaseConfig();
    await mongoose.connect(config.uri, config.options);
    console.log(`✅ MongoDB connected successfully (${process.env.NODE_ENV})`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase, getDatabaseConfig };
```

### Step 7: Update Your Application Code

Update your main server file to use the new database configuration:

```javascript
// backend/server.js (update the database connection part)
const express = require('express');
const { connectDatabase } = require('./config/database');

const app = express();

// Connect to database
connectDatabase();

// ... rest of your server code
```

### Step 8: Update Environment Variables

#### Local Development (.env file)
```bash
# backend/.env
NODE_ENV=development
LOCAL_DATABASE_URL=mongodb://localhost:27017/brainbytes
# Keep your other local environment variables
```

#### Create Atlas Environment Files
```bash
# Create staging environment variables
# .env.staging
NODE_ENV=staging
STAGING_DATABASE_URL=mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes_staging?retryWrites=true&w=majority

# Create production environment variables  
# .env.production
NODE_ENV=production
PROD_DATABASE_URL=mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes_production?retryWrites=true&w=majority
```

### Step 9: Test Local Connection to Atlas

```bash
# Test connection from your local environment
cd backend

# Install dependencies if needed
npm install

# Test staging connection
NODE_ENV=staging STAGING_DATABASE_URL="your_atlas_connection_string" node -e "
const { connectDatabase } = require('./config/database');
connectDatabase().then(() => {
  console.log('✅ Atlas connection successful!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Atlas connection failed:', err);
  process.exit(1);
});
"
```

### Step 10: Update Docker Compose for Hybrid Development

Update your docker-compose.yml to support both local and Atlas MongoDB:

```yaml
# docker-compose.yml (updated)
services:
  # Keep MongoDB for local development (optional)
  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=brainbytes
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network
    restart: unless-stopped
    # Add condition to only run in development
    profiles:
      - local-dev

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      # Use Atlas URL if provided, otherwise local MongoDB
      - DATABASE_URL=${ATLAS_DATABASE_URL:-mongodb://mongo:27017/brainbytes}
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    networks:
      - app-network
    # Only depend on mongo for local development
    depends_on:
      - mongo
    restart: unless-stopped

# ... rest of your services

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

### Step 11: Configure Heroku with Atlas

```bash
# Set up staging environment
heroku config:set STAGING_DATABASE_URL="mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes_staging?retryWrites=true&w=majority" -a brainbytes-backend-staging

# Set up production environment  
heroku config:set PROD_DATABASE_URL="mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes_production?retryWrites=true&w=majority" -a brainbytes-backend

# Verify configuration
heroku config -a brainbytes-backend-staging
heroku config -a brainbytes-backend
```

## Development Workflow Options

### Option 1: Atlas for Everything (Recommended for Homework)
- **Development**: Use Atlas staging database
- **Staging**: Use Atlas staging database  
- **Production**: Use Atlas production database
- **Benefits**: Consistent environment, easy collaboration, matches production

### Option 2: Hybrid Approach (Good for Team Development)
- **Development**: Use local MongoDB (Docker)
- **Staging**: Use Atlas staging database
- **Production**: Use Atlas production database  
- **Benefits**: Fast local development, production-like staging

### Option 3: Local with Atlas Testing
- **Development**: Use local MongoDB
- **Testing**: Test against Atlas staging occasionally
- **Staging**: Use Atlas staging database
- **Production**: Use Atlas production database

## Verification Steps

### 1. Test Local Development
```bash
# Start local development (Option 2)
docker-compose --profile local-dev up -d mongo
npm run dev

# Or test with Atlas (Option 1)
NODE_ENV=staging npm run dev
```

### 2. Test Heroku Deployment
```bash
# Deploy to staging
git push origin development

# Check logs
heroku logs --tail -a brainbytes-backend-staging

# Test database connection
heroku run node -e "
const { connectDatabase } = require('./config/database');
connectDatabase().then(() => console.log('✅ DB Connected'));
" -a brainbytes-backend-staging
```

### 3. Verify Data Migration
```bash
# Connect to Atlas and verify your data
mongosh "mongodb+srv://brainbytes_user:your_password@brainbytesai-cluster.xxxxx.mongodb.net/brainbytes_staging"

# Check collections
show collections
db.users.find().limit(5)  # Should show your migrated users
```

## Benefits of This Approach

✅ **Easier Deployment**: No database management on Heroku  
✅ **Cost Effective**: Free M0 tier for homework/development  
✅ **Scalable**: Can upgrade Atlas as needed  
✅ **Reliable**: MongoDB Atlas has 99.95% uptime SLA  
✅ **Backup**: Automatic backups and point-in-time recovery  
✅ **Global**: Can access from anywhere  
✅ **Security**: Built-in security features and compliance  

## Troubleshooting

### Connection Issues
```bash
# Check connection string format
# Correct: mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
# Wrong: mongodb://user:pass@cluster.mongodb.net/dbname

# Test connection manually
mongosh "your_connection_string"
```

### Authentication Issues
```bash
# Verify username and password in Atlas Dashboard
# Database Access → Database Users
# Make sure user has "Read and write to any database" privileges
```

### Network Issues
```bash
# Verify IP whitelist in Atlas Dashboard  
# Network Access → IP Access List
# Should have 0.0.0.0/0 for Heroku dynos
```

This migration will make your Heroku deployment much simpler while keeping your local development flexible!
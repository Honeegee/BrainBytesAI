# 🚀 Setup Guide for Collaborators
## How to Run the BrainBytes Prometheus Monitoring System

### 📋 **Prerequisites**

Before your collaborators can access the monitoring URLs, they need:

1. **Docker Desktop** installed and running
2. **Git** to clone the repository
3. **Node.js** (for running simulations)

---

## 🏃‍♂️ **Quick Start for Collaborators**

### **Step 1: Clone and Navigate**
```bash
git clone [your-repository-url]
cd BrainBytesAI
git checkout week9
```

### **Step 2: Start the Monitoring System**
```bash
# Start all services (this will take 2-3 minutes first time)
docker-compose up -d

# Verify all containers are running
docker-compose ps
```

**Expected output**: All containers should show "Up" status:
```
NAME                        STATUS
prometheus                  Up
alertmanager               Up  
brainbytesai-backend-1     Up
brainbytesai-ai-service-1  Up
brainbytesai-frontend-1    Up
cadvisor                   Up
node-exporter              Up
frontend                   Up
```

### **Step 3: Wait for System Initialization**
```bash
# Check if Prometheus is ready (wait for "success")
curl http://localhost:9090/api/v1/targets

# Generate some test data
cd monitoring
node simulate-activity.js
```

### **Step 4: Access Monitoring URLs**

**ONLY AFTER Step 2-3 are complete, these URLs will work:**

- 🎯 **Prometheus UI**: http://localhost:9090
- 📊 **Backend Metrics**: http://localhost/metrics  
- 🤖 **AI Service Metrics**: http://localhost:8090/metrics
- 🚨 **Alertmanager**: http://localhost:9093
- 📈 **cAdvisor**: http://localhost:8081

---

## ⚠️ **Important Notes for Collaborators**

### **URLs Won't Work Until System is Running**
- The monitoring URLs are **local applications**
- They only work when Docker containers are running
- Each person needs to run the system on their own machine

### **First-Time Setup Takes Time**
- Docker will download images (2-3 minutes)
- Services need time to start up (1-2 minutes)
- Prometheus needs to start collecting data

### **Troubleshooting Common Issues**

#### **Problem: "This site can't be reached"**
**Solution**: 
```bash
# Check if containers are running
docker-compose ps

# If not running, start them
docker-compose up -d
```

#### **Problem: No data in Prometheus**
**Solution**:
```bash
# Generate test data
cd monitoring
node simulate-activity.js

# Wait 30 seconds, then refresh Prometheus
```

#### **Problem: Containers won't start**
**Solution**:
```bash
# Stop everything and restart
docker-compose down
docker-compose up -d

# Check for port conflicts
netstat -an | findstr "9090"
```

---

## 📱 **For Quick Demo (Without Full Setup)**

If collaborators just want to see the **code and documentation**:

### **View Documentation Only**
- Browse `monitoring-docs/` folder in GitHub
- Read implementation details
- Review configuration files
- See metrics catalog and queries

### **View Live Screenshots**
- Add screenshots to `monitoring-docs/screenshots/`
- Show working Prometheus interface
- Demonstrate queries returning data

---

## 🎯 **What Each URL Shows**

### **http://localhost:9090 (Prometheus)**
- Main monitoring dashboard
- Execute PromQL queries
- View targets status
- See alert rules

### **http://localhost/metrics (Backend)**
- Raw metrics from your backend API
- Shows actual HTTP request data
- Business logic metrics

### **http://localhost:8090/metrics (AI Service)**
- AI-specific metrics
- Response times and token usage
- Educational subject popularity

### **http://localhost:9093 (Alertmanager)**
- Alert management interface
- Active alerts display
- Alert routing configuration

### **http://localhost:8081 (cAdvisor)**
- Container resource monitoring
- CPU, memory, disk usage
- Docker container health

---

## 🚀 **Complete Workflow for Collaborators**

```bash
# 1. Get the code
git clone [repository]
cd BrainBytesAI
git checkout week9

# 2. Start monitoring system
docker-compose up -d

# 3. Wait for startup (check status)
docker-compose ps

# 4. Generate test data
cd monitoring
node simulate-activity.js

# 5. Open monitoring interfaces
# - Prometheus: http://localhost:9090
# - Metrics: http://localhost/metrics
# - etc.

# 6. When done, cleanup
docker-compose down
```

---

## 💡 **Pro Tips for Collaborators**

1. **Leave system running** while reviewing documentation
2. **Run simulation** to see metrics change in real-time
3. **Try the example queries** from the query reference guide
4. **Check targets page** to verify all services are monitored
5. **Stop system** when done: `docker-compose down`

**This ensures collaborators can successfully run and explore your Prometheus monitoring implementation!** 🎉
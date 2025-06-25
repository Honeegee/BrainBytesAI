# 🧪 BrainBytes App Testing Guide

## 🚀 Quick Status Check

First, verify all services are running:
```bash
docker-compose ps
```

## 🔍 How to Test Your App

### 1. **Main Application** (Port 80)
```
http://localhost/
```
- ✅ **Frontend**: Main website interface
- ✅ **Backend API**: All `/api/*` endpoints
- ✅ **Health Check**: `http://localhost/health`

### 2. **AI Service** (Port 8090) - YOUR FIXED ENDPOINT!
```
http://localhost:8090/query
```
- ✅ **AI Chat**: `POST http://localhost:8090/query` with JSON body
- ✅ **Direct API**: `POST http://localhost:8090/api/chat`
- ✅ **Health Check**: `http://localhost:8090/health`
- ✅ **Service Info**: `http://localhost:8090/`

### 3. **Monitoring Dashboard** (Port 8080)
```
http://localhost:8080/
```
- ✅ **Prometheus**: `http://localhost:8080/prometheus/`
- ✅ **Alertmanager**: `http://localhost:8080/alertmanager/`
- ✅ **AI Metrics**: `http://localhost:8080/ai-metrics`

### 4. **Individual Services** (Direct Access)
- **Prometheus**: `http://localhost:9090`
- **Alertmanager**: `http://localhost:9093`
- **Node Exporter**: `http://localhost:9100`
- **cAdvisor**: `http://localhost:8081` (moved from 8080)

## 🧪 Testing Your AI Query Endpoint

### Test 1: Simple Health Check
```bash
curl http://localhost:8090/health
```
**Expected**: JSON response with AI service status

### Test 2: AI Query (Your Original Issue)
```bash
curl -X POST http://localhost:8090/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```
**Expected**: AI response in JSON format

### Test 3: Direct AI Chat
```bash
curl -X POST http://localhost:8090/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is 2+2?"}'
```
**Expected**: AI response with calculation

## 🌐 Full App Test Flow

### 1. Open the Main App
```
http://localhost/
```
You should see the BrainBytes frontend

### 2. Test Backend Health
```
http://localhost/health
```
Should return backend health status

### 3. Test AI Integration
```
http://localhost:8090/query
```
Use POST request with a prompt

## 🔧 Troubleshooting

### If a Service is Down:
```bash
# Check service status
docker-compose ps

# View logs for specific service
docker-compose logs ai-service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Restart specific service
docker-compose restart ai-service
```

### If Port is Busy:
```bash
# Check what's using the port
netstat -ano | findstr :8090

# Kill process if needed (use PID from netstat)
taskkill /PID [PID_NUMBER] /F
```

## 📊 Monitoring Your App

### Check All Metrics:
1. **App Metrics**: `http://localhost/metrics`
2. **AI Metrics**: `http://localhost:8090/metrics`
3. **System Metrics**: `http://localhost:9100/metrics`
4. **Container Metrics**: `http://localhost:8081/metrics`

### View in Prometheus:
1. Go to `http://localhost:9090`
2. Try queries like:
   - `brainbytes_ai_requests_total`
   - `brainbytes_http_requests_total`
   - `up` (shows which services are running)

## ✅ Success Indicators

Your app is working correctly if:
- ✅ `http://localhost/` shows the frontend
- ✅ `http://localhost/health` returns backend status
- ✅ `http://localhost:8090/health` returns AI service status
- ✅ `http://localhost:8090/query` accepts POST requests
- ✅ All Docker containers are "Up" in `docker-compose ps`

## 🎯 Your Original Issue: FIXED!

**Before**: `http://localhost:8090/query` → 404 Not Found

**Now**: `http://localhost:8090/query` → ✅ Working AI endpoint

The fix involved:
1. Adding port 8090 server configuration to nginx
2. Creating the `/query` endpoint route
3. Fixing Docker port mapping conflicts
4. Updating both development and staging nginx configs

Your `/query` endpoint now properly routes to the AI service!
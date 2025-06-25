# 📊 Grafana Setup and Dashboard Creation - Homework Guide

## 🎯 Overview

This guide will help you complete the Grafana homework assignment by setting up Grafana and creating advanced dashboards for your BrainBytes AI tutoring platform.

---

## ✅ Step 1: Grafana Setup (COMPLETED)

**✅ What's Already Done:**
- Grafana service added to all Docker Compose files
- Automatic Prometheus datasource configuration
- Pre-built dashboard provisioning
- Traffic simulation script created

**🚀 Start Grafana:**
```bash
# For development
docker-compose up -d grafana

# For staging  
docker-compose -f docker-compose.staging.yml up -d grafana

# For production
docker-compose -f docker-compose.production.yml up -d grafana
```

**🌐 Access Grafana:**
- **Development**: http://localhost:3000
- **Staging**: http://staging-server:3000
- **Production**: http://production-server:3001

**🔐 Login Credentials:**
- **Username**: admin
- **Password**: brainbytes

---

## ✅ Step 2: Pre-built Dashboards (READY)

**🎛️ Available Dashboards:**

1. **[BrainBytes - System Overview](../monitoring/grafana/provisioning/dashboards/system-overview.json)**
   - CPU Usage monitoring
   - AI Response Time tracking
   - Questions per Session analytics
   - Session Duration Distribution

2. **[BrainBytes - Application Performance](../monitoring/grafana/provisioning/dashboards/application-performance.json)**
   - Request Rate metrics
   - Average Response Time
   - Error Rate monitoring

3. **[BrainBytes - User Experience](../monitoring/grafana/provisioning/dashboards/user-experience.json)**
   - Active Sessions tracking
   - AI Response Time analysis
   - Questions per Session average
   - Mobile Platform Usage

**📍 Dashboard Locations:**
- Grafana UI: Home → Dashboards → BrainBytes folder
- Files: [`monitoring/grafana/provisioning/dashboards/`](../monitoring/grafana/provisioning/dashboards/)

---

## 🔥 Step 3: Generate Test Data

**🚀 Run Traffic Simulation:**
```bash
# Navigate to monitoring directory
cd monitoring

# Run simulation (5 minutes, 5 concurrent users)
node simulate-traffic.js

# Custom duration and concurrency
DURATION=600 CONCURRENCY=10 node simulate-traffic.js

# Target different environment
BASE_URL=http://staging-server:3000 node simulate-traffic.js
```

**📊 What the simulator generates:**
- HTTP requests to all API endpoints
- Simulated user sessions
- AI interaction patterns
- Mobile device requests
- Error scenarios for testing alerts

---

## 🎯 Step 4: Complete Required Tasks

### **Task 1: Create Advanced Dashboards**

**✅ Already Implemented:**
- [x] Error Analysis components in Application Performance dashboard
- [x] Resource tracking in System Overview
- [x] User experience metrics visualization

**🔄 Additional Dashboards to Create:**

1. **Error Analysis Dashboard** (Extend existing)
2. **Resource Optimization Dashboard** (New)
3. **Dashboard Templating** (Enhance existing)

### **Task 2: Set Up Comprehensive Alerting**

**📋 Create Alert Rules:**

1. **High CPU Usage Alert:**
   - Go to System Overview dashboard
   - Edit CPU Usage panel
   - Add Alert tab configuration
   - Threshold: >80% for 5 minutes

2. **High AI Response Time Alert:**
   - Threshold: >5 seconds average
   - Evaluation: Every 1m for 3m

3. **High Error Rate Alert:**
   - Threshold: >5% error rate
   - Evaluation: Every 30s for 2m

### **Task 3: Documentation Package**

**📚 Create These Documents:**

1. **Dashboard Catalog**
   ```markdown
   ## Dashboard Catalog
   
   ### System Overview
   - **Purpose**: Monitor infrastructure health
   - **Audience**: DevOps/SRE teams
   - **Key Metrics**: CPU, Memory, Response Times
   
   ### Application Performance  
   - **Purpose**: Track application-level metrics
   - **Audience**: Development teams
   - **Key Metrics**: Request rates, Error rates, Response times
   
   ### User Experience
   - **Purpose**: Monitor user-facing metrics
   - **Audience**: Product managers, UX teams
   - **Key Metrics**: Session data, AI performance, Mobile usage
   ```

2. **Metric Dictionary**
   ```markdown
   ## Metric Dictionary
   
   | Metric | Description | Normal Range | Alert Threshold |
   |--------|-------------|--------------|-----------------|
   | `brainbytes_active_sessions` | Current active user sessions | 0-100 | N/A |
   | `brainbytes_ai_response_time_seconds` | AI response latency | 0.5-3s | >5s |
   | `brainbytes_http_requests_total` | Total HTTP requests | Varies | N/A |
   | `brainbytes_http_request_duration_seconds` | HTTP response time | 0.1-1s | >2s |
   ```

3. **Alert Reference Guide**
   ```markdown
   ## Alert Reference
   
   ### High CPU Usage
   - **Threshold**: >80% for 5 minutes
   - **Severity**: Warning
   - **Response**: Check resource usage, scale if needed
   
   ### High AI Response Time
   - **Threshold**: >5 seconds average
   - **Severity**: Critical
   - **Response**: Check AI service health, restart if needed
   ```

### **Task 4: Monitoring Demo Script**

**🎬 Demo Plan:**

1. **Start with clean dashboards** (10-15 minute demo)
2. **Run traffic simulation** to show data flowing
3. **Navigate through dashboards** explaining key metrics
4. **Trigger alerts** by simulating high load
5. **Show alert resolution** when load decreases

**📝 Demo Script:**
```bash
# 1. Start monitoring stack
docker-compose up -d

# 2. Open Grafana
echo "Open http://localhost:3000 (admin/brainbytes)"

# 3. Start traffic simulation
cd monitoring
node simulate-traffic.js &

# 4. Navigate dashboards and explain metrics
# 5. Show real-time data updates
# 6. Demonstrate alert conditions

# 7. Stop simulation
kill %1
```

---

## 🔧 Advanced Features to Implement

### **1. Dashboard Templating**

Add template variables to existing dashboards:

```json
{
  "templating": {
    "list": [
      {
        "name": "service",
        "type": "query",
        "query": "label_values(brainbytes_http_requests_total, job)",
        "current": {
          "value": "All",
          "text": "All"
        }
      },
      {
        "name": "instance", 
        "type": "query",
        "query": "label_values(brainbytes_http_requests_total{job=\"$service\"}, instance)"
      }
    ]
  }
}
```

### **2. Advanced Visualizations**

- **Heatmaps**: For latency distribution
- **Stat Panels**: With thresholds and sparklines  
- **Bar Gauges**: For resource comparison
- **State Timeline**: For service status

### **3. Custom Time Ranges**

Add quick time range buttons:
- Last 5 minutes
- Last 15 minutes  
- Last 1 hour
- Last 24 hours

---

## 📊 Expected Homework Deliverables

### **✅ What You Should Have:**

1. **Functioning Grafana installation** ✅ Ready
2. **Three custom dashboards** ✅ Created
3. **Advanced dashboard features** 🔄 To implement
4. **Comprehensive alerting** 🔄 To configure
5. **Documentation package** 🔄 To create
6. **Demo script** ✅ Template provided

### **📁 File Structure:**
```
monitoring/
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   └── prometheus.yml ✅
│       └── dashboards/
│           ├── dashboards.yml ✅
│           ├── system-overview.json ✅
│           ├── application-performance.json ✅
│           └── user-experience.json ✅
├── simulate-traffic.js ✅
└── prometheus*.yml ✅

grafana-dashboards/ ✅ (for exports)

monitoring-docs/
├── dashboard-catalog.md 🔄
├── metric-dictionary.md 🔄
├── alert-reference.md 🔄
└── demo-script.md 🔄
```

---

## 🚀 Quick Start Commands

```bash
# 1. Start the complete monitoring stack
docker-compose up -d

# 2. Wait for services to start (30 seconds)
sleep 30

# 3. Access Grafana
echo "Grafana: http://localhost:3000 (admin/brainbytes)"
echo "Prometheus: http://localhost:9090"

# 4. Generate test data
cd monitoring
node simulate-traffic.js

# 5. Watch dashboards populate with data!
```

---

## 🆘 Troubleshooting

### **Common Issues:**

1. **Grafana can't connect to Prometheus**
   - Verify both containers are running: `docker-compose ps`
   - Check networks: `docker network ls`
   - Confirm Prometheus URL: `http://prometheus:9090`

2. **No data in panels**
   - Check Prometheus targets: http://localhost:9090/targets
   - Verify metrics endpoints: http://localhost:3000/metrics
   - Run traffic simulation to generate data

3. **Dashboards not loading**
   - Check Grafana logs: `docker-compose logs grafana`
   - Verify provisioning files are mounted correctly
   - Restart Grafana container: `docker-compose restart grafana`

---

## 🎉 Success Criteria

**You've completed the homework when you have:**

- ✅ Grafana running and accessible
- ✅ All three dashboards showing data
- ✅ At least one working alert
- ✅ Complete documentation package
- ✅ Successful demo presentation
- ✅ Dashboard exports saved to repository

**Good luck with your homework! 🚀**
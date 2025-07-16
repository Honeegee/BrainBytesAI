# 🎬 Monitoring & Operations Demo Script
## BrainBytesAI Terminal Assessment - Live Demonstration Guide

**Duration**: 9-12 minutes  
**Presenter**: BrainBytesAI Development Team  
**Date**: January 2025

---

## 🎯 Demo Overview

### Objectives
- **Monitoring Setup**: Demonstrate comprehensive Prometheus/Grafana monitoring
- **Key Metrics**: Explain critical metrics and their business importance
- **Alerting System**: Show alert configuration and incident response
- **Live Operations**: Demonstrate real-time monitoring and troubleshooting

### Success Criteria
- ✅ All monitoring components accessible and functional
- ✅ Real-time metrics displaying current system state
- ✅ Alert system demonstration with simulated incident
- ✅ Professional presentation with clear explanations

---

## 📋 Pre-Demo Checklist (15 minutes before)

### 1. Environment Verification
```bash
# Check Docker containers are running
docker-compose ps

# Verify Prometheus is healthy
curl -f http://localhost:9090/-/healthy
echo "Prometheus Status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/-/healthy)"

# Verify Grafana is accessible
curl -f http://localhost:3003/api/health
echo "Grafana Status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/health)"

# Check AlertManager
curl -f http://localhost:9093/-/healthy
echo "AlertManager Status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:9093/-/healthy)"

# Verify application endpoints
curl -f http://localhost/health
curl -f http://localhost:8090/health
```

### 2. Browser Setup
**Required Tabs (in order):**
1. `http://localhost:9090` - Prometheus
2. `http://localhost:3003` - Grafana (login: admin/brainbytes123)
3. `http://localhost:9093` - AlertManager
4. `http://localhost/health` - Backend Health
5. `http://localhost:8090/health` - AI Service Health
6. `http://localhost/metrics` - Backend Metrics
7. `http://localhost:8090/metrics` - AI Service Metrics

### 3. Demo Preparation
- [ ] All URLs tested and accessible
- [ ] Grafana dashboards loaded with recent data
- [ ] Screen resolution optimized for presentation
- [ ] Backup screenshots prepared
- [ ] Demo script reviewed

---

## 🚀 Demo Execution Script

### **SEGMENT 1: Monitoring Setup Overview (4-5 minutes)**

#### **Opening (30 seconds)**
**Script**: 
> "I'll now demonstrate our comprehensive monitoring and operations setup for BrainBytesAI. Our monitoring stack provides complete visibility into system performance, proactive alerting, and incident response capabilities."

**Actions**:
1. Open presentation slide showing monitoring architecture
2. Briefly explain the monitoring stack components

#### **Prometheus Demonstration (1.5 minutes)**

**Script**: 
> "Let's start with Prometheus, our metrics collection and storage system. Prometheus scrapes metrics from all our services every 15 seconds."

**Actions**:
1. Navigate to `http://localhost:9090`
2. Show Prometheus interface

**Script**: 
> "First, let's verify all our services are being monitored. I'll check the targets to ensure everything is healthy."

**Actions**:
1. Click **Status** → **Targets**
2. Point out each target and their status:
   - `brainbytes-backend` - UP ✅
   - `brainbytes-ai-service` - UP ✅
   - `cadvisor` - UP ✅
   - `node-exporter` - UP ✅
   - `prometheus` - UP ✅
   - `alertmanager` - UP ✅

**Script**: 
> "All services show 'UP' status, meaning our monitoring is successfully collecting metrics from every component. Now let me demonstrate querying our custom metrics."

**Actions**:
1. Navigate back to **Graph** tab
2. In the query box, type: `brainbytes_http_requests_total`
3. Click **Execute**
4. Show the results table

**Script**: 
> "This shows all HTTP requests to our application, broken down by method, route, and status code. Let me show you request rate over time."

**Actions**:
1. Clear query box
2. Type: `rate(brainbytes_http_requests_total[5m])`
3. Click **Execute** and switch to **Graph** tab
4. Point out the visualization

#### **Key Metrics Explanation (1.5 minutes)**

**Script**: 
> "Let me demonstrate some key metrics that are critical for our educational platform."

**Demo Queries** (run each one):

**Query 1: Response Time**
```promql
rate(brainbytes_http_request_duration_seconds_sum[5m]) / rate(brainbytes_http_request_duration_seconds_count[5m])
```
**Script**: 
> "This shows our average response time. For educational applications, we target under 2 seconds to maintain student engagement."

**Query 2: Error Rate**
```promql
(sum(rate(brainbytes_http_requests_total{status=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100
```
**Script**: 
> "Our error rate monitoring. We maintain less than 1% errors to ensure reliable service for students."

**Query 3: AI Service Performance**
```promql
brainbytes_ai_requests_total
```
**Script**: 
> "This tracks AI tutoring requests, which is core to our educational mission. We monitor both volume and response quality."

#### **Grafana Dashboards (1.5 minutes)**

**Script**: 
> "While Prometheus is excellent for ad-hoc queries, Grafana provides our operational dashboards for day-to-day monitoring."

**Actions**:
1. Switch to Grafana tab (`http://localhost:3003`)
2. Login if needed (admin/brainbytes123)
3. Navigate to **Dashboards**

**Dashboard 1: System Overview**
**Script**: 
> "Our system overview dashboard gives us a complete health picture at a glance."

**Actions**:
1. Open **System Overview** dashboard
2. Point out key panels:
   - Service status indicators
   - Overall request rate
   - Response time trends
   - Error rate monitoring
   - Resource utilization

**Dashboard 2: Application Performance**
**Script**: 
> "This dashboard focuses on application-specific metrics that directly impact student experience."

**Actions**:
1. Navigate to **Application Performance** dashboard
2. Highlight:
   - Response time percentiles
   - Request volume by endpoint
   - AI service performance metrics
   - Database connection health

**Script**: 
> "Notice how we track both technical metrics and educational context - like AI response quality and student engagement patterns."

---

### **SEGMENT 2: Alerting Configuration (2-3 minutes)**

#### **Alert Rules Overview (1 minute)**

**Script**: 
> "Proactive alerting is crucial for maintaining service quality. Let me show you our comprehensive alert configuration."

**Actions**:
1. Return to Prometheus (`http://localhost:9090`)
2. Navigate to **Status** → **Rules**
3. Show the loaded alert rules

**Script**: 
> "We have multiple categories of alerts: system health, application performance, AI service specific, and business logic alerts."

**Key Alert Categories to Highlight**:
- **Critical Alerts**: Service down, high error rate, database issues
- **Warning Alerts**: High CPU/memory, slow response times
- **Business Alerts**: No active users, unusual traffic patterns
- **Filipino Context**: Mobile error rates, connection stability

#### **AlertManager Demonstration (1 minute)**

**Script**: 
> "AlertManager handles alert routing, grouping, and notifications. Let me show you the current alert status."

**Actions**:
1. Navigate to AlertManager (`http://localhost:9093`)
2. Show the main interface
3. Point out:
   - Current alerts (should be empty/green)
   - Alert grouping configuration
   - Notification routing

**Script**: 
> "Currently we have no active alerts, which indicates our system is healthy. In production, alerts would be routed to Slack, email, or SMS based on severity."

#### **Alert Configuration Deep Dive (1 minute)**

**Script**: 
> "Let me show you a specific alert rule to explain how our monitoring works."

**Actions**:
1. Return to Prometheus
2. Navigate to **Alerts** tab
3. Show configured alerts and their current status

**Example Alert to Explain**:
```yaml
- alert: HighErrorRate
  expr: (sum(rate(brainbytes_http_requests_total{status=~"5.."}[5m])) / 
         sum(rate(brainbytes_http_requests_total[5m]))) * 100 > 5
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
    description: "Error rate is above 5% for more than 1 minute"
```

**Script**: 
> "This alert triggers when our error rate exceeds 5% for more than 1 minute. It's marked as critical because it directly impacts student experience."

---

### **SEGMENT 3: Live Incident Simulation (2-3 minutes)**

#### **Incident Setup (30 seconds)**

**Script**: 
> "Now I'll demonstrate our incident response capabilities by simulating a real performance issue and showing how our monitoring detects and helps resolve it."

**Actions**:
1. Ensure Grafana dashboard is visible
2. Have AlertManager tab ready
3. Prepare to execute stress test

#### **Trigger Incident (45 seconds)**

**Script**: 
> "I'm going to create high CPU load on our backend service to simulate a performance issue."

**Actions**:
1. Open terminal/command prompt
2. Execute stress test:

```bash
# Method 1: Docker stress test
docker exec -it $(docker ps -q --filter "name=backend") sh -c "
yes > /dev/null &
yes > /dev/null &
yes > /dev/null &
sleep 15
killall yes
"
```

**Alternative Method** (if Docker method fails):
```bash
# Method 2: Generate load through requests
for i in {1..100}; do curl -s http://localhost/health > /dev/null & done
```

**Script**: 
> "I'm creating sustained CPU load. Watch how quickly our monitoring detects this issue."

#### **Monitor Detection (45 seconds)**

**Actions**:
1. Switch to Grafana dashboard
2. Point out CPU usage spike in real-time
3. Show metrics changing on the dashboard

**Script**: 
> "You can see the CPU usage spiking in real-time on our dashboard. Our alert threshold is set at 80% CPU usage for more than 2 minutes."

**Actions**:
1. Navigate to Prometheus **Alerts** tab
2. Show if alert is triggered (may take 1-2 minutes)
3. If alert appears, switch to AlertManager to show active alert

**Script**: 
> "In a production environment, this would immediately notify our on-call engineer via Slack and email. The alert provides context about which service is affected and the severity level."

#### **Investigation Process (30 seconds)**

**Script**: 
> "When responding to an incident, we use our dashboards to quickly investigate the root cause."

**Actions**:
1. Show investigation process in Grafana:
   - Check which service is affected
   - Look at resource utilization trends
   - Review recent deployment history
   - Check error rates and response times

**Script**: 
> "Our dashboards provide all the context needed to quickly identify whether this is a resource issue, application bug, or external dependency problem."

#### **Resolution and Recovery (30 seconds)**

**Script**: 
> "In this case, the high CPU was caused by our stress test. Watch as the system recovers automatically."

**Actions**:
1. Wait for stress test to complete (CPU should return to normal)
2. Show metrics returning to baseline in Grafana
3. Point out alert resolution (if alert was triggered)

**Script**: 
> "You can see the CPU usage returning to normal levels. In a real incident, we might scale resources, restart services, or deploy a hotfix depending on the root cause."

---

### **SEGMENT 4: Operational Procedures (1-2 minutes)**

#### **Documentation and Procedures (1 minute)**

**Script**: 
> "Beyond monitoring, we have comprehensive operational procedures documented for common scenarios."

**Actions**:
1. Briefly mention key operational procedures:
   - Health check procedures
   - Incident response playbooks
   - Escalation procedures
   - Post-incident review process

**Script**: 
> "Our monitoring is integrated with our operational procedures. Each alert includes runbook links and escalation paths."

#### **Business Context (1 minute)**

**Script**: 
> "For BrainBytesAI, monitoring is especially important because we serve Filipino students who may have limited internet connectivity and rely on mobile devices."

**Key Points to Highlight**:
- **Mobile-first monitoring**: Track mobile-specific error rates
- **Network resilience**: Monitor connection drops and timeouts
- **Educational context**: Track AI tutoring effectiveness
- **Peak usage patterns**: Monitor study session times

**Script**: 
> "We track metrics specific to the Philippine context, like mobile error rates and connection stability, ensuring our platform works well even on slower networks."

---

## 🎯 Demo Conclusion (30 seconds)

**Script**: 
> "This demonstrates our production-ready monitoring and operations capabilities. We have comprehensive metrics collection, proactive alerting, and documented incident response procedures. Our monitoring ensures BrainBytesAI provides reliable educational services to Filipino students with 99.9% uptime and optimal performance."

**Final Actions**:
1. Show final system status (all green/healthy)
2. Briefly summarize key capabilities demonstrated
3. Transition to next presentation section

---

## 🚨 Backup Plans

### If Monitoring Stack is Down
1. **Use Screenshots**: Pre-captured dashboard images
2. **Show Configuration**: Walk through YAML files
3. **Explain Architecture**: Focus on design and implementation

### If Alerts Don't Trigger
1. **Show Alert Rules**: Explain configuration in Prometheus
2. **Manual Demonstration**: Use AlertManager API to create test alert
3. **Historical Examples**: Show previous alert instances

### If Performance Issues
1. **Use Local Environment**: Fall back to local development setup
2. **Pre-recorded Demo**: Backup video of successful demonstration
3. **Static Examples**: Use configuration files and documentation

### Time Management
- **Running Long**: Skip detailed query explanations, focus on dashboards
- **Running Short**: Add more detailed metric explanations
- **Technical Issues**: Pivot to architecture discussion and documentation

---

## 📊 Success Metrics

### Technical Demonstration
- ✅ All monitoring components accessible
- ✅ Real-time metrics displaying
- ✅ Alert system functional
- ✅ Incident simulation successful

### Presentation Quality
- ✅ Clear explanations of technical concepts
- ✅ Smooth navigation between tools
- ✅ Professional handling of any issues
- ✅ Strong connection to business value

### Educational Context
- ✅ Filipino student needs addressed
- ✅ Mobile-first considerations explained
- ✅ Educational metrics highlighted
- ✅ Performance optimization demonstrated

---

## 🔧 Quick Reference Commands

### Health Checks
```bash
# Application health
curl http://localhost/health
curl http://localhost:8090/health

# Monitoring stack health
curl http://localhost:9090/-/healthy
curl http://localhost:3003/api/health
curl http://localhost:9093/-/healthy
```

### Useful Prometheus Queries
```promql
# Request rate
rate(brainbytes_http_requests_total[5m])

# Error rate percentage
(sum(rate(brainbytes_http_requests_total{status=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100

# Response time
rate(brainbytes_http_request_duration_seconds_sum[5m]) / rate(brainbytes_http_request_duration_seconds_count[5m])

# AI service requests
brainbytes_ai_requests_total

# System CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### Emergency Recovery
```bash
# Restart monitoring stack
docker-compose restart prometheus grafana alertmanager

# Check container status
docker-compose ps

# View container logs
docker-compose logs prometheus
docker-compose logs grafana
```

---

**Remember**: Stay calm, explain clearly, and focus on the value our monitoring provides to ensure BrainBytesAI delivers excellent educational experiences to Filipino students.
# ✅ Monitoring & Operations Demo Checklist
## BrainBytesAI Terminal Assessment - Pre-Demo Verification

**Demo Date**: _____________  
**Presenter**: _____________  
**Start Time**: _____________

---

## 🕐 30 Minutes Before Demo

### Environment Health Check
- [ ] **Docker Containers Running**
  ```bash
  docker-compose ps
  # All containers should show "Up" status
  ```

- [ ] **Prometheus Health**
  ```bash
  curl -f http://localhost:9090/-/healthy
  # Should return 200 OK
  ```

- [ ] **Grafana Accessibility**
  ```bash
  curl -f http://localhost:3003/api/health
  # Should return 200 OK
  ```

- [ ] **AlertManager Status**
  ```bash
  curl -f http://localhost:9093/-/healthy
  # Should return 200 OK
  ```

- [ ] **Application Health**
  ```bash
  curl -f http://localhost/health
  curl -f http://localhost:8090/health
  # Both should return healthy status
  ```

### Browser Setup
- [ ] **Tab 1**: `http://localhost:9090` (Prometheus)
- [ ] **Tab 2**: `http://localhost:3003` (Grafana - login: admin/brainbytes123)
- [ ] **Tab 3**: `http://localhost:9093` (AlertManager)
- [ ] **Tab 4**: `http://localhost/health` (Backend Health)
- [ ] **Tab 5**: `http://localhost:8090/health` (AI Service Health)
- [ ] **Tab 6**: `http://localhost/metrics` (Backend Metrics)
- [ ] **Tab 7**: `http://localhost:8090/metrics` (AI Service Metrics)
- [ ] **Tab 8**: Presentation HTML file

### Grafana Dashboard Verification
- [ ] **System Overview Dashboard** - Shows recent data
- [ ] **Application Performance Dashboard** - Metrics populated
- [ ] **Infrastructure Dashboard** - Resource metrics visible
- [ ] **All Panels Loading** - No "No data" errors

### Demo Materials Ready
- [ ] **Presentation HTML** - Opens correctly in browser
- [ ] **Demo Script** - Printed or easily accessible
- [ ] **Backup Screenshots** - Saved and accessible
- [ ] **Terminal/Command Prompt** - Ready for stress test commands

---

## 🕐 15 Minutes Before Demo

### Final System Verification
- [ ] **All URLs Tested** - Each tab loads successfully
- [ ] **Metrics Data Fresh** - Recent timestamps on all metrics
- [ ] **No Active Alerts** - AlertManager shows green status
- [ ] **Prometheus Targets** - All showing "UP" status

### Presentation Setup
- [ ] **Screen Resolution** - Optimized for audience visibility
- [ ] **Browser Zoom** - Set to appropriate level for readability
- [ ] **Audio/Video** - Recording setup if needed
- [ ] **Backup Internet** - Mobile hotspot ready if needed

### Demo Script Review
- [ ] **Key Queries Memorized** - Prometheus queries ready to type
- [ ] **Navigation Path** - Know the flow between tools
- [ ] **Timing Practiced** - Each segment within time limits
- [ ] **Backup Plans** - Know what to do if something fails

---

## 🕐 5 Minutes Before Demo

### Last-Minute Checks
- [ ] **Refresh All Dashboards** - Latest data displayed
- [ ] **Clear Browser History** - Clean autocomplete suggestions
- [ ] **Close Unnecessary Apps** - Optimize system performance
- [ ] **Check Network** - Stable internet connection

### Mental Preparation
- [ ] **Demo Flow Reviewed** - Know the sequence of actions
- [ ] **Key Messages Clear** - Understand what to emphasize
- [ ] **Confidence Check** - Ready to present professionally
- [ ] **Backup Materials** - Know where they are if needed

---

## 🎬 During Demo - Quick Reference

### Segment 1: Monitoring Setup (4-5 minutes)
**Key Actions**:
1. Show Prometheus → Status → Targets (all UP)
2. Demo query: `brainbytes_http_requests_total`
3. Demo query: `rate(brainbytes_http_requests_total[5m])`
4. Switch to Grafana dashboards
5. Navigate through System Overview and Application Performance

**Key Messages**:
- All services monitored and healthy
- Real-time metrics collection
- Custom educational metrics
- Professional dashboard visualization

### Segment 2: Alerting (2-3 minutes)
**Key Actions**:
1. Show Prometheus → Status → Rules
2. Navigate to AlertManager (show green status)
3. Explain alert categories and thresholds

**Key Messages**:
- Proactive monitoring with intelligent alerts
- Multiple severity levels
- Business-context alerts for education platform
- Integration with notification systems

### Segment 3: Incident Simulation (2-3 minutes)
**Key Actions**:
1. Execute stress test command:
   ```bash
   docker exec -it $(docker ps -q --filter "name=backend") sh -c "yes > /dev/null & yes > /dev/null & sleep 15; killall yes"
   ```
2. Show CPU spike in Grafana
3. Demonstrate investigation process
4. Show recovery

**Key Messages**:
- Real-time issue detection
- Complete investigation workflow
- System resilience and recovery
- Operational procedures integration

---

## 🚨 Emergency Procedures

### If Monitoring Stack is Down
**Immediate Actions**:
1. Stay calm and acknowledge the issue
2. Switch to backup screenshots
3. Explain: "This demonstrates why we have redundancy"
4. Focus on configuration and architecture discussion

**Script**: 
> "While we troubleshoot this, let me show you our monitoring architecture and configuration, which demonstrates the robustness of our design."

### If Dashboards Show No Data
**Immediate Actions**:
1. Check Prometheus targets first
2. If targets are down, restart containers:
   ```bash
   docker-compose restart
   ```
3. Use historical screenshots
4. Explain the monitoring concept with static examples

### If Internet Connection Fails
**Immediate Actions**:
1. Switch to mobile hotspot immediately
2. Use local-only demonstrations
3. Focus on localhost URLs only
4. Have offline backup materials ready

### If Demo Runs Long
**Priority Order** (cut in this sequence):
1. Skip detailed Prometheus query explanations
2. Reduce dashboard navigation time
3. Shorten incident simulation
4. Focus on key messages only

### If Demo Runs Short
**Extension Options**:
1. Show additional Prometheus queries
2. Demonstrate more Grafana features
3. Explain alert rule configuration in detail
4. Discuss operational procedures more thoroughly

---

## 📊 Success Criteria Checklist

### Technical Demonstration
- [ ] **Prometheus Accessible** - Main interface and queries work
- [ ] **Grafana Dashboards** - Multiple dashboards shown with data
- [ ] **AlertManager** - Interface accessible and status clear
- [ ] **Metrics Collection** - Real data from all services
- [ ] **Incident Simulation** - Successfully triggered and resolved

### Presentation Quality
- [ ] **Clear Explanations** - Technical concepts explained simply
- [ ] **Smooth Navigation** - Efficient movement between tools
- [ ] **Professional Delivery** - Confident and knowledgeable
- [ ] **Time Management** - Within allocated time limits
- [ ] **Audience Engagement** - Clear visibility and understanding

### Educational Context
- [ ] **Filipino Student Focus** - Mobile and connectivity considerations
- [ ] **Educational Metrics** - AI tutoring and engagement tracking
- [ ] **Business Value** - Connection between monitoring and user experience
- [ ] **Operational Excellence** - Production-ready capabilities demonstrated

---

## 🔧 Quick Command Reference

### Health Check Commands
```bash
# Quick health check all services
curl -s http://localhost:9090/-/healthy && echo " ✅ Prometheus OK" || echo " ❌ Prometheus FAIL"
curl -s http://localhost:3003/api/health && echo " ✅ Grafana OK" || echo " ❌ Grafana FAIL"
curl -s http://localhost:9093/-/healthy && echo " ✅ AlertManager OK" || echo " ❌ AlertManager FAIL"
curl -s http://localhost/health && echo " ✅ Backend OK" || echo " ❌ Backend FAIL"
curl -s http://localhost:8090/health && echo " ✅ AI Service OK" || echo " ❌ AI Service FAIL"
```

### Emergency Recovery
```bash
# Restart all monitoring services
docker-compose restart prometheus grafana alertmanager

# Check container status
docker-compose ps

# View recent logs
docker-compose logs --tail=50 prometheus
docker-compose logs --tail=50 grafana
```

### Demo Prometheus Queries
```promql
# Basic request count
brainbytes_http_requests_total

# Request rate (requests per second)
rate(brainbytes_http_requests_total[5m])

# Error rate percentage
(sum(rate(brainbytes_http_requests_total{status=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100

# Average response time
rate(brainbytes_http_request_duration_seconds_sum[5m]) / rate(brainbytes_http_request_duration_seconds_count[5m])

# AI service requests
brainbytes_ai_requests_total

# CPU usage percentage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### Stress Test Commands
```bash
# Primary method - Docker CPU stress
docker exec -it $(docker ps -q --filter "name=backend") sh -c "yes > /dev/null & yes > /dev/null & yes > /dev/null & sleep 15; killall yes"

# Backup method - Request flood
for i in {1..50}; do curl -s http://localhost/health > /dev/null & done; wait
```

---

## 📝 Post-Demo Notes

### What Went Well
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

### Areas for Improvement
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

### Technical Issues Encountered
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

### Audience Questions/Feedback
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

---

**Final Reminder**: The goal is to demonstrate professional monitoring and operations capabilities that ensure BrainBytesAI provides reliable educational services to Filipino students. Focus on the value and impact, not just the technical details.

**Confidence Booster**: You have a comprehensive, production-ready monitoring stack. Trust your preparation and demonstrate with confidence!
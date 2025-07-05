# Demo and Simulation Guide

## Overview

This document provides comprehensive guidance for demonstrating the BrainBytes AI monitoring system and running traffic simulations to showcase monitoring capabilities. It includes demo scripts, simulation scenarios, and presentation guidelines.

## Table of Contents

- [Demo Preparation](#demo-preparation)
- [Traffic Simulation Scripts](#traffic-simulation-scripts)
- [Monitoring Demo Scenarios](#monitoring-demo-scenarios)
- [Dashboard Demonstration](#dashboard-demonstration)
- [Alert Testing](#alert-testing)
- [Performance Testing](#performance-testing)
- [Presentation Guidelines](#presentation-guidelines)

---

## Demo Preparation

### Pre-Demo Checklist

**System Preparation** (30 minutes before demo):
- [ ] Start all monitoring services
- [ ] Verify Prometheus is collecting metrics
- [ ] Confirm Grafana dashboards are loading
- [ ] Test alert notifications
- [ ] Clear any existing alerts
- [ ] Reset demo data if needed

**Environment Setup**:
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services
curl http://localhost:9090/api/v1/targets  # Prometheus targets
curl http://localhost:3003/api/health      # Grafana health

# Start demo traffic generator
node monitoring/scripts/demo-script.js
```

**Demo Data Preparation**:
- Generate baseline traffic for 10 minutes
- Create sample user sessions
- Populate business metrics
- Ensure all dashboards have data

### Demo Environment Configuration

**Optimal Demo Settings**:
```yaml
# Prometheus configuration for demo
global:
  scrape_interval: 5s      # Faster updates for demo
  evaluation_interval: 5s  # Quick alert evaluation

# Grafana dashboard settings
refresh: 5s               # Auto-refresh every 5 seconds
time_range: 30m          # Show last 30 minutes
```

---

## Traffic Simulation Scripts

### Basic Traffic Generator

**File**: `monitoring/scripts/simulate-traffic.js`

**Features**:
- Configurable request rates
- Multiple endpoint simulation
- Error injection capabilities
- Mobile vs desktop traffic simulation

**Usage**:
```bash
# Normal traffic simulation
node monitoring/scripts/simulate-traffic.js --rate=10 --duration=300

# High load simulation
node monitoring/scripts/simulate-traffic.js --rate=100 --duration=60

# Error injection simulation
node monitoring/scripts/simulate-traffic.js --error-rate=0.1 --duration=120
```

**Configuration Options**:
```javascript
const config = {
  baseUrl: 'http://localhost:3000',
  requestRate: 10,           // requests per second
  duration: 300,             // simulation duration in seconds
  errorRate: 0.05,          // 5% error rate
  mobileRatio: 0.7,         // 70% mobile traffic
  endpoints: [
    { path: '/api/questions', weight: 40 },
    { path: '/api/sessions', weight: 30 },
    { path: '/api/users', weight: 20 },
    { path: '/api/ai/chat', weight: 10 }
  ]
};
```

### Advanced Scenario Generator

**File**: `monitoring/scripts/simulate-activity.js`

**Realistic User Behavior Simulation**:
- User session flows
- Question-asking patterns
- AI interaction simulation
- Mobile connectivity patterns

**Scenario Types**:
1. **Normal Study Session**: Typical user behavior
2. **Peak Hour Traffic**: High concurrent users
3. **Mobile Heavy**: Predominantly mobile users
4. **AI Intensive**: Heavy AI service usage

**Example Usage**:
```bash
# Simulate normal study session
node monitoring/scripts/simulate-activity.js --scenario=normal --users=50

# Simulate peak hour traffic
node monitoring/scripts/simulate-activity.js --scenario=peak --users=200

# Simulate mobile-heavy usage
node monitoring/scripts/simulate-activity.js --scenario=mobile --users=100
```

### Comprehensive Demo Script

**File**: `monitoring/scripts/demo-script.js`

**Demo Flow Automation**:
```javascript
const demoFlow = [
  { phase: 'baseline', duration: 60, description: 'Normal operations' },
  { phase: 'load_increase', duration: 120, description: 'Traffic spike' },
  { phase: 'error_injection', duration: 60, description: 'Error simulation' },
  { phase: 'recovery', duration: 60, description: 'System recovery' },
  { phase: 'ai_stress', duration: 90, description: 'AI service stress test' }
];
```

**Features**:
- Automated demo progression
- Real-time status updates
- Dashboard synchronization
- Alert trigger coordination

---

## Monitoring Demo Scenarios

### Scenario 1: Normal Operations Baseline

**Duration**: 5 minutes  
**Purpose**: Show system under normal load

**Simulation Parameters**:
- Request rate: 10-15 requests/second
- Error rate: <1%
- Response time: <500ms
- Active users: 20-30

**Key Metrics to Highlight**:
- System resource usage (CPU: 20-30%, Memory: 40-50%)
- Application performance (response times, throughput)
- Business metrics (active sessions, questions asked)

**Dashboard Focus**:
- System Overview: Green status indicators
- Application Performance: Steady metrics
- User Experience: Good engagement metrics

### Scenario 2: Traffic Spike Simulation

**Duration**: 3 minutes  
**Purpose**: Demonstrate system behavior under load

**Simulation Parameters**:
- Request rate: Ramp from 15 to 100 requests/second
- Maintain low error rate
- Show resource scaling
- Simulate 150+ concurrent users

**Expected Behavior**:
- CPU usage increases to 60-70%
- Response times increase but stay under thresholds
- No alerts triggered (system handles load well)

**Key Demonstration Points**:
- Resource utilization trends
- Performance degradation patterns
- System resilience under load

### Scenario 3: Error Rate Spike

**Duration**: 2 minutes  
**Purpose**: Show error detection and alerting

**Simulation Parameters**:
- Inject 10% error rate
- Focus on specific endpoints
- Trigger error rate alerts
- Show alert notification flow

**Expected Alerts**:
- HighErrorRate (Critical) after 1 minute
- ElevatedErrorRateWarning after 30 seconds

**Demonstration Flow**:
1. Show normal error rate (<1%)
2. Inject errors and watch metrics climb
3. Alert triggers and notifications sent
4. Show error analysis dashboard
5. Simulate fix and recovery

### Scenario 4: AI Service Stress Test

**Duration**: 4 minutes  
**Purpose**: Demonstrate AI-specific monitoring

**Simulation Parameters**:
- High AI request volume
- Simulate slow AI responses
- Show token usage tracking
- Demonstrate cost monitoring

**Key Metrics**:
- AI response time percentiles
- Token consumption rate
- AI service error rate
- Cost per request calculations

**Alert Scenarios**:
- SlowAiResponse warning
- AITokenUsageHigh warning
- Potential PoorUserExperienceCritical

### Scenario 5: Mobile Performance Demo

**Duration**: 3 minutes  
**Purpose**: Show Filipino context monitoring

**Simulation Parameters**:
- 90% mobile traffic
- Simulate connection drops
- Show data usage tracking
- Demonstrate mobile-specific alerts

**Filipino Context Features**:
- Mobile error rate tolerance (8% vs 5%)
- Data usage optimization tracking
- Connection stability monitoring
- Peak hour performance (if demo during 6-10 PM PHT)

---

## Dashboard Demonstration

### Demo Flow Sequence

**1. System Overview Dashboard** (2 minutes)
- Start with high-level system health
- Point out key status indicators
- Show resource utilization trends
- Highlight service availability

**2. Application Performance Dashboard** (3 minutes)
- Drill down into application metrics
- Show request rate and response times
- Demonstrate endpoint performance analysis
- Highlight database performance

**3. Error Analysis Dashboard** (2 minutes)
- Show error tracking capabilities
- Demonstrate error categorization
- Point out troubleshooting features
- Show recent errors table

**4. User Experience Dashboard** (2 minutes)
- Focus on user-centric metrics
- Show engagement analytics
- Demonstrate mobile performance tracking
- Highlight business intelligence features

**5. Resource Optimization Dashboard** (2 minutes)
- Show cost optimization features
- Demonstrate efficiency metrics
- Point out scaling recommendations
- Highlight Filipino context optimizations

### Interactive Demo Features

**Dashboard Variables**:
- Service selector (backend, ai-service)
- Time range selector (5m, 15m, 1h)
- Instance selector for multi-instance setups

**Drill-Down Capabilities**:
- Click on metrics to see detailed views
- Filter by specific endpoints or users
- Zoom into specific time periods

**Real-Time Updates**:
- Show live data updates (5-second refresh)
- Demonstrate alert status changes
- Show metric trends in real-time

---

## Alert Testing

### Alert Demonstration Sequence

**1. System Health Alerts** (3 minutes)
```bash
# Simulate high CPU usage
stress --cpu 4 --timeout 180s

# Expected alerts:
# - HighCpuUsageWarning (70% threshold)
# - HighCpuUsageCritical (85% threshold)
```

**2. Application Performance Alerts** (2 minutes)
```bash
# Inject high error rate
node monitoring/scripts/test-alerts.js --type=error_rate --duration=120

# Expected alerts:
# - ElevatedErrorRateWarning (2% threshold)
# - HighErrorRateCritical (10% threshold)
```

**3. AI Service Alerts** (2 minutes)
```bash
# Simulate slow AI responses
node monitoring/scripts/test-alerts.js --type=ai_slow --duration=120

# Expected alerts:
# - SlowAiResponse warning
# - PoorUserExperienceWarning
```

### Alert Notification Demo

**Notification Channels**:
1. **Slack Integration**: Show real-time Slack notifications
2. **Email Alerts**: Demonstrate email alert format
3. **Dashboard Indicators**: Show alert status on dashboards

**Alert Management**:
- Acknowledge alerts
- Create silences
- Show escalation procedures
- Demonstrate alert grouping

---

## Performance Testing

### Load Testing Scenarios

**Gradual Load Increase**:
```bash
# Start with baseline
node monitoring/scripts/simulate-traffic.js --rate=10 --duration=60

# Increase load gradually
for rate in 20 50 100 200; do
  node monitoring/scripts/simulate-traffic.js --rate=$rate --duration=60
done
```

**Stress Testing**:
```bash
# High load stress test
node monitoring/scripts/simulate-traffic.js --rate=500 --duration=120

# Monitor system behavior:
# - Resource utilization
# - Response time degradation
# - Error rate increases
# - Alert triggering
```

### Capacity Planning Demo

**Demonstrate**:
- Resource usage trends under different loads
- Performance degradation patterns
- Scaling trigger points
- Cost implications of scaling

**Key Metrics to Show**:
- Requests per second capacity
- Response time under load
- Resource efficiency ratios
- Cost per request calculations

---

## Presentation Guidelines

### Demo Structure (15-20 minutes total)

**1. Introduction** (2 minutes)
- Overview of monitoring system
- Key features and benefits
- Demo agenda

**2. System Architecture** (3 minutes)
- Show architecture diagram
- Explain component roles
- Highlight data flow

**3. Live Dashboard Demo** (8 minutes)
- Walk through each dashboard
- Show real-time metrics
- Demonstrate interactive features

**4. Alert System Demo** (4 minutes)
- Trigger sample alerts
- Show notification flow
- Demonstrate response procedures

**5. Filipino Context Features** (2 minutes)
- Highlight mobile optimizations
- Show cost tracking features
- Demonstrate connectivity monitoring

**6. Q&A and Wrap-up** (2 minutes)
- Answer questions
- Summarize key benefits
- Next steps

### Presentation Tips

**Technical Preparation**:
- Have backup demo data ready
- Test all demo scripts beforehand
- Prepare for network connectivity issues
- Have screenshots as fallback

**Audience Engagement**:
- Ask questions about their monitoring challenges
- Relate features to their specific needs
- Show practical troubleshooting examples
- Demonstrate business value

**Common Demo Pitfalls to Avoid**:
- Don't rely solely on live data
- Have pre-generated interesting scenarios
- Avoid long periods without activity
- Keep explanations concise and focused

### Demo Customization

**For Technical Audience**:
- Focus on architecture and implementation
- Show PromQL queries and configurations
- Demonstrate advanced features
- Discuss scalability and performance

**For Business Audience**:
- Emphasize cost optimization
- Show user experience metrics
- Highlight business intelligence features
- Focus on ROI and efficiency gains

**For Filipino Context**:
- Emphasize mobile-first approach
- Show data cost optimizations
- Demonstrate connectivity resilience
- Highlight cultural considerations

---

## Troubleshooting Demo Issues

### Common Demo Problems

**1. No Data in Dashboards**
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Restart traffic generator
node monitoring/scripts/simulate-traffic.js --rate=20 --duration=300
```

**2. Alerts Not Triggering**
```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Force alert conditions
node monitoring/scripts/test-alerts.js --type=cpu --force
```

**3. Slow Dashboard Loading**
- Reduce time range to 15 minutes
- Simplify queries for demo
- Use recording rules for complex calculations

### Demo Recovery Procedures

**Quick Reset**:
```bash
# Reset demo environment
docker-compose -f docker-compose.monitoring.yml restart
sleep 30
node monitoring/scripts/demo-script.js --quick-start
```

**Fallback Options**:
- Use pre-recorded demo video
- Show static screenshots with narration
- Use backup demo environment
- Switch to architecture discussion

---

*Last Updated: January 2025*
*Version: 1.0*
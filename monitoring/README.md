# BrainBytes Monitoring & Alerting Setup

This directory contains the complete Prometheus monitoring and alerting configuration for the BrainBytes application.

## 🚀 Quick Start

### 1. Start All Services
```bash
# From project root
docker-compose up -d
```

### 2. Start Alert Dashboard (Optional)
```bash
cd monitoring
npm run webhook
```

### 3. Generate Test Data
```bash
# In monitoring directory
npm run simulate
```

### 4. Test Alerting System
```bash
npm run test-alerts
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| [`prometheus.yml`](prometheus.yml) | Prometheus server configuration |
| [`alertmanager.yml`](alertmanager.yml) | Alert routing and notification setup |
| [`alert-rules.yml`](alert-rules.yml) | Alert rule definitions |
| [`simulate-activity.js`](simulate-activity.js) | Generate realistic app traffic |
| [`alert-webhook.js`](alert-webhook.js) | Development alert dashboard |
| [`test-alerts.js`](test-alerts.js) | Alert testing suite |
| [`package.json`](package.json) | Node.js dependencies and scripts |

## 🖥️ Available Interfaces

| Service | URL | Description |
|---------|-----|-------------|
| **Prometheus** | http://localhost:9090 | Metrics collection and querying |
| **Alertmanager** | http://localhost:9093 | Alert management interface |
| **Alert Dashboard** | http://localhost:5001 | Custom alert notification viewer |
| **cAdvisor** | http://localhost:8080 | Container resource monitoring |
| **Backend Metrics** | http://localhost:3000/metrics | Application metrics endpoint |
| **AI Service Metrics** | http://localhost:3002/metrics | AI service metrics endpoint |

## 📊 Available Scripts

```bash
# Generate realistic application traffic
npm run simulate

# Start alert webhook dashboard
npm run webhook

# Test alerting system with various scenarios
npm run test-alerts
```

## 🚨 Alert Categories

### System Health Alerts
- **High CPU Usage**: >80% for 2+ minutes
- **High Memory Usage**: >85% for 2+ minutes
- **Disk Space Low**: >90% for 5+ minutes
- **Service Down**: Any service unavailable for 30+ seconds

### Application Performance
- **High Error Rate**: >5% for 1+ minute
- **Slow Response Time**: >2 seconds for 2+ minutes
- **Database Connection Down**: No DB connections for 30+ seconds

### AI Service Monitoring
- **High AI Error Rate**: >10% for 1+ minute
- **Slow AI Response**: >10 seconds for 2+ minutes

### Business Intelligence
- **No Active Users**: No sessions for 10+ minutes
- **Unusual Traffic Spike**: 3x above hourly average

### Philippine Context
- **High Mobile Error Rate**: >8% mobile errors for 2+ minutes
- **Frequent Connection Drops**: >5 drops/second for 1+ minute

## 🔧 Configuration

### Prometheus Configuration
- **Scrape Interval**: 15 seconds
- **Evaluation Interval**: 15 seconds
- **Retention**: 200 hours
- **Targets**: Backend, AI Service, Node Exporter, cAdvisor

### Alert Rules
- Defined in [`alert-rules.yml`](alert-rules.yml)
- Grouped by category (system, application, business)
- Severity levels: critical, warning, info

### Alertmanager Setup
- **Webhook Notifications**: Development dashboard
- **Console Logging**: Direct output for testing
- **Email Support**: Configure SMTP in alertmanager.yml

## 🧪 Testing the Setup

### 1. Basic Functionality Test
```bash
# Check all services are running
docker-compose ps

# Verify metrics endpoints
curl http://localhost:3000/metrics
curl http://localhost:3002/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

### 2. Generate Test Data
```bash
# Start simulation
npm run simulate

# Check metrics in Prometheus UI
# Visit: http://localhost:9090/graph
```

### 3. Test Alerting
```bash
# Start alert dashboard first
npm run webhook

# In another terminal, run alert tests
npm run test-alerts

# Monitor alerts at:
# - http://localhost:5001 (Custom dashboard)
# - http://localhost:9090/alerts (Prometheus)
# - http://localhost:9093 (Alertmanager)
```

## 📈 Key Metrics to Monitor

### Performance Metrics
```promql
# Request rate
sum(rate(brainbytes_http_requests_total[5m]))

# Error rate percentage
sum(rate(brainbytes_http_requests_total{status=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m])) * 100

# Average response time
rate(brainbytes_http_request_duration_seconds_sum[5m]) / rate(brainbytes_http_request_duration_seconds_count[5m])
```

### Business Metrics
```promql
# Active user sessions
brainbytes_active_sessions

# Most popular subjects
topk(5, sum by (subject) (brainbytes_ai_subject_requests_total))

# AI response efficiency
avg(rate(brainbytes_ai_request_duration_seconds_sum[5m]) / rate(brainbytes_ai_request_duration_seconds_count[5m]))
```

### System Health
```promql
# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)

# Memory usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Container memory usage
container_memory_usage_bytes{name=~"brainbytes.*"} / 1024 / 1024
```

## 🔍 Troubleshooting

### Common Issues

1. **Alerts not triggering**
   - Check alert rules syntax in Prometheus UI
   - Verify evaluation intervals and thresholds
   - Ensure services are generating metrics

2. **Services not being scraped**
   - Check Docker network connectivity
   - Verify service health endpoints
   - Review Prometheus logs: `docker-compose logs prometheus`

3. **Webhook not receiving alerts**
   - Verify alertmanager configuration
   - Check webhook URL accessibility
   - Review alertmanager logs: `docker-compose logs alertmanager`

### Debug Commands
```bash
# Check service logs
docker-compose logs prometheus
docker-compose logs alertmanager

# Test connectivity
curl http://localhost:9090/-/healthy
curl http://localhost:9093/-/healthy

# Check configuration
curl http://localhost:9090/api/v1/status/config
```

## 🛡️ Security Considerations

- Metrics endpoints expose application performance data
- Consider authentication for production deployments
- Monitor access to monitoring interfaces
- Use network segmentation for monitoring infrastructure

## 🚀 Next Steps

1. **Set up Grafana** for advanced visualization
2. **Configure email/Slack notifications** in production
3. **Add custom business metrics** for your specific needs
4. **Set up log aggregation** with ELK or similar stack
5. **Implement distributed tracing** for microservices

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Best Practices for Monitoring](https://prometheus.io/docs/practices/rules/)

---

**Happy Monitoring! 📊🚨**

For issues or improvements, refer to the main [Prometheus Monitoring Documentation](../docs/PROMETHEUS_MONITORING.md).
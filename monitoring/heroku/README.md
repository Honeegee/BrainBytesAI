# Heroku Monitoring Setup for BrainBytesAI

This directory contains Heroku-specific monitoring configurations and scripts for deploying BrainBytesAI with comprehensive observability.

## 🚀 Quick Start

### Prerequisites

1. **Heroku CLI** installed and authenticated
2. **Grafana Cloud** account (free tier available)
3. **Node.js** for running monitoring scripts

### Automated Setup

Run the setup script to configure monitoring for your environment:

```bash
# For staging environment
./monitoring/heroku/setup-heroku-monitoring.sh staging

# For production environment  
./monitoring/heroku/setup-heroku-monitoring.sh production
```

### Manual Setup

If you prefer manual configuration:

```bash
# Set up monitoring with Node.js script
node monitoring/heroku/heroku-monitoring.js setup staging
node monitoring/heroku/heroku-monitoring.js setup production
```

## 📁 File Structure

```
monitoring/heroku/
├── README.md                              # This file
├── setup-heroku-monitoring.sh             # Automated setup script
├── heroku-monitoring.js                   # Node.js monitoring manager
├── grafana-cloud-config.yml               # Grafana Agent configuration
├── dashboards/
│   └── brainbytes-heroku-dashboard.json   # Grafana dashboard
└── alerts/
    └── heroku-alert-rules.yml             # Prometheus alert rules
```

## 🔧 Configuration Files

### [`grafana-cloud-config.yml`](grafana-cloud-config.yml)
Grafana Agent configuration optimized for Heroku:
- Prometheus metrics collection
- Loki log aggregation
- Heroku-specific relabeling
- Remote write configuration

### [`heroku-monitoring.js`](heroku-monitoring.js)
Node.js script for monitoring management:
- Environment variable setup
- Health checks
- Endpoint testing
- Dashboard generation

### [`dashboards/brainbytes-heroku-dashboard.json`](dashboards/brainbytes-heroku-dashboard.json)
Comprehensive Grafana dashboard featuring:
- Service health overview
- HTTP request metrics
- AI response performance
- Database connection status
- Mobile platform usage
- Error rate monitoring

### [`alerts/heroku-alert-rules.yml`](alerts/heroku-alert-rules.yml)
Prometheus alert rules for:
- Service availability
- High error rates
- Performance degradation
- Resource usage warnings

## 🌐 Environment Variables

### Required for Grafana Cloud Integration

```bash
# Prometheus (Metrics)
export GRAFANA_CLOUD_PROMETHEUS_URL="https://prometheus-prod-01-eu-west-0.grafana.net/api/prom/push"
export GRAFANA_CLOUD_PROMETHEUS_USER="your-prometheus-user"
export GRAFANA_CLOUD_PROMETHEUS_PASSWORD="your-prometheus-password"

# Loki (Logs)
export GRAFANA_CLOUD_LOKI_URL="https://logs-prod-eu-west-0.grafana.net"
export GRAFANA_CLOUD_LOKI_USER="your-loki-user"
export GRAFANA_CLOUD_LOKI_PASSWORD="your-loki-password"
```

### Set on Heroku Apps

The setup scripts automatically configure these on your Heroku applications:

```bash
ENABLE_METRICS=true
ENVIRONMENT=staging|production
MONITORING_ENABLED=true
GRAFANA_CLOUD_PROMETHEUS_URL=...
GRAFANA_CLOUD_PROMETHEUS_USER=...
GRAFANA_CLOUD_PROMETHEUS_PASSWORD=...
GRAFANA_CLOUD_LOKI_URL=...
GRAFANA_CLOUD_LOKI_USER=...
GRAFANA_CLOUD_LOKI_PASSWORD=...
```

## 📊 Heroku Application Configuration

### Current Application Names

**Staging Environment:**
- Frontend: `brainbytes-frontend-staging-7593f4655363`
- Backend: `brainbytes-backend-staging-de872da2939f`
- AI Service: `brainbytes-ai-service-staging-4b75c77cf53a`

**Production Environment:**
- Frontend: `brainbytes-frontend-production-03d1e6b6b158`
- Backend: `brainbytes-backend-production-d355616d0f1f`
- AI Service: `brainbytes-ai-production-3833f742ba79`

### Monitoring Endpoints

Each service exposes the following endpoints:

**Backend & AI Services:**
- Health: `https://app-name.herokuapp.com/health`
- Metrics: `https://app-name.herokuapp.com/metrics`

**Frontend:**
- Health: `https://app-name.herokuapp.com/` (main page)

## 🚨 Alerting Strategy

### Alert Severity Levels

1. **Critical**: Service down, database disconnected, high error rate
2. **Warning**: High response time, slow AI responses, high memory usage
3. **Info**: High traffic volume, connection drops, mobile traffic spikes

### Notification Channels

Configure these in Grafana Cloud:
- **Email**: For all alert severities
- **Slack**: For critical and warning alerts
- **PagerDuty**: For critical alerts only

## 📈 Metrics Collection

### Application Metrics

The BrainBytesAI applications automatically expose these metrics:

**HTTP Metrics:**
- `brainbytes_http_requests_total`: Total HTTP requests
- `brainbytes_http_request_duration_seconds`: Request duration histogram
- `brainbytes_response_size_bytes`: Response size histogram

**AI-Specific Metrics:**
- `brainbytes_ai_response_time_seconds`: AI response time
- `brainbytes_tutoring_sessions_total`: Tutoring session count
- `brainbytes_questions_total`: Questions asked count

**Database Metrics:**
- `brainbytes_db_connections_active`: Active database connections
- `brainbytes_db_operation_duration_seconds`: Database operation duration

**Mobile/Network Metrics:**
- `brainbytes_mobile_requests_total`: Mobile platform requests
- `brainbytes_connection_drops_total`: Connection drops (for Philippine network conditions)

### System Metrics

Standard Node.js process metrics:
- `process_cpu_seconds_total`: CPU usage
- `process_resident_memory_bytes`: Memory usage
- `process_start_time_seconds`: Process start time
- `nodejs_*`: Node.js specific metrics

## 🔍 Testing & Validation

### Health Check Commands

```bash
# Test all endpoints
node monitoring/heroku/heroku-monitoring.js test staging
node monitoring/heroku/heroku-monitoring.js test production

# Check specific app health
curl https://brainbytes-backend-staging-de872da2939f.herokuapp.com/health
curl https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com/health

# Check metrics endpoints
curl https://brainbytes-backend-staging-de872da2939f.herokuapp.com/metrics
curl https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com/metrics
```

### Log Monitoring

```bash
# Real-time log monitoring
heroku logs --tail --app brainbytes-backend-staging-de872da2939f
heroku logs --tail --app brainbytes-ai-service-staging-4b75c77cf53a

# Structured log search
heroku logs --app brainbytes-backend-staging-de872da2939f | grep ERROR
```

## 🔧 Troubleshooting

### Common Issues

1. **Metrics endpoint not responding**
   - Check if `ENABLE_METRICS=true` is set
   - Verify the application is running
   - Check application logs for errors

2. **Grafana Cloud not receiving data**
   - Verify environment variables are set correctly
   - Check network connectivity
   - Validate authentication credentials

3. **High memory usage alerts**
   - Heroku dynos have memory limits (512MB for standard dynos)
   - Consider upgrading dyno types
   - Optimize application memory usage

### Debug Commands

```bash
# Check Heroku app configuration
heroku config --app brainbytes-backend-staging-de872da2939f

# Check dyno status
heroku ps --app brainbytes-backend-staging-de872da2939f

# Check recent deployments
heroku releases --app brainbytes-backend-staging-de872da2939f

# Check log drains
heroku drains --app brainbytes-backend-staging-de872da2939f
```

## 🌏 Philippine-Specific Considerations

### Network Conditions
- Monitor connection drops due to intermittent connectivity
- Track mobile platform usage (high mobile internet usage in Philippines)
- Alert on slow response times that may affect user experience

### Performance Optimization
- Monitor response size for slower connections
- Track AI response times for education use cases
- Monitor peak usage during school hours

### Cost Optimization
- Use Heroku's free/hobby tiers for development
- Leverage Grafana Cloud's free tier
- Monitor resource usage to optimize dyno sizing

## 📚 Additional Resources

- [Heroku Metrics Documentation](https://devcenter.heroku.com/articles/metrics)
- [Grafana Cloud Documentation](https://grafana.com/docs/grafana-cloud/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Heroku Dyno Types](https://devcenter.heroku.com/articles/dyno-types)

## 🤝 Support

For monitoring-specific issues:
1. Check the troubleshooting section above
2. Review Heroku application logs
3. Verify Grafana Cloud connectivity
4. Contact support if needed

---

**Note**: This monitoring setup is specifically optimized for Heroku's platform constraints and BrainBytesAI's educational technology requirements.
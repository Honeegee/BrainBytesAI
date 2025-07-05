# Quick Start Guide

## Overview

This guide helps you quickly set up and start using the BrainBytes AI monitoring system. Follow these steps to get monitoring up and running in under 10 minutes.

## Prerequisites

- Docker and Docker Compose installed
- BrainBytes AI application running
- Basic understanding of monitoring concepts

## Step 1: Start Monitoring Stack (2 minutes)

### Launch All Services
```bash
# Navigate to project root
cd /path/to/BrainBytesAI

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### Expected Output
```
Name                Command               State           Ports
----------------------------------------------------------------
alertmanager    /bin/alertmanager --config...   Up      0.0.0.0:9093->9093/tcp
cadvisor        /usr/bin/cadvisor -logtostderr   Up      0.0.0.0:8080->8080/tcp
grafana         /run.sh                          Up      0.0.0.0:3003->3000/tcp
node-exporter   /bin/node_exporter --path.pr...  Up      0.0.0.0:9100->9100/tcp
prometheus      /bin/prometheus --config.fil...  Up      0.0.0.0:9090->9090/tcp
```

## Step 2: Verify Data Collection (2 minutes)

### Check Prometheus Targets
1. Open browser to http://localhost:9090
2. Go to Status → Targets
3. Verify all targets show "UP" status:
   - prometheus (localhost:9090)
   - brainbytes-backend (backend:3000)
   - brainbytes-ai-service (ai-service:3002)
   - node-exporter (node-exporter:9100)
   - cadvisor (cadvisor:8080)
   - alertmanager (alertmanager:9093)

### Quick Metrics Test
```bash
# Test if metrics are being collected
curl http://localhost:9090/api/v1/query?query=up

# Should return JSON with target status
```

## Step 3: Access Grafana Dashboards (2 minutes)

### Login to Grafana
1. Open browser to http://localhost:3003
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. Skip password change for development

### View Pre-built Dashboards
Navigate to Dashboards and open:
- **System Overview**: High-level system health
- **Application Performance**: Request/response metrics
- **Error Analysis**: Error tracking and analysis
- **User Experience**: User-focused metrics
- **Resource Optimization**: Cost and efficiency tracking

## Step 4: Generate Sample Data (2 minutes)

### Start Traffic Simulation
```bash
# Generate baseline traffic
node monitoring/scripts/simulate-traffic.js --rate=10 --duration=300

# Or use the demo script for varied scenarios
node monitoring/scripts/demo-script.js
```

### Verify Data in Dashboards
1. Refresh Grafana dashboards
2. Check that metrics are populating
3. Verify time series data is appearing

## Step 5: Test Alerting (2 minutes)

### Trigger a Test Alert
```bash
# Simulate high error rate
node monitoring/scripts/test-alerts.js --type=error_rate --duration=120
```

### Check Alert Status
1. Go to Prometheus: http://localhost:9090/alerts
2. Should see "HighErrorRate" alert firing
3. Check Grafana for alert indicators

## Common Issues and Solutions

### Issue: No Data in Dashboards
**Solution**:
```bash
# Check if application services are running
docker ps | grep brainbytes

# Restart monitoring stack
docker-compose -f docker-compose.monitoring.yml restart

# Generate test traffic
node monitoring/scripts/simulate-traffic.js --rate=20 --duration=180
```

### Issue: Targets Showing as Down
**Solution**:
```bash
# Check network connectivity
docker network ls
docker network inspect brainbytes_default

# Verify service endpoints
curl http://localhost:3000/metrics  # Backend
curl http://localhost:3002/metrics  # AI Service
```

### Issue: Grafana Login Problems
**Solution**:
```bash
# Reset Grafana admin password
docker exec -it grafana grafana-cli admin reset-admin-password admin

# Or restart Grafana container
docker-compose -f docker-compose.monitoring.yml restart grafana
```

## Next Steps

### Explore Documentation
1. **[System Architecture](01-system-architecture.md)**: Understand the monitoring system
2. **[Metrics Catalog](02-metrics-catalog.md)**: Learn about available metrics
3. **[Query Reference](03-query-reference.md)**: Master PromQL queries
4. **[Alert Rules](04-alert-rules.md)**: Configure alerting

### Customize for Your Needs
1. **Adjust Alert Thresholds**: Modify alert rules based on your requirements
2. **Create Custom Dashboards**: Build dashboards for specific use cases
3. **Configure Notifications**: Set up Slack/email notifications
4. **Optimize Performance**: Tune scrape intervals and retention

### Production Deployment
1. **Security**: Configure authentication and HTTPS
2. **High Availability**: Set up Prometheus federation
3. **Backup**: Implement configuration and data backup
4. **Monitoring**: Monitor the monitoring system itself

## Useful Commands

### Monitoring Stack Management
```bash
# Start monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Stop monitoring
docker-compose -f docker-compose.monitoring.yml down

# View logs
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
docker-compose -f docker-compose.monitoring.yml logs -f grafana

# Restart specific service
docker-compose -f docker-compose.monitoring.yml restart prometheus
```

### Data Generation
```bash
# Normal traffic
node monitoring/scripts/simulate-traffic.js --rate=15 --duration=600

# High load test
node monitoring/scripts/simulate-traffic.js --rate=100 --duration=120

# Error injection
node monitoring/scripts/simulate-traffic.js --error-rate=0.1 --duration=180

# Full demo scenario
node monitoring/scripts/demo-script.js
```

### Health Checks
```bash
# Check Prometheus health
curl http://localhost:9090/-/healthy

# Check Grafana health
curl http://localhost:3003/api/health

# Check all targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

## Support and Resources

### Documentation Links
- [Complete Documentation Index](README.md)
- [Troubleshooting Guide](06-monitoring-procedures.md#troubleshooting-workflows)
- [Configuration Reference](09-configuration-reference.md)

### External Resources
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)

### Getting Help
1. Check the troubleshooting section in documentation
2. Review Docker logs for error messages
3. Verify network connectivity between services
4. Ensure all required ports are available

---

**Congratulations!** You now have a fully functional monitoring system for BrainBytes AI. The system is collecting metrics, displaying dashboards, and ready to alert on issues.

*Last Updated: January 2025*
*Version: 1.0*
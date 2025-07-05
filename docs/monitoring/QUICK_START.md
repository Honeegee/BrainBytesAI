# Monitoring Quick Start Guide

## Overview

This guide helps you quickly set up and start using the BrainBytes AI monitoring system. Follow these steps to get comprehensive monitoring up and running in under 10 minutes with our integrated Docker Compose setup.

## Prerequisites

- **Docker Desktop** (v20.10+) installed and running
- **BrainBytes AI application** cloned and configured
- **Environment variables** properly set up
- Basic understanding of monitoring concepts

## Step 1: Start Complete Application Stack (3 minutes)

### Launch All Services Including Monitoring
```bash
# Navigate to project root
cd BrainBytesAI

# Start all services (application + monitoring)
npm run dev

# Or start in detached mode
npm run dev:detached

# Verify all services are running
docker-compose ps
```

### Expected Output
```
Name                Command               State           Ports
------------------------------------------------------------------------
nginx-proxy         /docker-entrypoint.sh nginx     Up      0.0.0.0:80->80/tcp, 0.0.0.0:8080->8080/tcp, 0.0.0.0:8090->8090/tcp
brainbytes-frontend /docker-entrypoint.sh npm       Up      3000/tcp
brainbytes-backend  docker-entrypoint.sh npm        Up      3000/tcp
brainbytes-ai       docker-entrypoint.sh npm        Up      3002/tcp
prometheus          /bin/prometheus --config.fil... Up      0.0.0.0:9090->9090/tcp
grafana             /run.sh                         Up      0.0.0.0:3003->3000/tcp
alertmanager        /bin/alertmanager --config...  Up      0.0.0.0:9093->9093/tcp
node-exporter       /bin/node_exporter --path.pr... Up      0.0.0.0:9100->9100/tcp
cadvisor            /usr/bin/cadvisor -logtostderr  Up      0.0.0.0:8081->8080/tcp
redis-local         docker-entrypoint.sh redis...  Up      0.0.0.0:6379->6379/tcp
```

## Step 2: Access Monitoring Services (2 minutes)

### Service Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Main Application** | http://localhost | Frontend application via nginx |
| **Monitoring Dashboard** | http://localhost:8080 | nginx proxy for monitoring services |
| **Grafana** | http://localhost:8080/grafana | Visualization dashboards |
| **Prometheus** | http://localhost:8080/prometheus | Metrics collection and queries |
| **Alertmanager** | http://localhost:8080/alertmanager | Alert management |
| **Direct Grafana** | http://localhost:3003 | Direct Grafana access |
| **Direct Prometheus** | http://localhost:9090 | Direct Prometheus access |

### Login to Grafana
1. **Via nginx proxy**: http://localhost:8080/grafana
2. **Direct access**: http://localhost:3003
3. **Credentials**:
   - Username: `admin`
   - Password: `brainbytes123`

## Step 3: Verify Data Collection (2 minutes)

### Check Prometheus Targets
1. Open browser to http://localhost:8080/prometheus (or http://localhost:9090)
2. Go to **Status → Targets**
3. Verify all targets show **"UP"** status:
   - `prometheus` (prometheus:9090)
   - `brainbytes-backend` (backend:3000)
   - `brainbytes-ai-service` (ai-service:3002)
   - `brainbytes-frontend` (frontend:3000)
   - `node-exporter` (node-exporter:9100)
   - `cadvisor` (cadvisor:8080)
   - `alertmanager` (alertmanager:9093)
   - `redis` (redis:6379)

### Quick Metrics Test
```bash
# Test Prometheus API
curl http://localhost:9090/api/v1/query?query=up

# Test via nginx proxy
curl http://localhost:8080/prometheus/api/v1/query?query=up

# Check application metrics endpoints
curl http://localhost/api/metrics     # Backend metrics via nginx
curl http://localhost:8090/metrics    # AI service metrics via nginx
```

## Step 4: Explore Grafana Dashboards (2 minutes)

### Access Pre-configured Dashboards
Navigate to **Dashboards** in Grafana and explore:

- **🏠 System Overview**: High-level system health and performance
- **📊 Application Performance**: Request/response metrics and throughput
- **🚨 Error Analysis**: Error tracking and failure analysis
- **👥 User Experience**: User-focused metrics and engagement
- **💰 Resource Optimization**: Cost efficiency and resource utilization
- **🐳 Container Metrics**: Docker container performance (via cAdvisor)
- **🖥️ Host Metrics**: System-level metrics (via Node Exporter)

### Dashboard Features
- **Real-time updates**: Dashboards refresh automatically
- **Time range selection**: Adjust time windows for analysis
- **Interactive panels**: Click and drill down into metrics
- **Alert indicators**: Visual alerts when thresholds are exceeded

## Step 5: Generate Sample Data (2 minutes)

### Method 1: Use the Application
```bash
# Access the frontend and interact with it
open http://localhost

# Or use curl to generate API traffic
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Method 2: Traffic Simulation (if available)
```bash
# Check if simulation scripts exist
ls monitoring/scripts/

# Run traffic simulation if available
node monitoring/scripts/simulate-traffic.js --rate=10 --duration=300

# Or generate varied scenarios
node monitoring/scripts/demo-script.js
```

### Verify Data in Dashboards
1. Refresh Grafana dashboards (http://localhost:8080/grafana)
2. Check that metrics are populating in real-time
3. Verify time series data appears in graphs
4. Monitor container metrics in cAdvisor panels

## Step 6: Test Alerting (2 minutes)

### Check Alert Configuration
1. Go to **Prometheus**: http://localhost:8080/prometheus/alerts
2. View configured alert rules
3. Check alert status (should show "Inactive" for healthy system)

### View Alertmanager
1. Access **Alertmanager**: http://localhost:8080/alertmanager
2. Check alert routing configuration
3. View any active alerts

### Trigger Test Scenarios (Optional)
```bash
# Generate high load to trigger alerts
for i in {1..100}; do
  curl http://localhost/api/health &
done

# Monitor CPU/memory usage
docker stats

# Check if alerts fire in Prometheus/Alertmanager
```

## Common Issues and Solutions

### Issue: Services Not Starting
**Solution**:
```bash
# Check Docker Desktop is running
docker --version

# Check for port conflicts
netstat -an | grep :80
netstat -an | grep :3000

# Clean and restart
npm run clean
npm run dev
```

### Issue: No Data in Dashboards
**Solution**:
```bash
# Check if all services are running
docker-compose ps

# Verify nginx proxy configuration
curl http://localhost:8080/prometheus/api/v1/targets

# Check application metrics endpoints
curl http://localhost/api/metrics
curl http://localhost:8090/metrics

# Restart monitoring stack
docker-compose restart prometheus grafana
```

### Issue: Targets Showing as Down
**Solution**:
```bash
# Check network connectivity
docker network ls
docker network inspect brainbytesai_app-network

# Verify service health
docker-compose logs backend
docker-compose logs ai-service
docker-compose logs prometheus

# Check service endpoints directly
docker exec -it prometheus wget -qO- http://backend:3000/metrics
docker exec -it prometheus wget -qO- http://ai-service:3002/metrics
```

### Issue: Grafana Access Problems
**Solution**:
```bash
# Check Grafana logs
docker-compose logs grafana

# Reset Grafana (if needed)
docker-compose restart grafana

# Access via different URLs
# Try: http://localhost:3003 (direct)
# Try: http://localhost:8080/grafana (via nginx)

# Verify credentials: admin / brainbytes123
```

### Issue: nginx Proxy Not Working
**Solution**:
```bash
# Check nginx configuration
docker-compose logs nginx

# Verify nginx config file
cat nginx/nginx.conf

# Test direct service access
curl http://localhost:9090    # Direct Prometheus
curl http://localhost:3003    # Direct Grafana
```

## Advanced Configuration

### Enable Heroku Monitoring (Optional)
```bash
# Set Heroku API token in .env file
echo "HEROKU_API_TOKEN=your_token_here" >> .env

# Start with Heroku profile
docker-compose --profile heroku up -d

# Verify Heroku exporter
curl http://localhost:9595/metrics
```

### Custom Metrics Collection
```bash
# Add custom metrics to your application
# Backend: Add prometheus-client to package.json
# Frontend: Add performance monitoring

# Restart services to pick up new metrics
docker-compose restart backend ai-service
```

## Useful Commands

### Stack Management
```bash
# Start everything
npm run dev

# Start in background
npm run dev:detached

# Stop all services
npm run stop

# View logs
npm run logs
npm run logs:backend
npm run logs:frontend

# Clean everything
npm run clean
```

### Monitoring Specific Commands
```bash
# Restart monitoring services only
docker-compose restart prometheus grafana alertmanager

# View monitoring logs
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f alertmanager

# Check monitoring service health
curl http://localhost:9090/-/healthy          # Prometheus
curl http://localhost:3003/api/health         # Grafana
curl http://localhost:9093/-/healthy          # Alertmanager
```

### Data and Configuration
```bash
# Backup Grafana dashboards
docker exec grafana grafana-cli admin export-dashboard

# View Prometheus configuration
curl http://localhost:9090/api/v1/status/config

# Check alert rules
curl http://localhost:9090/api/v1/rules
```

## Next Steps

### 📚 Explore Documentation
1. **[System Architecture](01-system-architecture.md)**: Understand the monitoring architecture
2. **[Metrics Catalog](02-metrics-catalog.md)**: Learn about available metrics
3. **[Query Reference](03-query-reference.md)**: Master PromQL queries
4. **[Alert Rules](04-alert-rules.md)**: Configure custom alerting
5. **[Dashboard Creation](05-dashboard-creation.md)**: Build custom dashboards

### 🔧 Customize for Your Needs
1. **Adjust Alert Thresholds**: Modify alert rules in `monitoring/configs/prometheus/rules/`
2. **Create Custom Dashboards**: Build dashboards for specific use cases
3. **Configure Notifications**: Set up Slack/email notifications in Alertmanager
4. **Optimize Performance**: Tune scrape intervals and retention policies

### 🚀 Production Deployment
1. **Security**: Configure authentication and HTTPS
2. **High Availability**: Set up Prometheus federation
3. **Backup**: Implement configuration and data backup
4. **External Monitoring**: Monitor the monitoring system itself

## Support and Resources

### 📖 Documentation Links
- [Complete Documentation Index](../DOCUMENTATION_INDEX.md)
- [Troubleshooting Guide](06-monitoring-procedures.md#troubleshooting-workflows)
- [Configuration Reference](09-configuration-reference.md)
- [Main README](../../README.md)

### 🌐 External Resources
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

### 🆘 Getting Help
1. **Check Logs**: Use `docker-compose logs [service-name]` for troubleshooting
2. **Verify Network**: Ensure all services can communicate via Docker network
3. **Port Conflicts**: Check for port conflicts with other applications
4. **Documentation**: Review the comprehensive documentation in `docs/`
5. **GitHub Issues**: Report bugs or request features

## Health Check Checklist

Use this checklist to verify your monitoring setup:

- [ ] All Docker containers are running (`docker-compose ps`)
- [ ] nginx proxy is accessible (http://localhost)
- [ ] Prometheus targets are UP (http://localhost:8080/prometheus/targets)
- [ ] Grafana dashboards load (http://localhost:8080/grafana)
- [ ] Application metrics are being collected
- [ ] Container metrics are visible (cAdvisor)
- [ ] Host metrics are being collected (Node Exporter)
- [ ] Alertmanager is configured (http://localhost:8080/alertmanager)
- [ ] Redis is healthy for session storage

---

**🎉 Congratulations!** You now have a fully functional, integrated monitoring system for BrainBytes AI. The system is collecting comprehensive metrics, displaying interactive dashboards, and ready to alert on issues.

**Key Features Enabled:**
- ✅ Application performance monitoring
- ✅ Infrastructure monitoring
- ✅ Container monitoring
- ✅ Real-time dashboards
- ✅ Alerting system
- ✅ Centralized logging access

*Last Updated: January 2025*  
*Version: 2.0 - Updated for integrated Docker Compose setup*
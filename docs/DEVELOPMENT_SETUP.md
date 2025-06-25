# Development Setup with Nginx Proxy

This guide explains how to run the BrainBytes application with the Nginx reverse proxy for development and monitoring.

## Architecture Overview

The development setup now includes an Nginx reverse proxy that provides:

- **Single entry point** for all services through port 80
- **Centralized monitoring dashboard** through port 8080
- **Better traffic monitoring** and metrics collection
- **Simplified development** with consistent URLs

## Service Access URLs

### Main Application (Port 80)
- **Frontend**: http://localhost/
- **Backend API**: http://localhost/api/
- **Health Check**: http://localhost/health
- **Backend Metrics**: http://localhost/metrics

### Monitoring Dashboard (Port 8090)
- **Prometheus**: http://localhost:8090/prometheus/
- **Alertmanager**: http://localhost:8090/alertmanager/
- **cAdvisor**: http://localhost:8090/cadvisor/
- **AI Service Metrics**: http://localhost:8090/ai-metrics

### Direct Service Access (for development)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Node Exporter**: http://localhost:9100

## Quick Start

1. **Start all services**:
   ```bash
   docker-compose up -d --build
   ```

2. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

3. **Access the application**:
   - Open http://localhost/ in your browser
   - Check monitoring at http://localhost:8080/prometheus/

4. **Run traffic simulation**:
   ```bash
   cd monitoring
   npm install
   node simulate-activity.js
   ```

## Testing the Monitoring Setup

### 1. Check Service Health
```bash
# Test frontend
curl http://localhost/

# Test backend API
curl http://localhost/health

# Test metrics endpoint
curl http://localhost/metrics
```

### 2. Verify Prometheus Targets
- Go to http://localhost:8080/prometheus/targets
- All targets should show as "UP"

### 3. Test Sample Queries
In the Prometheus UI (http://localhost:8080/prometheus/):

```promql
# Request rate
rate(brainbytes_http_requests_total[5m])

# Average response time
rate(brainbytes_http_request_duration_seconds_sum[5m]) / rate(brainbytes_http_request_duration_seconds_count[5m])

# Active sessions
brainbytes_active_sessions

# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)
```

## Development Benefits

### Centralized Access
- All services accessible through consistent URLs
- No need to remember multiple ports
- Simplified development workflow

### Better Monitoring
- All HTTP traffic passes through Nginx
- Enhanced logging and metrics collection
- Realistic production-like setup

### Load Balancing Ready
- Easy to add multiple backend instances
- Health check integration
- Failover capabilities

## Troubleshooting

### Services Not Starting
```bash
# Check service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs prometheus

# Restart specific service
docker-compose restart frontend
```

### Frontend Issues
```bash
# Check frontend status
docker-compose ps frontend

# View frontend logs
docker-compose logs -f frontend
```

### Metrics Not Appearing
1. Check if services are exposing `/metrics` endpoints
2. Verify Prometheus targets are UP
3. Check network connectivity between services

## Production Considerations

When deploying to production:

1. **Enable SSL/TLS** in Nginx configuration
2. **Configure proper logging** and log rotation
3. **Set up authentication** for monitoring endpoints
4. **Configure rate limiting** for public endpoints
5. **Enable caching** for static assets

## Next Steps

1. **Add Grafana** for visual dashboards
2. **Set up external alerting** (email, Slack)
3. **Configure log aggregation** (ELK stack)
4. **Add API documentation** (Swagger/OpenAPI)
5. **Implement health checks** for all services
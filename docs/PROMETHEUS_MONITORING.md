# Prometheus Monitoring Setup for BrainBytes
## Simple Guide for Development and Production

> **⚠️ IMPORTANT:** For homework submission, use [`PROMETHEUS_HOMEWORK_SOLUTION.md`](PROMETHEUS_HOMEWORK_SOLUTION.md) which has the complete implementation guide.

This document explains how to set up and use Prometheus monitoring for your BrainBytes application.

## Overview

Prometheus is a powerful monitoring and alerting toolkit that has been integrated into your BrainBytes application to provide comprehensive insights into:

- Application performance metrics
- System resource usage
- User engagement patterns
- AI service performance
- Philippine-specific mobile optimization metrics

## Quick Start

### Development Environment (Working)
```bash
# Start all services including monitoring
docker-compose up -d

# Check Prometheus UI
open http://localhost:9090

# Check your metrics
curl http://localhost:3000/metrics  # Backend
curl http://localhost:3002/metrics  # AI Service
```

### Production Environment (Heroku)
Your production apps already expose metrics at:
- Backend: https://brainbytes-backend-production-d355616d0f1f.herokuapp.com/metrics
- AI Service: https://brainbytes-ai-production-3833f742ba79.herokuapp.com/metrics

**For production monitoring setup:** See [`PROMETHEUS_HOMEWORK_SOLUTION.md`](PROMETHEUS_HOMEWORK_SOLUTION.md)

## Services and Ports

| Service | Port | Description |
|---------|------|-------------|
| Prometheus | 9090 | Main Prometheus web UI and API |
| Alertmanager | 9093 | Alert management and routing |
| Node Exporter | 9100 | Host system metrics |
| cAdvisor | 8080 | Container metrics |
| Alert Webhook | 5001 | Development alert dashboard |
| Backend Metrics | 3000/metrics | BrainBytes backend metrics |
| AI Service Metrics | 3002/metrics | AI service metrics |

## Key Metrics Collected

### Application Performance Metrics

```promql
# Request Rate
sum(rate(brainbytes_http_requests_total[5m]))

# Error Rate
sum(rate(brainbytes_http_requests_total{status=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m])) * 100

# Average Response Time
rate(brainbytes_http_request_duration_seconds_sum[5m]) / rate(brainbytes_http_request_duration_seconds_count[5m])
```

### AI Service Metrics

```promql
# AI Request Duration
rate(brainbytes_ai_request_duration_seconds_sum[5m]) / rate(brainbytes_ai_request_duration_seconds_count[5m])

# AI Requests by Subject
sum by (subject) (brainbytes_ai_subject_requests_total)

# AI Error Rate
sum(rate(brainbytes_ai_errors_total[5m])) / sum(rate(brainbytes_ai_requests_total[5m])) * 100
```

### Business Metrics

```promql
# Active Sessions
brainbytes_active_sessions

# Tutoring Sessions by Subject
sum by (subject) (brainbytes_tutoring_sessions_total)

# Questions per Session
sum(rate(brainbytes_questions_total[1h])) / sum(rate(brainbytes_tutoring_sessions_total[1h]))
```

### Philippine Context Metrics

```promql
# Mobile Traffic
sum by (platform) (brainbytes_mobile_requests_total)

# Response Size Distribution
histogram_quantile(0.95, brainbytes_response_size_bytes)

# Connection Stability
sum by (reason) (brainbytes_connection_drops_total)
```

## Testing with Simulation

To generate test data for your metrics:

```bash
# Navigate to monitoring directory
cd monitoring

# Run activity simulation
npm run simulate

# Run alert webhook receiver (in another terminal)
npm run webhook

# Or run directly
node simulate-activity.js
```

The simulation script will:
- Generate realistic user traffic
- Create AI chat interactions
- Simulate mobile device requests
- Test different subjects and grade levels
- Generate authentication attempts
- Potentially trigger some alerts based on thresholds

## Useful PromQL Queries

### Performance Monitoring

```promql
# Top 5 slowest endpoints
topk(5, 
  rate(brainbytes_http_request_duration_seconds_sum[5m]) / 
  rate(brainbytes_http_request_duration_seconds_count[5m])
)

# Request rate by endpoint
sum by (route) (rate(brainbytes_http_requests_total[5m]))

# 95th percentile response time
histogram_quantile(0.95, 
  rate(brainbytes_http_request_duration_seconds_bucket[5m])
)
```

### Business Intelligence

```promql
# Most popular subjects
topk(5, sum by (subject) (brainbytes_ai_subject_requests_total))

# AI response efficiency by subject
avg by (subject) (
  rate(brainbytes_ai_response_time_seconds_sum[5m]) / 
  rate(brainbytes_ai_response_time_seconds_count[5m])
)

# Daily active sessions
increase(brainbytes_tutoring_sessions_total[24h])
```

## Access Monitoring Interfaces

- **Prometheus UI**: http://localhost:9090
- **Alertmanager UI**: http://localhost:9093
- **Alert Dashboard**: http://localhost:5001
- **cAdvisor**: http://localhost:8080
- **Backend Metrics**: http://localhost:3000/metrics
- **AI Service Metrics**: http://localhost:3002/metrics

## Troubleshooting

### Common Issues

1. **Services not being scraped**
   - Check if `/metrics` endpoints are accessible
   - Verify network connectivity between containers
   - Check Prometheus logs: `docker-compose logs prometheus`

2. **No data in Prometheus**
   - Ensure services are generating traffic
   - Run the simulation script to generate test data
   - Check target health in Prometheus UI

3. **High resource usage**
   - Adjust scrape intervals in `prometheus.yml`
   - Configure retention policies
   - Monitor container resource limits

### Debugging Commands

```bash
# Check service logs
docker-compose logs prometheus
docker-compose logs backend
docker-compose logs ai-service

# Test metrics endpoints
curl http://localhost:3000/metrics
curl http://localhost:3002/metrics

# Check Prometheus configuration
curl http://localhost:9090/api/v1/status/config
```

## Production Deployment

**For complete homework implementation and production setup on Heroku:**

👉 **See [`PROMETHEUS_HOMEWORK_SOLUTION.md`](PROMETHEUS_HOMEWORK_SOLUTION.md)**

This includes:
- Recording rules implementation
- Grafana Cloud setup for production
- Complete metrics documentation
- PromQL query examples
- Filipino context implementation
- Traffic simulation scenarios

## Files to Delete for Cleanup

To reduce confusion, you can safely delete these redundant files:
- `docs/PROMETHEUS_HOMEWORK_IMPLEMENTATION_PLAN.md`
- `docs/PROMETHEUS_HOMEWORK_COMPLETE_SOLUTION.md`
- `docs/PROMETHEUS_PRODUCTION_ARCHITECTURE.md`

**Keep only:**
- `docs/PROMETHEUS_MONITORING.md` (this file - general guide)
- `docs/PROMETHEUS_HOMEWORK_SOLUTION.md` (homework implementation)
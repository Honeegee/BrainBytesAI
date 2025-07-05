# Metrics Catalog

## Overview

This document provides a comprehensive catalog of all custom metrics collected by the BrainBytes AI monitoring system. Metrics are categorized by domain and include detailed descriptions, types, labels, and example queries.

## Metric Categories

- **System Metrics**: Infrastructure and host-level metrics
- **Application Metrics**: HTTP requests, responses, and application performance
- **AI Service Metrics**: AI-specific performance and usage metrics
- **Business Metrics**: User engagement and session analytics
- **Filipino Context Metrics**: Mobile performance and connectivity metrics
- **Container Metrics**: Docker container resource usage

---

## System Metrics

### CPU Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `node_cpu_seconds_total` | Counter | Total CPU time spent in different modes | `cpu`, `mode`, `instance` | `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)` |

**Normal Values**: 0-70% (good), 70-85% (warning), >85% (critical)
**Interpretation**: High values indicate CPU pressure, potential need for scaling

### Memory Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `node_memory_MemTotal_bytes` | Gauge | Total system memory | `instance` | `node_memory_MemTotal_bytes` |
| `node_memory_MemAvailable_bytes` | Gauge | Available system memory | `instance` | `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100` |

**Normal Values**: <85% usage (good), 85-95% (warning), >95% (critical)
**Interpretation**: High memory usage may lead to swapping and performance degradation

### Disk Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `node_filesystem_size_bytes` | Gauge | Total filesystem size | `device`, `fstype`, `mountpoint`, `instance` | `node_filesystem_size_bytes{mountpoint="/"}` |
| `node_filesystem_avail_bytes` | Gauge | Available filesystem space | `device`, `fstype`, `mountpoint`, `instance` | `(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100` |

**Normal Values**: <80% usage (good), 80-90% (warning), >90% (critical)
**Interpretation**: High disk usage can cause application failures and data loss

### Network Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `node_network_receive_bytes_total` | Counter | Total bytes received | `device`, `instance` | `rate(node_network_receive_bytes_total[5m])` |
| `node_network_transmit_bytes_total` | Counter | Total bytes transmitted | `device`, `instance` | `rate(node_network_transmit_bytes_total[5m])` |

**Normal Values**: Varies by application load
**Interpretation**: Sudden spikes may indicate DDoS attacks or traffic surges

---

## Application Metrics

### HTTP Request Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_http_requests_total` | Counter | Total HTTP requests | `method`, `route`, `status_code`, `instance` | `sum(rate(brainbytes_http_requests_total[5m])) by (route)` |
| `brainbytes_http_request_duration_seconds` | Histogram | HTTP request duration | `method`, `route`, `instance` | `histogram_quantile(0.95, rate(brainbytes_http_request_duration_seconds_bucket[5m]))` |

**Normal Values**: 
- Request rate: Varies by traffic
- Duration: <1s (good), 1-2s (acceptable), >2s (slow)
**Interpretation**: High duration indicates performance issues, high error rates indicate service problems

### Database Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_db_connections_active` | Gauge | Active database connections | `instance` | `brainbytes_db_connections_active` |
| `brainbytes_db_query_duration_seconds` | Histogram | Database query duration | `query_type`, `instance` | `histogram_quantile(0.95, rate(brainbytes_db_query_duration_seconds_bucket[5m]))` |

**Normal Values**: 
- Connections: >0 (healthy), 0 (critical)
- Query duration: <100ms (good), 100ms-1s (acceptable), >1s (slow)
**Interpretation**: Zero connections indicate database connectivity issues

### Authentication Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_auth_attempts_total` | Counter | Total authentication attempts | `status`, `method`, `instance` | `sum(rate(brainbytes_auth_attempts_total[5m])) by (status)` |
| `brainbytes_auth_sessions_active` | Gauge | Active user sessions | `instance` | `brainbytes_auth_sessions_active` |

**Normal Values**: 
- Success rate: >95% (good), 90-95% (warning), <90% (critical)
- Active sessions: Varies by user activity
**Interpretation**: Low success rates may indicate brute force attacks or system issues

---

## AI Service Metrics

### AI Request Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_ai_requests_total` | Counter | Total AI service requests | `status`, `model`, `instance` | `sum(rate(brainbytes_ai_requests_total[5m])) by (status)` |
| `brainbytes_ai_request_duration_seconds` | Histogram | AI request processing time | `model`, `instance` | `histogram_quantile(0.95, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))` |
| `brainbytes_ai_errors_total` | Counter | Total AI service errors | `error_type`, `model`, `instance` | `sum(rate(brainbytes_ai_errors_total[5m])) by (error_type)` |

**Normal Values**: 
- Success rate: >90% (good), 80-90% (warning), <80% (critical)
- Duration: <3s (good), 3-8s (acceptable), >8s (slow)
**Interpretation**: High error rates indicate AI provider issues or configuration problems

### AI Usage Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_ai_tokens_used_total` | Counter | Total AI tokens consumed | `model`, `instance` | `sum(rate(brainbytes_ai_tokens_used_total[1h]))` |
| `brainbytes_ai_cost_total` | Counter | Total AI service cost | `model`, `currency`, `instance` | `sum(rate(brainbytes_ai_cost_total[1h])) by (currency)` |

**Normal Values**: 
- Token usage: <1000/hour (normal), 1000-5000/hour (high), >5000/hour (very high)
- Cost: Monitor against budget thresholds
**Interpretation**: Sudden spikes may indicate inefficient prompts or unexpected usage

---

## Business Metrics

### User Engagement Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_tutoring_sessions_total` | Counter | Total tutoring sessions started | `subject`, `instance` | `sum(rate(brainbytes_tutoring_sessions_total[1h])) by (subject)` |
| `brainbytes_questions_total` | Counter | Total questions asked | `subject`, `difficulty`, `instance` | `sum(rate(brainbytes_questions_total[1h])) by (subject)` |
| `brainbytes_session_duration_seconds` | Histogram | User session duration | `subject`, `instance` | `histogram_quantile(0.50, rate(brainbytes_session_duration_seconds_bucket[1h]))` |

**Normal Values**: 
- Sessions: 5-30/hour (normal activity)
- Questions per session: >2 (engaged), 1-2 (moderate), <1 (low engagement)
- Session duration: 5-30 minutes (typical)
**Interpretation**: Low engagement may indicate UX issues or content problems

### User Activity Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_active_sessions` | Gauge | Currently active user sessions | `instance` | `brainbytes_active_sessions` |
| `brainbytes_user_registrations_total` | Counter | Total user registrations | `source`, `instance` | `sum(rate(brainbytes_user_registrations_total[24h]))` |

**Normal Values**: 
- Active sessions: >0 during business hours
- Registrations: Varies by marketing activity
**Interpretation**: Zero active sessions during peak hours indicates service issues

---

## Filipino Context Metrics

### Mobile Performance Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_mobile_requests_total` | Counter | Total mobile requests | `platform`, `status_code`, `instance` | `sum(rate(brainbytes_mobile_requests_total[5m])) by (platform)` |
| `brainbytes_response_size_bytes` | Histogram | HTTP response size | `platform`, `route`, `instance` | `histogram_quantile(0.95, rate(brainbytes_response_size_bytes_bucket{platform=~"android|ios"}[10m]))` |

**Normal Values**: 
- Mobile error rate: <8% (good), 8-15% (warning), >15% (critical)
- Response size: <150KB (good), 150-300KB (acceptable), >300KB (large)
**Interpretation**: High mobile error rates may indicate connectivity issues in Philippines

### Connectivity Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `brainbytes_connection_drops_total` | Counter | Total connection drops | `reason`, `instance` | `sum(rate(brainbytes_connection_drops_total[5m]))` |
| `brainbytes_request_timeouts_total` | Counter | Total request timeouts | `route`, `instance` | `sum(rate(brainbytes_request_timeouts_total[5m])) by (route)` |

**Normal Values**: 
- Connection drops: <0.5/second (good), 0.5-2/second (warning), >2/second (critical)
- Timeouts: <1% of requests (good), 1-5% (warning), >5% (critical)
**Interpretation**: High rates indicate network instability common in some Philippine areas

---

## Container Metrics

### Container Resource Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `container_memory_usage_bytes` | Gauge | Container memory usage | `name`, `instance` | `container_memory_usage_bytes{name=~"brainbytes.*"}` |
| `container_cpu_usage_seconds_total` | Counter | Container CPU usage | `name`, `instance` | `rate(container_cpu_usage_seconds_total{name=~"brainbytes.*"}[5m])` |
| `container_spec_memory_limit_bytes` | Gauge | Container memory limit | `name`, `instance` | `container_spec_memory_limit_bytes{name=~"brainbytes.*"}` |

**Normal Values**: 
- Memory usage: <90% of limit (good), 90-95% (warning), >95% (critical)
- CPU usage: <80% (good), 80-90% (warning), >90% (critical)
**Interpretation**: High resource usage may indicate need for container scaling

### Container Health Metrics

| Metric Name | Type | Description | Labels | Example Query |
|-------------|------|-------------|--------|---------------|
| `container_start_time_seconds` | Gauge | Container start time | `name`, `instance` | `increase(container_start_time_seconds{name=~"brainbytes.*"}[5m])` |
| `up` | Gauge | Service availability | `job`, `instance` | `up{job=~"brainbytes-.*"}` |

**Normal Values**: 
- Up status: 1 (healthy), 0 (down)
- Restart frequency: <1/hour (stable), >1/hour (unstable)
**Interpretation**: Frequent restarts indicate application instability

---

## Recording Rules

### Pre-computed Metrics

| Rule Name | Expression | Description | Update Interval |
|-----------|------------|-------------|-----------------|
| `brainbytes:request_rate_5m` | `rate(brainbytes_http_requests_total[5m])` | 5-minute request rate | 30s |
| `brainbytes:error_rate_5m` | `rate(brainbytes_http_requests_total{status_code=~"5.."}[5m]) / rate(brainbytes_http_requests_total[5m])` | 5-minute error rate | 30s |
| `brainbytes:ai_response_time_p95` | `histogram_quantile(0.95, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))` | 95th percentile AI response time | 30s |
| `brainbytes:ai_success_rate_5m` | `rate(brainbytes_ai_requests_total{status="success"}[5m]) / rate(brainbytes_ai_requests_total[5m])` | AI service success rate | 30s |
| `brainbytes:questions_per_session_1h` | `sum(rate(brainbytes_questions_total[1h])) / sum(rate(brainbytes_tutoring_sessions_total[1h]))` | Questions per session ratio | 60s |
| `brainbytes:mobile_traffic_percentage_5m` | `rate(brainbytes_mobile_requests_total[5m]) / rate(brainbytes_http_requests_total[5m]) * 100` | Mobile traffic percentage | 30s |

---

## Metric Collection Configuration

### Scrape Intervals
- **System metrics**: 15 seconds
- **Application metrics**: 15 seconds
- **Business metrics**: 30 seconds
- **AI service metrics**: 15 seconds

### Retention Policy
- **Raw metrics**: 15 days
- **Recording rules**: Same as raw metrics
- **Aggregated data**: Stored in recording rules for faster queries

### Labels Best Practices
- **Consistent naming**: Use snake_case for label names
- **Cardinality control**: Avoid high-cardinality labels (user IDs, timestamps)
- **Meaningful values**: Use descriptive label values
- **Standard labels**: Include `instance`, `job` for all metrics

---

## Troubleshooting Metrics

### Common Issues

1. **Missing Metrics**
   - Check service health: `up{job="service-name"}`
   - Verify scrape success: `up == 0`
   - Check Prometheus targets page

2. **High Cardinality**
   - Monitor series count: `prometheus_tsdb_symbol_table_size_bytes`
   - Identify problematic metrics: Use Prometheus admin API
   - Review label usage patterns

3. **Performance Issues**
   - Query duration: `prometheus_rule_evaluation_duration_seconds`
   - Storage usage: `prometheus_tsdb_head_series`
   - Memory usage: `process_resident_memory_bytes`

### Useful Diagnostic Queries

```promql
# Check metric availability
up{job=~"brainbytes-.*"}

# Find high cardinality metrics
topk(10, count by (__name__)({__name__=~".+"}))

# Check scrape success rate
avg(up) by (job)

# Monitor Prometheus performance
rate(prometheus_tsdb_head_samples_appended_total[5m])
```

---

*Last Updated: January 2025*
*Version: 1.0*
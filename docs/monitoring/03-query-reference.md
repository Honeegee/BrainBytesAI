# Query Reference Guide

## Overview

This document provides a comprehensive collection of PromQL queries for monitoring, troubleshooting, and analyzing the BrainBytes AI system. Queries are organized by category with explanations and interpretation guidelines.

## Table of Contents

- [System Performance Queries](#system-performance-queries)
- [Application Performance Queries](#application-performance-queries)
- [AI Service Queries](#ai-service-queries)
- [Business Intelligence Queries](#business-intelligence-queries)
- [Error Analysis Queries](#error-analysis-queries)
- [Filipino Context Queries](#filipino-context-queries)
- [Alerting Queries](#alerting-queries)
- [Capacity Planning Queries](#capacity-planning-queries)
- [Troubleshooting Queries](#troubleshooting-queries)

---

## System Performance Queries

### 1. CPU Usage Analysis

**Query**: Current CPU usage percentage by instance
```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```
**Interpretation**: Shows current CPU utilization. Values >80% indicate high load.

**Query**: CPU usage trend over time
```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1h])) * 100)
```
**Interpretation**: Hourly CPU trend for capacity planning.

### 2. Memory Usage Analysis

**Query**: Memory usage percentage
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```
**Interpretation**: Current memory utilization. Values >85% require attention.

**Query**: Available memory in GB
```promql
node_memory_MemAvailable_bytes / 1024 / 1024 / 1024
```
**Interpretation**: Absolute available memory for capacity planning.

### 3. Disk Usage Analysis

**Query**: Disk usage percentage by mount point
```promql
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100
```
**Interpretation**: Disk utilization by filesystem. Values >90% are critical.

**Query**: Disk I/O rate
```promql
rate(node_disk_io_time_seconds_total[5m])
```
**Interpretation**: Disk I/O utilization. High values indicate disk bottlenecks.

### 4. Network Performance

**Query**: Network throughput (bytes/second)
```promql
rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])
```
**Interpretation**: Total network throughput. Useful for capacity planning.

---

## Application Performance Queries

### 5. HTTP Request Rate Analysis

**Query**: Overall request rate (requests/second)
```promql
sum(rate(brainbytes_http_requests_total[5m]))
```
**Interpretation**: Total application load. Baseline for performance analysis.

**Query**: Request rate by endpoint
```promql
sum(rate(brainbytes_http_requests_total[5m])) by (route)
```
**Interpretation**: Identifies most used endpoints for optimization.

### 6. Response Time Analysis

**Query**: 95th percentile response time
```promql
histogram_quantile(0.95, rate(brainbytes_http_request_duration_seconds_bucket[5m]))
```
**Interpretation**: 95% of requests complete within this time. Target: <2 seconds.

**Query**: Average response time by endpoint
```promql
rate(brainbytes_http_request_duration_seconds_sum[5m]) / rate(brainbytes_http_request_duration_seconds_count[5m])
```
**Interpretation**: Mean response time. Compare with percentiles for distribution analysis.

### 7. Error Rate Analysis

**Query**: Overall error rate percentage
```promql
(sum(rate(brainbytes_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100
```
**Interpretation**: Percentage of requests resulting in server errors. Target: <1%.

**Query**: Error rate by endpoint
```promql
(sum(rate(brainbytes_http_requests_total{status_code=~"5.."}[5m])) by (route) / sum(rate(brainbytes_http_requests_total[5m])) by (route)) * 100
```
**Interpretation**: Identifies problematic endpoints requiring attention.

---

## AI Service Queries

### 8. AI Performance Metrics

**Query**: AI service success rate
```promql
(sum(rate(brainbytes_ai_requests_total{status="success"}[5m])) / sum(rate(brainbytes_ai_requests_total[5m]))) * 100
```
**Interpretation**: Percentage of successful AI requests. Target: >90%.

**Query**: AI response time 95th percentile
```promql
histogram_quantile(0.95, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))
```
**Interpretation**: 95% of AI requests complete within this time. Target: <3 seconds.

### 9. AI Usage and Cost Analysis

**Query**: Token usage rate (tokens/hour)
```promql
sum(rate(brainbytes_ai_tokens_used_total[1h])) * 3600
```
**Interpretation**: Hourly token consumption for cost monitoring.

**Query**: AI cost per hour
```promql
sum(rate(brainbytes_ai_cost_total[1h])) * 3600
```
**Interpretation**: Hourly AI service costs for budget tracking.

### 10. AI Error Analysis

**Query**: AI error rate by type
```promql
sum(rate(brainbytes_ai_errors_total[5m])) by (error_type)
```
**Interpretation**: Categorizes AI errors for targeted troubleshooting.

---

## Business Intelligence Queries

### 11. User Engagement Metrics

**Query**: Questions per session ratio
```promql
sum(rate(brainbytes_questions_total[1h])) / sum(rate(brainbytes_tutoring_sessions_total[1h]))
```
**Interpretation**: Average questions per session. Target: >2 for good engagement.

**Query**: Session duration median
```promql
histogram_quantile(0.50, rate(brainbytes_session_duration_seconds_bucket[1h]))
```
**Interpretation**: Typical session length. Useful for engagement analysis.

### 12. User Activity Analysis

**Query**: Active sessions count
```promql
brainbytes_active_sessions
```
**Interpretation**: Current concurrent users. Monitor for capacity planning.

**Query**: New user registration rate
```promql
sum(rate(brainbytes_user_registrations_total[24h])) * 86400
```
**Interpretation**: Daily registration rate for growth tracking.

### 13. Subject Popularity

**Query**: Questions by subject
```promql
sum(rate(brainbytes_questions_total[1h])) by (subject)
```
**Interpretation**: Most popular subjects for content planning.

---

## Error Analysis Queries

### 14. Error Distribution

**Query**: Errors by status code
```promql
sum(rate(brainbytes_http_requests_total{status_code=~"[45].."}[5m])) by (status_code)
```
**Interpretation**: Distribution of client and server errors.

**Query**: Top error-prone endpoints
```promql
topk(5, sum(rate(brainbytes_http_requests_total{status_code=~"5.."}[5m])) by (route))
```
**Interpretation**: Endpoints with highest error counts requiring attention.

### 15. Error Trends

**Query**: Error rate trend (1-hour window)
```promql
(sum(rate(brainbytes_http_requests_total{status_code=~"5.."}[1h])) / sum(rate(brainbytes_http_requests_total[1h]))) * 100
```
**Interpretation**: Hourly error rate trend for pattern analysis.

---

## Filipino Context Queries

### 16. Mobile Performance

**Query**: Mobile vs desktop traffic ratio
```promql
(sum(rate(brainbytes_mobile_requests_total[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100
```
**Interpretation**: Percentage of mobile traffic. Important for Filipino users.

**Query**: Mobile error rate
```promql
(sum(rate(brainbytes_mobile_requests_total{status_code=~"5.."}[5m])) / sum(rate(brainbytes_mobile_requests_total[5m]))) * 100
```
**Interpretation**: Mobile-specific error rate. Target: <8% for good mobile experience.

### 17. Data Usage Optimization

**Query**: Average response size for mobile
```promql
rate(brainbytes_response_size_bytes_sum{platform=~"android|ios"}[10m]) / rate(brainbytes_response_size_bytes_count{platform=~"android|ios"}[10m])
```
**Interpretation**: Average mobile response size. Target: <150KB for data efficiency.

### 18. Connectivity Analysis

**Query**: Connection drop rate
```promql
sum(rate(brainbytes_connection_drops_total[5m]))
```
**Interpretation**: Connection stability. High rates indicate network issues.

**Query**: Request timeout rate
```promql
(sum(rate(brainbytes_request_timeouts_total[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100
```
**Interpretation**: Percentage of requests timing out. Target: <1%.

---

## Alerting Queries

### 19. System Health Alerts

**Query**: High CPU usage detection
```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
```
**Interpretation**: Triggers when CPU usage exceeds 80% for alerting.

**Query**: Low disk space detection
```promql
(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100 > 90
```
**Interpretation**: Triggers when disk usage exceeds 90%.

### 20. Application Health Alerts

**Query**: Service availability check
```promql
up{job=~"brainbytes-.*"} == 0
```
**Interpretation**: Detects when services are down.

**Query**: High error rate detection
```promql
(sum(rate(brainbytes_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100 > 5
```
**Interpretation**: Triggers when error rate exceeds 5%.

---

## Capacity Planning Queries

### 21. Resource Utilization Trends

**Query**: CPU utilization trend (24 hours)
```promql
avg_over_time((100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100))[24h:1h])
```
**Interpretation**: Daily CPU usage pattern for capacity planning.

**Query**: Memory growth rate
```promql
deriv(node_memory_MemAvailable_bytes[1h])
```
**Interpretation**: Rate of memory consumption change.

### 22. Traffic Growth Analysis

**Query**: Request rate growth (week-over-week)
```promql
(sum(rate(brainbytes_http_requests_total[1h])) - sum(rate(brainbytes_http_requests_total[1h] offset 1w))) / sum(rate(brainbytes_http_requests_total[1h] offset 1w)) * 100
```
**Interpretation**: Weekly traffic growth percentage.

---

## Troubleshooting Queries

### 23. Service Health Diagnostics

**Query**: Service uptime percentage
```promql
avg_over_time(up{job=~"brainbytes-.*"}[24h]) * 100
```
**Interpretation**: 24-hour availability percentage by service.

**Query**: Container restart frequency
```promql
increase(container_start_time_seconds{name=~"brainbytes.*"}[1h])
```
**Interpretation**: Number of container restarts in the last hour.

### 24. Performance Bottleneck Identification

**Query**: Slowest endpoints (95th percentile)
```promql
topk(5, histogram_quantile(0.95, rate(brainbytes_http_request_duration_seconds_bucket[5m])) by (route))
```
**Interpretation**: Identifies endpoints with highest response times.

**Query**: Database query performance
```promql
histogram_quantile(0.95, rate(brainbytes_db_query_duration_seconds_bucket[5m]))
```
**Interpretation**: Database query performance analysis.

### 25. Resource Contention Analysis

**Query**: Memory pressure by container
```promql
(container_memory_usage_bytes{name=~"brainbytes.*"} / container_spec_memory_limit_bytes{name=~"brainbytes.*"}) * 100
```
**Interpretation**: Container memory utilization percentage.

**Query**: CPU throttling detection
```promql
rate(container_cpu_cfs_throttled_seconds_total{name=~"brainbytes.*"}[5m])
```
**Interpretation**: CPU throttling events indicating resource constraints.

---

## Advanced Query Patterns

### 26. Correlation Analysis

**Query**: Error rate vs response time correlation
```promql
(
  (sum(rate(brainbytes_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100
) and on()
(
  histogram_quantile(0.95, rate(brainbytes_http_request_duration_seconds_bucket[5m]))
)
```
**Interpretation**: Correlates error rates with response times.

### 27. Anomaly Detection

**Query**: Traffic anomaly detection
```promql
abs(sum(rate(brainbytes_http_requests_total[5m])) - avg_over_time(sum(rate(brainbytes_http_requests_total[5m]))[1h:5m])) > (stddev_over_time(sum(rate(brainbytes_http_requests_total[5m]))[1h:5m]) * 2)
```
**Interpretation**: Detects traffic patterns outside 2 standard deviations.

### 28. Predictive Queries

**Query**: Disk space exhaustion prediction
```promql
predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[1h], 24*3600) < 0
```
**Interpretation**: Predicts if disk will be full within 24 hours.

---

## Query Optimization Tips

### Performance Best Practices

1. **Use Recording Rules**: Pre-compute frequently used queries
2. **Limit Time Ranges**: Use appropriate time windows for queries
3. **Reduce Cardinality**: Avoid high-cardinality labels in aggregations
4. **Use Rate Functions**: Always use `rate()` for counter metrics
5. **Optimize Regex**: Use specific patterns instead of broad regex

### Common Query Patterns

```promql
# Rate calculation for counters
rate(metric_name_total[5m])

# Percentage calculation
(numerator / denominator) * 100

# Percentile calculation
histogram_quantile(0.95, rate(metric_name_bucket[5m]))

# Top N results
topk(5, metric_name)

# Aggregation by label
sum(metric_name) by (label_name)
```

---

## Grafana Integration

### Dashboard Variables

Use these queries as Grafana dashboard variables:

```promql
# Instance selector
label_values(up, instance)

# Service selector
label_values(up{job=~"brainbytes-.*"}, job)

# Route selector
label_values(brainbytes_http_requests_total, route)
```

### Alert Rule Integration

These queries can be directly used in Grafana alert rules with appropriate thresholds and evaluation periods.

---

*Last Updated: January 2025*
*Version: 1.0*
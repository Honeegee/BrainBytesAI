# Grafana Quick Reference Card

## Essential URLs
- **Main Dashboard**: `http://localhost:3000`
- **Explore Data**: `http://localhost:3000/explore`
- **Manage Alerts**: `http://localhost:3000/alerting`
- **Configuration**: `http://localhost:3000/admin`

## Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save dashboard |
| `Ctrl + H` | Toggle help |
| `Ctrl + K` | Search dashboards |
| `Esc` | Exit full screen |
| `d + k` | Toggle kiosk mode |
| `t + z` | Zoom out time range |
| `t + ←` | Move time range back |
| `t + →` | Move time range forward |

## Common PromQL Queries

### System Metrics
```promql
# CPU Usage (%)
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage (%)
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Disk Usage (%)
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100

# Network I/O
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])
```

### Application Metrics
```promql
# Request Rate
rate(http_requests_total[5m])

# Error Rate (%)
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Response Time (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Active Connections
http_connections_active
```

### Aggregation Functions
```promql
# Sum across all instances
sum(metric_name)

# Average across instances
avg(metric_name)

# Maximum value
max(metric_name)

# Top 5 values
topk(5, metric_name)

# Group by label
sum(metric_name) by (label_name)
```

## Time Range Shortcuts
| Range | Syntax |
|-------|--------|
| Last 5 minutes | `now-5m` |
| Last 15 minutes | `now-15m` |
| Last 1 hour | `now-1h` |
| Last 6 hours | `now-6h` |
| Last 24 hours | `now-24h` |
| Last 7 days | `now-7d` |
| Last 30 days | `now-30d` |
| This hour | `now/h` |
| Today | `now/d` |
| This week | `now/w` |
| This month | `now/M` |

## Panel Types Quick Guide
| Type | Best For |
|------|----------|
| **Time Series** | Trends over time, line graphs |
| **Stat** | Single values, KPIs |
| **Gauge** | Progress indicators, percentages |
| **Bar Chart** | Comparing categories |
| **Table** | Detailed data, logs |
| **Heatmap** | Distribution patterns |
| **Pie Chart** | Proportions, breakdowns |

## Alert Thresholds (Recommended)
| Metric | Warning | Critical |
|--------|---------|----------|
| CPU Usage | 70% | 85% |
| Memory Usage | 80% | 90% |
| Disk Usage | 80% | 90% |
| Error Rate | 2% | 5% |
| Response Time | 500ms | 1000ms |

## Dashboard Navigation
| Action | How To |
|--------|--------|
| **Zoom In** | Click and drag on graph |
| **Zoom Out** | Double-click on graph |
| **Full Screen** | Click panel title → View |
| **Edit Panel** | Click panel title → Edit |
| **Duplicate Panel** | Click panel title → More → Duplicate |
| **Share Panel** | Click panel title → Share |

## Common Issues & Quick Fixes

### No Data Showing
1. Check time range (top-right)
2. Verify data source connection
3. Test query in Explore tab
4. Check Prometheus targets

### Slow Loading
1. Reduce time range
2. Optimize queries
3. Limit data points
4. Use recording rules

### Alert Not Firing
1. Test query returns data
2. Check evaluation frequency
3. Verify notification channels
4. Review alert history

## BrainBytesAI Specific

### Pre-built Dashboards
- **System Overview**: Overall system health
- **Application Performance**: App-specific metrics
- **Error Analysis**: Error tracking and debugging
- **Resource Optimization**: Resource usage insights
- **User Experience**: User-facing performance

### Data Source
- **Name**: Prometheus
- **URL**: `http://prometheus:9090`
- **Type**: Prometheus

### Dashboard Folder
- **Name**: BrainBytes
- **Location**: Dashboards → Browse → BrainBytes

## Emergency Procedures

### System Down
1. Check System Overview dashboard
2. Look for red panels/alerts
3. Check error rates and logs
4. Verify service status

### Performance Issues
1. Open Application Performance dashboard
2. Check response times and throughput
3. Correlate with resource usage
4. Identify bottlenecks

### High Error Rates
1. Go to Error Analysis dashboard
2. Identify error patterns
3. Check recent deployments
4. Review application logs

## Useful Variables for Dashboards
```
# Instance selector
$instance = query_result(up)

# Time range for rate calculations
$rate_interval = 5m

# Service selector
$service = label_values(service)

# Environment selector
$environment = label_values(environment)
```

## API Endpoints (for automation)
```bash
# Get dashboard
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:3000/api/dashboards/uid/$DASHBOARD_UID

# Create dashboard
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d @dashboard.json \
  http://localhost:3000/api/dashboards/db

# Get alerts
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:3000/api/alerts
```

---
**Keep this reference handy while working with Grafana!**
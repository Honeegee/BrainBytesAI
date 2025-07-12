# Grafana Manual Usage Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Accessing Grafana](#accessing-grafana)
3. [Understanding the Interface](#understanding-the-interface)
4. [Working with Dashboards](#working-with-dashboards)
5. [Creating Custom Dashboards](#creating-custom-dashboards)
6. [Working with Panels](#working-with-panels)
7. [Data Sources and Queries](#data-sources-and-queries)
8. [Alerting](#alerting)
9. [User Management](#user-management)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites
- Grafana server running (typically on port 3000)
- Prometheus data source configured
- Basic understanding of metrics and monitoring concepts

### Current Setup Overview
Your BrainBytesAI project includes:
- **Data Source**: Prometheus (configured at `http://prometheus:9090`)
- **Pre-built Dashboards**: 
  - System Overview
  - Application Performance
  - Error Analysis
  - Resource Optimization
  - User Experience
- **Dashboard Folder**: BrainBytes

## Accessing Grafana

### Default Access
1. Open your web browser
2. Navigate to: `http://localhost:3000` (or your configured Grafana URL)
3. Default credentials (if not changed):
   - Username: `admin`
   - Password: `admin`
4. You'll be prompted to change the password on first login

### Docker Environment Access
If running via Docker Compose:
```bash
# Check if Grafana container is running
docker ps | grep grafana

# Access logs if needed
docker logs <grafana-container-name>
```

## Understanding the Interface

### Main Navigation
- **Home Dashboard**: Landing page with overview
- **Dashboards**: Browse and manage dashboards
- **Explore**: Ad-hoc data exploration
- **Alerting**: Manage alerts and notifications
- **Configuration**: Data sources, users, plugins
- **Server Admin**: System administration (admin only)

### Dashboard Elements
- **Time Range Picker**: Top-right corner, controls data time window
- **Refresh Button**: Manual refresh and auto-refresh settings
- **Dashboard Settings**: Gear icon for dashboard configuration
- **Share Dashboard**: Share icon for exporting/sharing
- **Add Panel**: Plus icon to add new visualizations

## Working with Dashboards

### Viewing Pre-built Dashboards

#### 1. System Overview Dashboard
**Purpose**: High-level system health and performance metrics
**Key Panels**:
- CPU Usage
- Memory Utilization
- Disk I/O
- Network Traffic
- System Load

**How to Use**:
1. Navigate to Dashboards → Browse
2. Select "BrainBytes" folder
3. Click "System Overview"
4. Adjust time range (last 1h, 6h, 24h, etc.)
5. Use auto-refresh for real-time monitoring

#### 2. Application Performance Dashboard
**Purpose**: Application-specific metrics and performance indicators
**Key Panels**:
- Request Rate
- Response Time
- Error Rate
- Database Performance
- API Endpoint Performance

**How to Use**:
1. Monitor during peak usage times
2. Compare performance across different time periods
3. Identify performance bottlenecks
4. Correlate with system resource usage

#### 3. Error Analysis Dashboard
**Purpose**: Error tracking and debugging assistance
**Key Panels**:
- Error Rate by Service
- Error Types Distribution
- Error Logs Timeline
- Failed Requests by Endpoint

**How to Use**:
1. Check during incident response
2. Set up alerts for error thresholds
3. Drill down into specific error types
4. Correlate errors with deployments

#### 4. Resource Optimization Dashboard
**Purpose**: Resource usage optimization insights
**Key Panels**:
- Resource Utilization Trends
- Cost Analysis
- Capacity Planning
- Efficiency Metrics

#### 5. User Experience Dashboard
**Purpose**: User-facing performance metrics
**Key Panels**:
- Page Load Times
- User Session Duration
- Feature Usage
- Geographic Distribution

### Dashboard Navigation Tips
- **Zoom In**: Click and drag on any graph to zoom into a time range
- **Zoom Out**: Double-click on a graph to zoom out
- **Panel Menu**: Click panel title for options (View, Edit, Share, etc.)
- **Full Screen**: Click panel title → View → Full screen
- **Refresh**: Use Ctrl+R or the refresh button

## Creating Custom Dashboards

### Step-by-Step Dashboard Creation

#### 1. Create New Dashboard
1. Click "+" in left sidebar
2. Select "Dashboard"
3. Click "Add new panel"

#### 2. Configure Basic Settings
1. **Dashboard Name**: Click "New Dashboard" at top
2. **Settings** (gear icon):
   - General: Set name, description, tags
   - Time options: Default time range, refresh intervals
   - Variables: Create dashboard variables for dynamic filtering

#### 3. Save Dashboard
1. Click "Save dashboard" (disk icon)
2. Choose folder (recommend "BrainBytes")
3. Add description and tags
4. Click "Save"

### Dashboard Best Practices
- **Logical Grouping**: Group related metrics together
- **Consistent Time Ranges**: Use same time range across related panels
- **Meaningful Names**: Use descriptive panel and dashboard names
- **Documentation**: Add descriptions to panels and dashboards
- **Color Coding**: Use consistent colors for similar metrics

## Working with Panels

### Panel Types
1. **Time Series**: Line graphs, area charts
2. **Stat**: Single value displays
3. **Gauge**: Progress indicators
4. **Bar Chart**: Categorical comparisons
5. **Table**: Tabular data display
6. **Heatmap**: Density visualizations
7. **Logs**: Log data display

### Creating a Panel

#### 1. Add Panel
1. Click "Add panel" in dashboard
2. Select panel type
3. Configure query and visualization

#### 2. Query Configuration
```promql
# Example Prometheus queries for your setup

# CPU Usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# HTTP Request Rate
rate(http_requests_total[5m])

# Error Rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100
```

#### 3. Visualization Options
- **Display**: Title, description, transparent background
- **Graph**: Line width, fill opacity, point size
- **Axes**: Labels, units, min/max values
- **Legend**: Position, values to show
- **Thresholds**: Warning and critical levels

#### 4. Panel Settings
- **General**: Title, description, repeat options
- **Links**: Add links to other dashboards or external resources
- **Transformations**: Data processing and formatting

### Common Panel Configurations

#### CPU Usage Panel
```yaml
Query: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
Unit: Percent (0-100)
Thresholds: 
  - Green: 0-70
  - Yellow: 70-85
  - Red: 85-100
```

#### Memory Usage Panel
```yaml
Query: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
Unit: Percent (0-100)
Min: 0
Max: 100
```

#### Request Rate Panel
```yaml
Query: rate(http_requests_total[5m])
Unit: Requests per second
Legend: {{method}} {{status}}
```

## Data Sources and Queries

### Prometheus Query Language (PromQL)

#### Basic Query Structure
```promql
# Instant vector - current value
metric_name

# Range vector - values over time
metric_name[5m]

# Rate calculation
rate(metric_name[5m])

# Aggregation
sum(metric_name) by (label)
```

#### Common Query Patterns
```promql
# Average CPU usage across all instances
avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) * 100

# Memory usage percentage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# HTTP error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# Top 5 endpoints by request count
topk(5, sum(rate(http_requests_total[5m])) by (endpoint))

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### Query Functions
- `rate()`: Calculate per-second rate
- `increase()`: Calculate increase over time range
- `sum()`: Sum values
- `avg()`: Average values
- `max()`: Maximum value
- `min()`: Minimum value
- `topk()`: Top K values
- `bottomk()`: Bottom K values

### Data Source Management
1. **Configuration**: Settings → Data Sources
2. **Testing**: Use "Save & Test" to verify connectivity
3. **Query Browser**: Use Explore tab for ad-hoc queries

## Alerting

### Setting Up Alerts

#### 1. Create Alert Rule
1. Go to Alerting → Alert Rules
2. Click "New rule"
3. Configure query and conditions
4. Set evaluation frequency

#### 2. Alert Configuration
```yaml
# Example: High CPU Alert
Query: avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) * 100
Condition: IS ABOVE 80
Evaluation: Every 1m for 5m
```

#### 3. Notification Channels
1. Alerting → Notification channels
2. Add channel (email, Slack, webhook, etc.)
3. Test notification

#### 4. Alert Rules Best Practices
- **Meaningful Names**: Clear alert rule names
- **Appropriate Thresholds**: Based on historical data
- **Evaluation Frequency**: Balance between responsiveness and noise
- **Recovery Notifications**: Enable "Send on OK"

### Common Alert Rules
```promql
# High CPU Usage
avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) * 100 > 80

# High Memory Usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85

# High Error Rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 5

# Service Down
up == 0

# Disk Space Low
(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
```

## User Management

### User Roles
- **Admin**: Full system access
- **Editor**: Create and edit dashboards
- **Viewer**: View-only access

### Managing Users
1. **Add User**: Configuration → Users → Invite
2. **Assign Roles**: Edit user → Change role
3. **Organizations**: Manage multi-tenant access

### Team Management
1. **Create Teams**: Configuration → Teams
2. **Assign Permissions**: Dashboard and folder permissions
3. **Team Sync**: LDAP/OAuth integration

## Troubleshooting

### Common Issues

#### 1. No Data Showing
**Symptoms**: Empty graphs, "No data" messages
**Solutions**:
- Check data source connectivity
- Verify Prometheus is collecting metrics
- Check time range selection
- Validate PromQL queries in Explore tab

#### 2. Slow Dashboard Loading
**Symptoms**: Long loading times, timeouts
**Solutions**:
- Optimize queries (reduce time ranges, use recording rules)
- Limit number of series returned
- Use appropriate refresh intervals
- Check Prometheus performance

#### 3. Alert Not Firing
**Symptoms**: Expected alerts not triggering
**Solutions**:
- Verify alert rule query returns data
- Check evaluation frequency and duration
- Validate notification channel configuration
- Review alert rule history

#### 4. Permission Issues
**Symptoms**: Cannot edit dashboards, access denied
**Solutions**:
- Check user role and permissions
- Verify organization membership
- Review folder permissions

### Debugging Steps
1. **Check Logs**: 
   ```bash
   # Docker logs
   docker logs grafana-container-name
   
   # System logs
   journalctl -u grafana-server
   ```

2. **Test Queries**: Use Explore tab to test PromQL queries

3. **Verify Data Source**: Settings → Data Sources → Test connection

4. **Check Network**: Ensure Grafana can reach Prometheus

### Performance Optimization
- **Query Optimization**: Use efficient PromQL queries
- **Dashboard Optimization**: Limit panels per dashboard
- **Caching**: Configure appropriate cache settings
- **Resource Allocation**: Ensure adequate CPU/memory

## Advanced Features

### Variables and Templating
Create dynamic dashboards with variables:
1. Dashboard Settings → Variables
2. Add variable (Query, Custom, etc.)
3. Use in queries: `$variable_name`

### Annotations
Add context to graphs:
1. Dashboard Settings → Annotations
2. Configure annotation queries
3. Display deployment markers, incidents, etc.

### Playlist
Create rotating dashboard displays:
1. Dashboards → Playlists
2. Add dashboards to playlist
3. Configure rotation interval

### Snapshots
Share dashboard snapshots:
1. Share dashboard → Snapshot
2. Configure expiration and external sharing
3. Generate shareable link

## Integration Tips

### With Your BrainBytesAI Project
1. **Custom Metrics**: Add application-specific metrics
2. **Business KPIs**: Create dashboards for business metrics
3. **User Analytics**: Track user behavior and engagement
4. **Performance Monitoring**: Monitor API endpoints and database queries

### Automation
- **Provisioning**: Use configuration files for automated setup
- **API**: Use Grafana API for programmatic management
- **Backup**: Regular dashboard and configuration backups

## Best Practices Summary

1. **Organization**: Use folders and tags for dashboard organization
2. **Naming**: Consistent naming conventions
3. **Documentation**: Add descriptions and links
4. **Performance**: Optimize queries and refresh rates
5. **Security**: Proper user management and permissions
6. **Monitoring**: Monitor Grafana itself
7. **Backup**: Regular configuration backups
8. **Updates**: Keep Grafana and plugins updated

## Quick Reference

### Keyboard Shortcuts
- `Ctrl + S`: Save dashboard
- `Ctrl + H`: Toggle help
- `Ctrl + K`: Search dashboards
- `Esc`: Exit full screen
- `d + k`: Toggle kiosk mode

### Useful URLs
- Dashboard: `http://localhost:3000/d/dashboard-uid`
- Explore: `http://localhost:3000/explore`
- Alerting: `http://localhost:3000/alerting`
- Admin: `http://localhost:3000/admin`

### Common Time Ranges
- Last 5 minutes: `now-5m`
- Last hour: `now-1h`
- Last 24 hours: `now-24h`
- Last 7 days: `now-7d`
- This month: `now/M`

This guide provides comprehensive instructions for using Grafana manually with your BrainBytesAI monitoring setup. Refer to specific sections as needed and customize based on your monitoring requirements.
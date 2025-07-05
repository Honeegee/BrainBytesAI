# Configuration Reference

## Overview

This document provides a comprehensive reference for all monitoring configuration files in the BrainBytes AI system. It includes detailed explanations of each configuration file, their purposes, and how they work together.

## Table of Contents

- [Prometheus Configuration](#prometheus-configuration)
- [Alert Rules Configuration](#alert-rules-configuration)
- [Recording Rules Configuration](#recording-rules-configuration)
- [Alertmanager Configuration](#alertmanager-configuration)
- [Grafana Configuration](#grafana-configuration)
- [Docker Compose Configuration](#docker-compose-configuration)
- [Environment Variables](#environment-variables)

---

## Prometheus Configuration

### Main Configuration File

**File**: `monitoring/configs/prometheus/development.yml`

#### Global Settings
```yaml
global:
  scrape_interval: 15s        # How frequently to scrape targets
  evaluation_interval: 15s    # How frequently to evaluate rules
  external_labels:
    environment: 'development' # Environment identifier
    cluster: 'brainbytes-local' # Cluster identifier
```

**Configuration Explanation**:
- **scrape_interval**: Determines how often Prometheus collects metrics from targets
- **evaluation_interval**: How often alert and recording rules are evaluated
- **external_labels**: Added to all metrics and alerts for identification

#### Rule Files Configuration
```yaml
rule_files:
  - "/etc/prometheus/alert-rules.yml"
  - "/etc/prometheus/recording_rules.yml"
  - "/etc/prometheus/advanced-alert-rules.yml"
```

**File Purposes**:
- **alert-rules.yml**: Basic alert rules for system and application monitoring
- **recording_rules.yml**: Pre-computed metrics for performance optimization
- **advanced-alert-rules.yml**: Layered alerts and complex alerting logic

#### Alerting Configuration
```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

**Configuration Details**:
- Defines how Prometheus connects to Alertmanager
- Uses Docker service name resolution
- Port 9093 is the standard Alertmanager port

#### Scrape Configurations

**Application Services**:
```yaml
# Backend API metrics
- job_name: 'brainbytes-backend'
  static_configs:
    - targets: ['backend:3000']
  metrics_path: '/metrics'
  scrape_interval: 15s

# AI Service metrics
- job_name: 'brainbytes-ai-service'
  static_configs:
    - targets: ['ai-service:3002']
  metrics_path: '/metrics'
  scrape_interval: 15s
```

**System Monitoring Services**:
```yaml
# Node Exporter for host metrics
- job_name: 'node-exporter'
  static_configs:
    - targets: ['node-exporter:9100']
  scrape_interval: 15s

# cAdvisor for container metrics
- job_name: 'cadvisor'
  static_configs:
    - targets: ['cadvisor:8080']
  scrape_interval: 15s
```

**Monitoring Stack Self-Monitoring**:
```yaml
# Prometheus self-monitoring
- job_name: 'prometheus'
  static_configs:
    - targets: ['localhost:9090']

# Alertmanager metrics
- job_name: 'alertmanager'
  static_configs:
    - targets: ['alertmanager:9093']
  scrape_interval: 15s
```

### Environment-Specific Configurations

**Production Configuration** (`monitoring/configs/prometheus/production.yml`):
- Longer retention periods
- More conservative scrape intervals
- External storage configuration
- High availability setup

**Staging Configuration** (`monitoring/configs/prometheus/staging.yml`):
- Similar to production but with shorter retention
- Used for pre-production testing
- Separate external labels

---

## Alert Rules Configuration

### Basic Alert Rules

**File**: `monitoring/configs/prometheus/rules/alert-rules.yml`

#### System Health Alerts
```yaml
groups:
- name: brainbytes.rules
  rules:
  - alert: HighCpuUsage
    expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for more than 2 minutes on instance {{ $labels.instance }}"
```

**Alert Components**:
- **alert**: Alert name (must be unique)
- **expr**: PromQL expression that triggers the alert
- **for**: Duration condition must be true before firing
- **labels**: Additional labels added to the alert
- **annotations**: Human-readable information about the alert

#### Application Performance Alerts
```yaml
- alert: HighErrorRate
  expr: (sum(rate(brainbytes_http_requests_total{status=~"5.."}[5m])) / sum(rate(brainbytes_http_requests_total[5m]))) * 100 > 5
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
    description: "Error rate is above 5% for more than 1 minute"
```

#### AI Service Specific Alerts
```yaml
- alert: SlowAiResponse
  expr: rate(brainbytes_ai_request_duration_seconds_sum[5m]) / rate(brainbytes_ai_request_duration_seconds_count[5m]) > 10
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Slow AI response times"
    description: "Average AI response time is above 10 seconds for more than 2 minutes"
```

### Advanced Alert Rules

**File**: `monitoring/configs/prometheus/rules/advanced-alert-rules.yml`

#### Layered Alerting System
```yaml
groups:
- name: brainbytes.advanced.rules
  rules:
  # Warning level alert
  - alert: HighCpuUsageWarning
    expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 70
    for: 5m
    labels:
      severity: warning
      team: infrastructure
      service: system
    annotations:
      summary: "Moderate CPU usage detected"
      description: "CPU usage is above 70% for more than 5 minutes on instance {{ $labels.instance }}"
      runbook_url: "https://wiki.brainbytes.ai/runbooks/high-cpu-usage"

  # Critical level alert
  - alert: HighCpuUsageCritical
    expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
    for: 2m
    labels:
      severity: critical
      team: infrastructure
      service: system
      escalation: "true"
    annotations:
      summary: "Critical CPU usage detected - immediate action required"
      description: "CPU usage is above 85% for more than 2 minutes on instance {{ $labels.instance }}"
      runbook_url: "https://wiki.brainbytes.ai/runbooks/critical-cpu-usage"
```

#### Alert Grouping Rules
```yaml
- name: brainbytes.grouping.rules
  rules:
  - alert: SystemHealthDegraded
    expr: |
      (
        ALERTS{alertname="HighCpuUsageCritical"} or
        ALERTS{alertname="HighMemoryUsage"} or 
        ALERTS{alertname="DiskSpaceLow"}
      ) and on() count(ALERTS{severity="critical"}) >= 2
    for: 1m
    labels:
      severity: critical
      team: infrastructure
      type: grouped_alert
    annotations:
      summary: "Multiple critical system issues detected"
      description: "System experiencing multiple critical issues simultaneously"
```

---

## Recording Rules Configuration

### File Structure

**File**: `monitoring/configs/prometheus/rules/recording_rules.yml`

#### Application Performance Rules
```yaml
groups:
  - name: brainbytes_application_rules
    interval: 30s
    rules:
    - record: brainbytes:request_rate_5m
      expr: rate(brainbytes_http_requests_total[5m])
      labels:
        rule_type: "application_performance"
    
    - record: brainbytes:error_rate_5m
      expr: |
        rate(brainbytes_http_requests_total{status_code=~"5.."}[5m]) / 
        rate(brainbytes_http_requests_total[5m])
      labels:
        rule_type: "application_performance"
```

**Recording Rule Components**:
- **record**: Name of the new metric created
- **expr**: PromQL expression to compute the metric
- **labels**: Additional labels added to the recorded metric
- **interval**: How often the rule is evaluated (optional, defaults to global)

#### AI Service Performance Rules
```yaml
- name: brainbytes_ai_rules
  interval: 30s
  rules:
  - record: brainbytes:ai_response_time_p95
    expr: histogram_quantile(0.95, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))
    labels:
      rule_type: "ai_performance"
  
  - record: brainbytes:ai_success_rate_5m
    expr: |
      rate(brainbytes_ai_requests_total{status="success"}[5m]) / 
      rate(brainbytes_ai_requests_total[5m])
    labels:
      rule_type: "ai_performance"
```

#### Business Intelligence Rules
```yaml
- name: brainbytes_business_rules
  interval: 60s
  rules:
  - record: brainbytes:questions_per_session_1h
    expr: |
      sum(rate(brainbytes_questions_total[1h])) / 
      sum(rate(brainbytes_tutoring_sessions_total[1h]))
    labels:
      rule_type: "business_intelligence"
```

---

## Alertmanager Configuration

### Main Configuration

**File**: `monitoring/configs/alertmanager/development.yml`

#### Global Configuration
```yaml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@brainbytes.ai'
  smtp_auth_username: 'alerts@brainbytes.ai'
  smtp_auth_password: 'password'
```

#### Route Configuration
```yaml
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
    group_wait: 5s
    repeat_interval: 5m
  - match:
      team: infrastructure
    receiver: 'infrastructure-team'
  - match:
      team: product
    receiver: 'product-team'
```

**Route Configuration Explanation**:
- **group_by**: How alerts are grouped together
- **group_wait**: Wait time before sending initial notification
- **group_interval**: Wait time before sending additional alerts in same group
- **repeat_interval**: How often to resend unresolved alerts
- **receiver**: Default notification destination

#### Receivers Configuration
```yaml
receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://127.0.0.1:5001/'

- name: 'critical-alerts'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts-critical'
    title: 'Critical Alert: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  email_configs:
  - to: 'oncall@brainbytes.ai'
    subject: 'CRITICAL: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}

- name: 'infrastructure-team'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#infrastructure-alerts'
    title: 'Infrastructure Alert: {{ .GroupLabels.alertname }}'
```

#### Inhibit Rules
```yaml
inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'instance']
```

**Inhibit Rules Purpose**: Prevent lower severity alerts when higher severity alerts are active for the same issue.

---

## Grafana Configuration

### Datasource Configuration

**File**: `monitoring/grafana/provisioning/datasources/datasources.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      timeInterval: "15s"
      queryTimeout: "60s"
      httpMethod: "POST"
```

**Configuration Options**:
- **access**: How Grafana connects to datasource (proxy vs direct)
- **url**: Prometheus server URL (uses Docker service name)
- **isDefault**: Whether this is the default datasource
- **timeInterval**: Default step size for queries
- **queryTimeout**: Maximum time for query execution

### Dashboard Provisioning

**File**: `monitoring/grafana/provisioning/dashboards/dashboards.yml`

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

**Provisioning Options**:
- **disableDeletion**: Whether dashboards can be deleted from UI
- **updateIntervalSeconds**: How often to check for dashboard updates
- **allowUiUpdates**: Whether dashboards can be modified in UI
- **path**: Directory containing dashboard JSON files

### Dashboard JSON Structure

**Example Dashboard Configuration**:
```json
{
  "dashboard": {
    "id": null,
    "title": "System Overview",
    "tags": ["brainbytes", "system"],
    "timezone": "Asia/Manila",
    "refresh": "30s",
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "templating": {
      "list": [
        {
          "name": "instance",
          "type": "query",
          "query": "label_values(up, instance)",
          "refresh": 1
        }
      ]
    }
  }
}
```

---

## Docker Compose Configuration

### Monitoring Stack Compose File

**File**: `docker-compose.monitoring.yml`

#### Prometheus Service
```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/configs/prometheus/development.yml:/etc/prometheus/prometheus.yml
    - ./monitoring/configs/prometheus/rules:/etc/prometheus/rules
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--web.console.libraries=/etc/prometheus/console_libraries'
    - '--web.console.templates=/etc/prometheus/consoles'
    - '--storage.tsdb.retention.time=15d'
    - '--web.enable-lifecycle'
  networks:
    - monitoring
```

**Configuration Explanation**:
- **volumes**: Mount configuration files and data directory
- **command**: Prometheus startup parameters
- **storage.tsdb.retention.time**: How long to keep metrics data
- **web.enable-lifecycle**: Allow configuration reload via API

#### Grafana Service
```yaml
grafana:
  image: grafana/grafana:latest
  container_name: grafana
  ports:
    - "3003:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_USERS_ALLOW_SIGN_UP=false
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
  networks:
    - monitoring
```

#### Node Exporter Service
```yaml
node-exporter:
  image: prom/node-exporter:latest
  container_name: node-exporter
  ports:
    - "9100:9100"
  volumes:
    - /proc:/host/proc:ro
    - /sys:/host/sys:ro
    - /:/rootfs:ro
  command:
    - '--path.procfs=/host/proc'
    - '--path.rootfs=/rootfs'
    - '--path.sysfs=/host/sys'
    - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
  networks:
    - monitoring
```

#### cAdvisor Service
```yaml
cadvisor:
  image: gcr.io/cadvisor/cadvisor:latest
  container_name: cadvisor
  ports:
    - "8080:8080"
  volumes:
    - /:/rootfs:ro
    - /var/run:/var/run:rw
    - /sys:/sys:ro
    - /var/lib/docker/:/var/lib/docker:ro
  networks:
    - monitoring
```

### Network Configuration
```yaml
networks:
  monitoring:
    driver: bridge
  default:
    external:
      name: brainbytes_default
```

### Volume Configuration
```yaml
volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

---

## Environment Variables

### Application Environment Variables

**Backend Service** (`.env`):
```bash
# Monitoring Configuration
PROMETHEUS_ENABLED=true
METRICS_PORT=3000
METRICS_PATH=/metrics

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/brainbytes
DB_POOL_SIZE=10

# AI Service Configuration
AI_SERVICE_URL=http://ai-service:3002
AI_TIMEOUT=30000
```

**AI Service** (`.env`):
```bash
# AI Provider Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000

# Monitoring Configuration
PROMETHEUS_ENABLED=true
METRICS_PORT=3002
METRICS_PATH=/metrics
```

### Monitoring Stack Environment Variables

**Prometheus**:
```bash
# Data retention
PROMETHEUS_RETENTION=15d

# Storage configuration
PROMETHEUS_STORAGE_PATH=/prometheus

# Web configuration
PROMETHEUS_WEB_EXTERNAL_URL=http://localhost:9090
```

**Grafana**:
```bash
# Security
GF_SECURITY_ADMIN_PASSWORD=admin
GF_SECURITY_SECRET_KEY=your_secret_key

# Users
GF_USERS_ALLOW_SIGN_UP=false
GF_USERS_DEFAULT_THEME=dark

# Server
GF_SERVER_ROOT_URL=http://localhost:3003
GF_SERVER_SERVE_FROM_SUB_PATH=false
```

**Alertmanager**:
```bash
# SMTP Configuration
ALERTMANAGER_SMTP_HOST=smtp.gmail.com
ALERTMANAGER_SMTP_PORT=587
ALERTMANAGER_SMTP_USERNAME=alerts@brainbytes.ai
ALERTMANAGER_SMTP_PASSWORD=your_app_password

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

---

## Configuration Best Practices

### Security Considerations

1. **Secrets Management**:
   - Use environment variables for sensitive data
   - Never commit passwords to version control
   - Use Docker secrets in production

2. **Network Security**:
   - Use internal networks for service communication
   - Expose only necessary ports
   - Implement authentication for external access

3. **Access Control**:
   - Configure Grafana authentication
   - Restrict Prometheus admin endpoints
   - Use RBAC for team-based access

### Performance Optimization

1. **Scrape Intervals**:
   - Use appropriate intervals for different metrics
   - Balance between data granularity and resource usage
   - Consider using recording rules for expensive queries

2. **Retention Policies**:
   - Set appropriate retention based on storage capacity
   - Use different retention for different metric types
   - Implement data archiving for long-term storage

3. **Resource Allocation**:
   - Allocate sufficient memory for Prometheus
   - Configure appropriate CPU limits
   - Monitor monitoring stack resource usage

### Maintenance Procedures

1. **Configuration Updates**:
   - Version control all configuration files
   - Test configuration changes in staging
   - Use configuration validation tools

2. **Backup Procedures**:
   - Regular backup of configuration files
   - Backup Grafana dashboards and datasources
   - Document recovery procedures

3. **Monitoring the Monitoring**:
   - Monitor Prometheus itself
   - Track scrape success rates
   - Monitor alert delivery success

---

*Last Updated: January 2025*
*Version: 1.0*
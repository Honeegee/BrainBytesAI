# System Architecture Documentation

## Overview

The BrainBytes AI monitoring system is built on a modern observability stack designed to provide comprehensive insights into system performance, user experience, and business metrics. The architecture follows best practices for scalability, reliability, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BrainBytes AI Application                     │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Frontend      │    Backend      │      AI Service             │
│   (Next.js)     │   (Node.js)     │     (Node.js)               │
│   Port: 3001    │   Port: 3000    │     Port: 3002              │
│                 │                 │                             │
│   Metrics:      │   Metrics:      │     Metrics:                │
│   - Page views  │   - HTTP reqs   │     - AI requests           │
│   - User actions│   - DB queries  │     - Response times        │
│   - Errors      │   - Auth events │     - Token usage           │
└─────────────────┴─────────────────┴─────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Metrics Collection Layer                     │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Node Exporter  │    cAdvisor     │    Custom Exporters         │
│  Port: 9100     │   Port: 8080    │    (Application metrics)    │
│                 │                 │                             │
│  System metrics:│  Container      │    Business metrics:        │
│  - CPU usage    │  metrics:       │    - Sessions               │
│  - Memory       │  - Memory       │    - Questions              │
│  - Disk I/O     │  - CPU          │    - User engagement        │
│  - Network      │  - Network      │    - Mobile performance     │
└─────────────────┴─────────────────┴─────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Prometheus                                 │
│                     Port: 9090                                 │
│                                                                 │
│  Core Functions:                                                │
│  - Metrics scraping (15s intervals)                            │
│  - Time-series data storage                                     │
│  - Alert rule evaluation                                        │
│  - Recording rule processing                                    │
│  - PromQL query engine                                          │
│                                                                 │
│  Configuration:                                                 │
│  - Scrape configs for all services                             │
│  - Alert rules (basic + advanced)                              │
│  - Recording rules for performance                              │
│  - Retention: 15 days                                          │
└─────────────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│      Alertmanager       │ │        Grafana          │
│       Port: 9093        │ │       Port: 3003        │
│                         │ │                         │
│  Functions:             │ │  Functions:             │
│  - Alert routing        │ │  - Data visualization   │
│  - Notification mgmt    │ │  - Dashboard creation   │
│  - Alert grouping       │ │  - User interface       │
│  - Silence management   │ │  - Query builder        │
│                         │ │                         │
│  Integrations:          │ │  Dashboards:            │
│  - Slack notifications  │ │  - System Overview      │
│  - Email alerts         │ │  - Application Perf     │
│  - Webhook endpoints    │ │  - Error Analysis       │
│                         │ │  - Resource Optimization│
│                         │ │  - User Experience      │
└─────────────────────────┘ └─────────────────────────┘
```

## Component Details

### 1. Application Layer

#### Frontend (Next.js - Port 3001)
- **Purpose**: User interface and client-side metrics
- **Metrics Exposed**: Page views, user interactions, client-side errors
- **Monitoring**: Performance metrics, user experience data
- **Special Considerations**: Mobile-optimized for Filipino users

#### Backend (Node.js - Port 3000)
- **Purpose**: API server and business logic
- **Metrics Exposed**: HTTP requests, database operations, authentication events
- **Monitoring**: Request/response times, error rates, database performance
- **Key Metrics**: 
  - `brainbytes_http_requests_total`
  - `brainbytes_http_request_duration_seconds`
  - `brainbytes_db_connections_active`

#### AI Service (Node.js - Port 3002)
- **Purpose**: AI/ML processing and external API integration
- **Metrics Exposed**: AI request processing, token usage, model performance
- **Monitoring**: Response times, success rates, cost tracking
- **Key Metrics**:
  - `brainbytes_ai_requests_total`
  - `brainbytes_ai_request_duration_seconds`
  - `brainbytes_ai_tokens_used_total`

### 2. Metrics Collection Layer

#### Node Exporter (Port 9100)
- **Purpose**: System-level metrics collection
- **Metrics**: CPU, memory, disk, network, filesystem
- **Deployment**: Runs on host system
- **Scrape Interval**: 15 seconds

#### cAdvisor (Port 8080)
- **Purpose**: Container metrics collection
- **Metrics**: Container resource usage, performance statistics
- **Deployment**: Docker container with host mounts
- **Scrape Interval**: 15 seconds

#### Custom Application Exporters
- **Purpose**: Business and application-specific metrics
- **Integration**: Built into application code
- **Metrics**: User sessions, questions, engagement, mobile performance

### 3. Prometheus (Port 9090)

#### Core Configuration
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: 'development'
    cluster: 'brainbytes-local'
```

#### Scrape Targets
- **prometheus**: Self-monitoring
- **brainbytes-backend**: Backend API metrics
- **brainbytes-ai-service**: AI service metrics
- **node-exporter**: System metrics
- **cadvisor**: Container metrics
- **alertmanager**: Alertmanager metrics
- **heroku-exporter**: Heroku platform metrics (when deployed)

#### Data Retention
- **Default**: 15 days
- **Storage**: Local filesystem (development)
- **Backup**: Not configured (development environment)

### 4. Alertmanager (Port 9093)

#### Alert Routing
- **Team-based routing**: Infrastructure, Product, Engineering, AI teams
- **Severity-based escalation**: Warning → Critical → Escalation
- **Time-based routing**: Business hours vs. after-hours

#### Notification Channels
- **Slack**: Primary notification channel
- **Email**: Backup and escalation
- **Webhooks**: Custom integrations

#### Alert Grouping
- **By service**: Group related service alerts
- **By severity**: Prevent alert storms
- **By team**: Route to appropriate responders

### 5. Grafana (Port 3003)

#### Dashboard Categories
1. **System Overview**: High-level system health
2. **Application Performance**: Request/response metrics
3. **Error Analysis**: Error tracking and analysis
4. **Resource Optimization**: Resource usage and efficiency
5. **User Experience**: User-focused metrics

#### Data Sources
- **Primary**: Prometheus
- **Authentication**: Admin/admin (development)
- **Provisioning**: Automated dashboard and datasource setup

## Data Flow

### 1. Metrics Collection Flow
```
Application → Metrics Endpoint → Prometheus Scraper → Time Series DB
```

### 2. Alert Processing Flow
```
Prometheus → Alert Rules → Alertmanager → Notification Channels
```

### 3. Visualization Flow
```
Grafana → PromQL Query → Prometheus → Time Series Data → Dashboard
```

### 4. Recording Rules Flow
```
Prometheus → Recording Rules → Pre-computed Metrics → Faster Queries
```

## Network Architecture

### Port Allocation
- **3000**: Backend API
- **3001**: Frontend Application
- **3002**: AI Service
- **3003**: Grafana
- **8080**: cAdvisor
- **9090**: Prometheus
- **9093**: Alertmanager
- **9100**: Node Exporter
- **9595**: Heroku Exporter (when active)

### Service Discovery
- **Static Configuration**: Development environment uses static targets
- **Docker Networking**: Services communicate via Docker network
- **DNS Resolution**: Container names resolve to IP addresses

## Security Considerations

### Development Environment
- **Authentication**: Basic authentication for Grafana
- **Network**: Services exposed on localhost only
- **Data**: No sensitive data encryption (development only)

### Production Recommendations
- **TLS**: Enable HTTPS for all services
- **Authentication**: Implement proper authentication/authorization
- **Network**: Use private networks and firewalls
- **Data**: Encrypt sensitive metrics and communications

## Scalability Design

### Horizontal Scaling
- **Application Services**: Can be scaled independently
- **Prometheus**: Single instance (development), federation for production
- **Grafana**: Can run multiple instances with shared storage

### Vertical Scaling
- **Memory**: Prometheus requires adequate memory for time series data
- **Storage**: Disk space for metrics retention
- **CPU**: Sufficient processing for query execution

## Filipino Context Adaptations

### Mobile Performance Monitoring
- **Data Usage Tracking**: Monitor response sizes for mobile users
- **Connection Quality**: Track connection drops and timeouts
- **Network Performance**: Monitor latency and throughput

### Cost Optimization
- **Resource Monitoring**: Track cloud resource usage
- **Efficiency Metrics**: Monitor resource utilization ratios
- **Budget Alerts**: Alert on unusual resource consumption

### Connectivity Patterns
- **Intermittent Connectivity**: Monitor for connection patterns
- **Peak Usage**: Track usage during typical Filipino internet peak hours
- **Mobile vs Desktop**: Separate monitoring for different platforms

## Maintenance and Operations

### Regular Tasks
- **Dashboard Review**: Weekly dashboard effectiveness review
- **Alert Tuning**: Monthly alert threshold adjustment
- **Capacity Planning**: Quarterly resource usage analysis
- **Documentation Updates**: Ongoing documentation maintenance

### Backup and Recovery
- **Configuration Backup**: Version control for all configurations
- **Dashboard Export**: Regular dashboard JSON exports
- **Data Recovery**: Prometheus data backup procedures (production)

### Monitoring the Monitoring
- **Prometheus Health**: Monitor Prometheus itself
- **Scrape Success**: Track scrape success rates
- **Alert Delivery**: Monitor alert delivery success
- **Dashboard Performance**: Track dashboard load times

---

*Last Updated: January 2025*
*Version: 1.0*
# Traffic Generator for BrainBytes AI

This directory contains scripts to generate realistic traffic to your BrainBytes AI application for testing, monitoring, and performance evaluation.

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your system
- Your BrainBytes AI application running (default: http://localhost)

### Running Traffic Generation

#### Option 1: Use Batch Scripts (Windows)
Simply double-click on any of the batch files:

- **`generate-light-traffic.bat`** - Light load (2 RPS, 1 minute)
- **`generate-medium-traffic.bat`** - Medium load (10 RPS, 5 minutes)  
- **`generate-heavy-traffic.bat`** - Heavy load (20 RPS, 10 minutes)
- **`generate-stress-traffic.bat`** - Stress test (50 RPS, 5 minutes)

#### Option 2: Command Line
```bash
# Install dependencies first
cd scripts
npm install

# Run with default settings
node generate-traffic.js

# Or use npm scripts
npm run light    # Light traffic
npm run medium   # Medium traffic
npm run heavy    # Heavy traffic
npm run stress   # Stress test
```

## ⚙️ Configuration

You can customize the traffic generation by setting environment variables:

```bash
# Basic configuration
BASE_URL=http://localhost          # Target application URL
DURATION=300                       # Duration in seconds (default: 5 minutes)
RPS=10                            # Requests per second (default: 5)
CONCURRENCY=5                     # Concurrent workers (default: 10)
LOG_FILE=traffic-log.json         # Output log file

# Example: Custom traffic generation
BASE_URL=https://your-app.herokuapp.com DURATION=600 RPS=15 CONCURRENCY=8 node generate-traffic.js
```

## 📊 Traffic Patterns

The traffic generator simulates realistic user behavior by hitting various endpoints with different weights:

| Endpoint | Method | Weight | Description |
|----------|--------|--------|-------------|
| `/` | GET | 30% | Homepage visits |
| `/api/health` | GET | 20% | Health checks |
| `/api/users` | GET | 15% | User data requests |
| `/api/materials` | GET | 15% | Learning materials |
| `/api/auth/login` | POST | 10% | User authentication |
| `/api/materials` | POST | 5% | Create materials |
| `/api/ai/chat` | GET | 5% | AI interactions |

## 📈 Output and Monitoring

### Real-time Console Output
The script provides real-time feedback:
```
🚀 Starting Traffic Generator
Target: http://localhost
Duration: 300 seconds
Concurrency: 10
Target RPS: 10
────────────────────────────────────────────────────────────────────────────────
2025-07-16T12:00:00.000Z GET / - 200 (45ms)
2025-07-16T12:00:00.100Z GET /api/health - 200 (12ms)
2025-07-16T12:00:00.200Z POST /api/auth/login - 401 (23ms)
...
Progress: 25.0% | Requests: 750 | Current RPS: 10.2 | Success Rate: 95.3%
```

### Final Statistics
After completion, you'll see comprehensive statistics:
```
================================================================================
📊 TRAFFIC GENERATION COMPLETE
================================================================================
Duration: 300.00s
Total Requests: 3000
Successful: 2850 (95.00%)
Failed: 150
Average RPS: 10.00
Average Response Time: 45.23ms
95th Percentile: 120ms
99th Percentile: 250ms

Status Code Distribution:
  200: 2400 requests
  401: 120 requests
  404: 30 requests
  500: 15 requests
```

### Log Files
Detailed results are saved to JSON files:
- `light-traffic-log.json`
- `medium-traffic-log.json`
- `heavy-traffic-log.json`
- `stress-traffic-log.json`

## 🎯 Use Cases

### 1. Performance Testing
```bash
# Test application performance under load
npm run heavy
```

### 2. Monitoring System Validation
```bash
# Generate traffic to test monitoring alerts
npm run medium
```

### 3. Stress Testing
```bash
# Find application breaking points
npm run stress
```

### 4. Continuous Load
```bash
# Long-running background load
DURATION=3600 RPS=5 node generate-traffic.js
```

## 🔧 Advanced Usage

### Custom Endpoints
Edit `generate-traffic.js` to modify the `endpoints` array:

```javascript
const endpoints = [
  { method: 'GET', path: '/your-endpoint', weight: 20 },
  { method: 'POST', path: '/api/custom', weight: 10, data: { key: 'value' } }
];
```

### Authentication
For endpoints requiring authentication, modify the request headers:

```javascript
headers: {
  'Authorization': 'Bearer your-token-here',
  'User-Agent': getRandomUserAgent(),
  'Accept': 'application/json'
}
```

### Different Environments
```bash
# Test staging environment
BASE_URL=https://staging.yourapp.com node generate-traffic.js

# Test production (be careful!)
BASE_URL=https://yourapp.com RPS=2 DURATION=60 node generate-traffic.js
```

## 📋 Monitoring Integration

The traffic generator works perfectly with your monitoring stack:

1. **Prometheus Metrics**: The generated traffic will appear in your application metrics
2. **Grafana Dashboards**: Monitor real-time performance during traffic generation
3. **Alerting**: Test your alerting rules with controlled load

### Recommended Monitoring Workflow
1. Start your monitoring stack: `docker-compose up -d`
2. Open Grafana: http://localhost:8080/grafana/
3. Run traffic generation: `generate-medium-traffic.bat`
4. Watch metrics in real-time
5. Analyze results in the generated log files

## ⚠️ Important Notes

- **Start Small**: Begin with light traffic and gradually increase
- **Monitor Resources**: Watch CPU, memory, and database performance
- **Network Impact**: High RPS can consume significant bandwidth
- **Rate Limiting**: Your application may have rate limiting that affects results
- **Database Load**: POST requests create data, monitor database performance

## 🛠️ Troubleshooting

### Common Issues

**Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:80
```
- Ensure your application is running
- Check the BASE_URL configuration

**High Error Rate**
- Reduce RPS and CONCURRENCY
- Check application logs for errors
- Verify endpoint paths are correct

**Slow Performance**
- Monitor system resources
- Check database connections
- Review application bottlenecks

### Getting Help
- Check application logs during traffic generation
- Monitor system resources (CPU, memory, disk)
- Use the generated log files to identify patterns
- Adjust traffic parameters based on your system capacity

## 📝 Example Scenarios

### Scenario 1: Daily Load Testing
```bash
# Run every morning to test overnight changes
npm run medium
```

### Scenario 2: Pre-deployment Validation
```bash
# Test before deploying to production
npm run heavy
```

### Scenario 3: Monitoring Alert Testing
```bash
# Generate enough load to trigger alerts
npm run stress
```

### Scenario 4: Baseline Performance
```bash
# Establish performance baselines
DURATION=1800 RPS=8 node generate-traffic.js
# Performance Testing Guide

## Overview

This document provides comprehensive guidance for performance testing the BrainBytes AI platform using Artillery for load testing and performance monitoring.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Configurations](#test-configurations)
3. [Running Performance Tests](#running-performance-tests)
4. [Understanding Results](#understanding-results)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
```bash
# Install Artillery globally
npm install -g artillery

# Ensure application is running
docker-compose up -d

# Verify services are healthy
curl http://localhost:3000/api/health
curl http://localhost:3001/
```

### Run Basic Performance Test
```bash
# Quick validation test (5 seconds)
artillery run performance-test-quick.yml

# Full performance test (5+ minutes)
artillery run performance-test.yml --output results.json

# Generate HTML report
artillery report results.json --output results.html
```

## Test Configurations

### Quick Test (`performance-test-quick.yml`)
**Purpose**: Fast validation that performance testing works

**Configuration**:
- Duration: 5 seconds
- Load: 1 request/second
- Target: Backend API root endpoint

**Use Cases**:
- CI/CD pipeline validation
- Local development testing
- Configuration verification

### Full Performance Test (`performance-test.yml`)
**Purpose**: Comprehensive performance evaluation

**Configuration**:
- **Phase 1**: 5 req/sec for 60s (warm-up)
- **Phase 2**: 10 req/sec for 120s (steady load)
- **Phase 3**: 15 req/sec for 60s (peak load)

**Test Scenarios**:
- **API Welcome** (40% traffic): Backend health checks
- **Frontend Pages** (60% traffic): Homepage, login, signup pages

**Use Cases**:
- Release validation
- Performance regression testing
- Capacity planning

## Running Performance Tests

### Local Testing

#### Basic Commands
```bash
# Run quick test
artillery run performance-test-quick.yml

# Run full test with output
artillery run performance-test.yml --output performance-report.json

# Generate HTML report
artillery report performance-report.json --output performance-report.html
```

#### Custom Configuration
```bash
# Override target URL
artillery run performance-test.yml --target http://staging.brainbytes.app

# Set custom duration
artillery run performance-test.yml --overrides '{"config":{"phases":[{"duration":30,"arrivalRate":5}]}}'
```

### CI/CD Integration

Performance tests run automatically in GitHub Actions:

```yaml
# Excerpt from .github/workflows/ci-cd.yml
- name: Run Performance Tests
  run: |
    cd e2e-tests
    npm install -g artillery
    artillery run ../performance-test-quick.yml
```

### Docker Environment Testing

```bash
# Test against Docker services
docker-compose up -d
sleep 30  # Wait for services to start
artillery run performance-test.yml
docker-compose down
```

## Understanding Results

### Key Metrics

#### Response Time Metrics
- **Min**: Fastest response time
- **Max**: Slowest response time
- **Mean**: Average response time
- **Median (p50)**: 50% of requests were faster
- **p95**: 95% of requests were faster
- **p99**: 99% of requests were faster

#### Throughput Metrics
- **Requests/second**: Number of requests processed per second
- **Scenarios completed**: Total number of test scenarios finished
- **Virtual users**: Number of simulated concurrent users

#### Error Metrics
- **HTTP codes**: Distribution of response codes (200, 404, 500, etc.)
- **Errors**: Count and types of errors encountered
- **Timeouts**: Requests that exceeded timeout limits

### Expected Performance Baselines

Based on our testing:

| Metric | Target | Acceptable | Needs Attention |
|--------|--------|------------|-----------------|
| Mean Response Time | < 200ms | < 500ms | > 500ms |
| P95 Response Time | < 500ms | < 1000ms | > 1000ms |
| P99 Response Time | < 1000ms | < 2000ms | > 2000ms |
| Success Rate | > 99% | > 95% | < 95% |
| Throughput | > 50 req/sec | > 30 req/sec | < 30 req/sec |

### Sample Results Analysis

```bash
# Good performance example
http.codes.200: 5153 (99.5% success rate)
http.response_time.min: 45ms
http.response_time.max: 2341ms
http.response_time.mean: 172ms
http.response_time.p95: 445ms
http.response_time.p99: 891ms

# Performance issues example
http.codes.200: 4823 (93% success rate)
http.codes.500: 200 (4% server errors)
http.codes.timeout: 155 (3% timeouts)
http.response_time.mean: 750ms
http.response_time.p95: 2100ms
```

## Best Practices

### Test Design

1. **Gradual Load Increase**: Start with low load and gradually increase
   ```yaml
   phases:
     - duration: 60
       arrivalRate: 5    # Warm-up
     - duration: 120
       arrivalRate: 20   # Target load
     - duration: 60
       arrivalRate: 35   # Peak load
   ```

2. **Realistic User Patterns**: Include think time between requests
   ```yaml
   flow:
     - get:
         url: "/login"
     - think: 2          # 2-second pause
     - post:
         url: "/api/auth/login"
   ```

3. **Multiple Scenarios**: Test different user behaviors
   ```yaml
   scenarios:
     - name: "Browse content"
       weight: 60
     - name: "Create content"
       weight: 30
     - name: "Admin actions"
       weight: 10
   ```

### Environment Preparation

1. **Stable Environment**: Ensure consistent test environment
2. **Clean State**: Reset database to known state before testing
3. **Resource Monitoring**: Monitor CPU, memory, and disk usage
4. **Network Stability**: Ensure stable network connection

### Data Management

1. **Test Data**: Use realistic test data volumes
2. **Data Cleanup**: Clean up test data after performance tests
3. **Database Size**: Test with production-like database sizes

### Monitoring During Tests

```bash
# Monitor system resources during testing
# Terminal 1: Run performance test
artillery run performance-test.yml

# Terminal 2: Monitor Docker containers
watch docker stats

# Terminal 3: Monitor application logs
docker-compose logs -f backend frontend ai-service
```

## Troubleshooting

### Common Issues

#### Connection Refused Errors
**Symptoms**: `ECONNREFUSED` errors in Artillery output

**Solutions**:
```bash
# Check if services are running
docker-compose ps

# Verify port accessibility
curl http://localhost:3000/api/health
curl http://localhost:3001/

# Restart services if needed
docker-compose restart
```

#### High Response Times
**Symptoms**: Response times > 2000ms, timeouts

**Solutions**:
1. **Reduce Load**: Lower arrival rate in test configuration
2. **Check Resources**: Monitor CPU and memory usage
3. **Database Performance**: Check database query performance
4. **Network Issues**: Verify network latency

#### Memory Leaks
**Symptoms**: Gradually increasing response times, out-of-memory errors

**Solutions**:
```bash
# Monitor memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Check for memory leaks in application
docker-compose exec backend npm run test:memory

# Restart services to clear memory
docker-compose restart
```

#### 404 Errors
**Symptoms**: High number of HTTP 404 responses

**Solutions**:
1. **Verify Endpoints**: Ensure test URLs match actual endpoints
2. **Check Routing**: Verify application routing configuration
3. **Service Health**: Confirm all services are responding

### Debug Commands

#### Verbose Artillery Output
```bash
# Run with detailed logging
artillery run performance-test.yml --quiet=false

# Debug mode (very verbose)
DEBUG=* artillery run performance-test.yml
```

#### Application Debugging
```bash
# Check application logs during test
docker-compose logs -f backend | grep ERROR

# Monitor database queries
docker-compose exec mongodb mongotop 5

# Check API endpoints manually
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health
```

#### Resource Monitoring
```bash
# Monitor system resources
htop  # or top on older systems

# Monitor Docker container resources
docker stats

# Check disk space
df -h

# Monitor network connections
netstat -an | grep :3000
```

### Performance Optimization Tips

1. **Database Indexing**: Ensure proper database indexes
2. **Caching**: Implement appropriate caching strategies
3. **Connection Pooling**: Use connection pooling for database
4. **Static Assets**: Serve static assets efficiently
5. **Load Balancing**: Consider load balancing for high traffic

### Custom Test Scenarios

#### API-Focused Testing
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 120
      arrivalRate: 25

scenarios:
  - name: "Chat API Load"
    flow:
      - post:
          url: "/api/messages"
          json:
            text: "Load test message"
            chatId: "load-test-{{ $randomString() }}"
      - think: 1
      - get:
          url: "/api/messages?chatId=load-test-{{ $randomString() }}"
```

#### Frontend-Focused Testing
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 180
      arrivalRate: 15

scenarios:
  - name: "User Journey"
    flow:
      - get:
          url: "/"
      - think: 3
      - get:
          url: "/login"
      - think: 2
      - get:
          url: "/dashboard"
```

This performance testing guide ensures you can effectively monitor and optimize the performance of the BrainBytes AI platform.
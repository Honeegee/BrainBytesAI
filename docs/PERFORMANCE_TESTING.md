# Performance Testing with Artillery

This project includes Artillery configuration for load testing the BrainBytes AI application.

## Prerequisites

1. Install Artillery globally:
```bash
npm install -g artillery
```

2. Ensure the application is running via Docker:
```bash
docker-compose up -d
```

## Available Test Configurations

### Quick Test (`performance-test-quick.yml`)
- Duration: 5 seconds
- Arrival Rate: 1 request/second
- Target: Backend API root endpoint (`/`)
- Use for: Quick validation that the configuration works

```bash
artillery run performance-test-quick.yml
```

### Full Performance Test (`performance-test.yml`)
- Duration: 3 phases (60s each at different loads)
- Phase 1: 5 req/sec for 60s
- Phase 2: 10 req/sec for 120s  
- Phase 3: 15 req/sec for 60s
- Target: Both backend API and frontend
- Use for: Comprehensive performance testing

```bash
artillery run performance-test.yml --output performance-report.json
```

## Test Scenarios

### API Welcome Load Test (40% weight)
- Tests the backend API root endpoint (`/`)
- Captures welcome message from response
- Includes 1-second think time between requests

### Frontend Load Test (60% weight)
- Tests frontend pages:
  - Homepage (`http://localhost:3001/`)
  - Login page (`http://localhost:3001/login`)
  - Signup page (`http://localhost:3001/signup`)
- Includes realistic think times (1-2 seconds)

## Generating Reports

Generate an HTML report from the JSON output:
```bash
artillery report performance-report.json --output performance-report.html
```

**Note**: The `artillery report` command is deprecated. Consider using Artillery Cloud for advanced reporting.

## Understanding Results

Key metrics to monitor:
- **http.codes.200**: Successful requests
- **http.response_time**: Response time statistics (min, max, mean, p95, p99)
- **vusers.failed**: Number of failed virtual users
- **errors.ETIMEDOUT**: Timeout errors (indicates server overload)

## Expected Performance

Based on test results:
- **Response Time**: Mean ~170ms, P95 ~450ms
- **Success Rate**: 99.5%+ (5153/5178 successful requests)
- **Throughput**: ~30 requests/second sustained

## CI/CD Integration

The performance tests are automatically run in the CI/CD pipeline:
1. Artillery is installed globally
2. Docker services are started
3. Performance test is executed
4. Results are uploaded as artifacts

## Troubleshooting

### Connection Refused Errors
- Ensure Docker services are running: `docker-compose ps`
- Check that ports 3000 (backend) and 3001 (frontend) are accessible

### 404 Errors
- Verify that the target endpoints exist
- Check backend server logs for routing issues

### Timeout Errors
- Reduce arrival rate in test configuration
- Increase server resources (memory/CPU limits in docker-compose.yml)
- Check for database connection issues

## Customizing Tests

To modify test parameters, edit the YAML files:

```yaml
config:
  target: 'http://localhost:3000'  # Backend target
  phases:
    - duration: 60    # Test duration in seconds
      arrivalRate: 5  # Virtual users per second

scenarios:
  - name: "Custom Test"
    weight: 100  # Percentage of traffic for this scenario
    flow:
      - get:
          url: "/custom-endpoint"
      - think: 2  # Wait time in seconds
```

## Best Practices

1. **Start with quick tests** before running full performance tests
2. **Monitor system resources** during tests
3. **Run tests in isolation** to avoid interference
4. **Test with realistic data** and user patterns
5. **Set up monitoring** to correlate performance metrics with system metrics
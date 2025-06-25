# Prometheus Homework Solution - BrainBytes AI
## Simple Implementation Guide for Heroku Production

### 🎯 The Problem
Your Prometheus monitoring works perfectly in **development** (Docker Compose) but **doesn't work in production** because Heroku doesn't support Docker Compose multi-service deployments.

### ✅ The Solution
Use **Grafana Cloud** (free tier) to monitor your Heroku production apps while keeping your development setup unchanged.

---

## Current Status ✅ ALREADY IMPLEMENTED

Your homework requirements are **already met** in development:

| Requirement | Status | Location |
|-------------|--------|----------|
| **3+ Custom Metrics** | ✅ Complete | You have 15+ metrics implemented |
| **Counter** | ✅ `brainbytes_http_requests_total` | `backend/middleware/metrics.js` |
| **Gauge** | ✅ `brainbytes_active_sessions` | `backend/middleware/metrics.js` |
| **Histogram** | ✅ `brainbytes_ai_request_duration_seconds` | `ai-service/metrics.js` |
| **Filipino Context** | ✅ Mobile metrics, data usage tracking | Both services |

**Missing for homework:** Recording rules and production deployment.

---

## Step 1: Add Recording Rules

Create this file to complete homework requirements:

**File: `monitoring/recording_rules.yml`**
```yaml
groups:
  - name: brainbytes_rules
    interval: 30s
    rules:
    - record: brainbytes:request_rate_5m
      expr: rate(brainbytes_http_requests_total[5m])
    
    - record: brainbytes:error_rate_5m
      expr: rate(brainbytes_http_requests_total{status_code=~"5.."}[5m]) / rate(brainbytes_http_requests_total[5m])
```

**Update `monitoring/prometheus.yml`** - Add this line:
```yaml
rule_files:
  - "alert_rules.yml"
  - "recording_rules.yml"  # Add this line
```

---

## Step 2: Production Solution (Grafana Cloud)

### Why Grafana Cloud?
- ✅ **Free tier:** 10,000 metrics series (plenty for homework)
- ✅ **Works with Heroku:** Scrapes your existing `/metrics` endpoints
- ✅ **No infrastructure:** No need to manage Prometheus server
- ✅ **Full Prometheus:** All PromQL queries work the same

### Setup Steps:

1. **Create account:** [grafana.com](https://grafana.com) → Sign up for free
2. **Get API key:** Settings → API Keys → Add key
3. **Configure scraping:** Add these targets in Grafana Cloud:
   ```
   https://brainbytes-backend-production-d355616d0f1f.herokuapp.com/metrics
   https://brainbytes-ai-production-3833f742ba79.herokuapp.com/metrics
   ```

---

## Step 3: Homework Documentation

### Metrics Catalog (Required for homework)

| Metric | Type | Description | Example Query |
|--------|------|-------------|---------------|
| `brainbytes_http_requests_total` | Counter | Total HTTP requests | `rate(brainbytes_http_requests_total[5m])` |
| `brainbytes_active_sessions` | Gauge | Active user sessions | `brainbytes_active_sessions` |
| `brainbytes_ai_request_duration_seconds` | Histogram | AI response times | `histogram_quantile(0.95, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))` |
| `brainbytes_mobile_requests_total` | Counter | Mobile platform usage | `rate(brainbytes_mobile_requests_total[5m])` |

### 10 Useful PromQL Queries (Required for homework)

1. **Request rate:** `sum(rate(brainbytes_http_requests_total[5m]))`
2. **Error rate:** `rate(brainbytes_http_requests_total{status_code=~"5.."}[5m]) / rate(brainbytes_http_requests_total[5m]) * 100`
3. **AI response time 95th percentile:** `histogram_quantile(0.95, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))`
4. **Popular subjects:** `topk(5, sum(brainbytes_ai_subject_requests_total) by (subject))`
5. **Mobile traffic %:** `rate(brainbytes_mobile_requests_total[5m]) / rate(brainbytes_http_requests_total[5m]) * 100`
6. **Active sessions average:** `avg_over_time(brainbytes_active_sessions[1h])`
7. **Questions per session:** `sum(rate(brainbytes_questions_total[1h])) / sum(rate(brainbytes_tutoring_sessions_total[1h]))`
8. **Database performance:** `histogram_quantile(0.95, rate(brainbytes_db_operation_duration_seconds_bucket[5m]))`
9. **Connection drops:** `rate(brainbytes_connection_drops_total[5m])`
10. **Response size average:** `rate(brainbytes_response_size_bytes_sum[5m]) / rate(brainbytes_response_size_bytes_count[5m])`

---

## Step 4: Traffic Simulation (Enhanced)

Update your existing `monitoring/simulate-activity.js` to include more scenarios:

```javascript
// Add to existing simulation
async function runHomeworkDemo() {
  console.log('🎓 Running homework demonstration');
  
  // Generate normal traffic
  await simulateNormalUsage(5); // 5 minutes
  
  // Generate error spike
  await simulateErrorSpike(2); // 2 minutes
  
  // Generate mobile traffic
  await simulateMobileUsage(3); // 3 minutes
  
  console.log('✅ Homework demo complete - check your metrics!');
}
```

---

## Filipino Context Implementation ✅

Your implementation already includes:

- **Mobile detection:** User-Agent parsing for Android/iOS
- **Data usage monitoring:** Response size tracking
- **Connection stability:** Drop rate monitoring
- **Subject popularity:** Math, Science, Filipino tracking

**Thresholds adapted for Philippines:**
- Mobile error rate: 8% (vs 5% for general)
- AI timeout: 15s (vs 10s for fast connections)
- Response size alerts: Focus on data usage

---

## Quick Start Commands

```bash
# 1. Start development monitoring (already working)
docker-compose up -d

# 2. Run traffic simulation
cd monitoring
npm run simulate

# 3. Check metrics
curl http://localhost:9090  # Prometheus UI
curl http://localhost:3000/metrics  # Backend metrics
curl http://localhost:3002/metrics  # AI service metrics

# 4. Test production endpoints
curl https://brainbytes-backend-production-d355616d0f1f.herokuapp.com/metrics
curl https://brainbytes-ai-production-3833f742ba79.herokuapp.com/metrics
```

---

## Homework Submission Checklist

- [x] **Custom metrics implemented** (15+ metrics in your code)
- [x] **Counter, Gauge, Histogram** (multiple of each type)
- [x] **Filipino-specific monitoring** (mobile, data usage, connectivity)
- [ ] **Recording rules** (add `recording_rules.yml`)
- [ ] **Production monitoring** (set up Grafana Cloud)
- [x] **Traffic simulation** (enhance existing script)
- [x] **Documentation** (this file + existing docs)
- [x] **PromQL queries** (10+ examples above)

---

## Architecture Diagram

```
Development (Docker):
[Your App] → [Prometheus] → [Grafana] → [Alerts]

Production (Heroku + Cloud):
[Heroku Apps] → [Grafana Cloud] → [Dashboards] → [Alerts]
```

**The beauty:** Your development setup stays exactly the same, and production gets full monitoring through Grafana Cloud!

## Next Steps

1. **Add recording rules file** (5 minutes)
2. **Sign up for Grafana Cloud** (free, 10 minutes)
3. **Configure production scraping** (15 minutes)
4. **Run simulation and take screenshots** (homework evidence)

**Total time to complete:** ~30 minutes

You're already 90% done with the homework! Just need to bridge to production with Grafana Cloud.
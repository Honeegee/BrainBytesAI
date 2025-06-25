# Metrics Catalog Documentation
## Task 2.2: Complete Metrics Documentation

### 📊 **Complete Metrics Inventory**

**Total Custom Metrics Implemented: 15+**  
**Categories: Application Performance, AI Service, Business Intelligence, Filipino Context**

---

## 🌐 **Application Performance Metrics**

| Metric Name | Type | Description | Labels | Example Query | Business Context |
|-------------|------|-------------|---------|---------------|------------------|
| `brainbytes_http_requests_total` | Counter | Total number of HTTP requests to backend API | `method`, `route`, `status_code`, `app` | `rate(brainbytes_http_requests_total[5m])` | API usage tracking, traffic patterns |
| `brainbytes_http_request_duration_seconds` | Histogram | Duration of HTTP requests in seconds | `method`, `route`, `status_code`, `app` | `histogram_quantile(0.95, rate(brainbytes_http_request_duration_seconds_bucket[5m]))` | Performance monitoring, SLA tracking |
| `brainbytes_active_sessions` | Gauge | Number of currently active user sessions | `app` | `brainbytes_active_sessions` | Real-time user engagement |
| `brainbytes_db_operation_duration_seconds` | Histogram | Duration of database operations | `operation`, `collection`, `app` | `rate(brainbytes_db_operation_duration_seconds_sum[5m]) / rate(brainbytes_db_operation_duration_seconds_count[5m])` | Database performance optimization |
| `brainbytes_db_connections_active` | Gauge | Number of active database connections | `app` | `brainbytes_db_connections_active` | Resource utilization monitoring |

---

## 🤖 **AI Service Metrics**

| Metric Name | Type | Description | Labels | Example Query | Business Context |
|-------------|------|-------------|---------|---------------|------------------|
| `brainbytes_ai_requests_total` | Counter | Total number of AI requests processed | `endpoint`, `model`, `status`, `app` | `sum(rate(brainbytes_ai_requests_total[5m])) by (status)` | AI service usage and reliability |
| `brainbytes_ai_request_duration_seconds` | Histogram | Time taken for AI to process requests | `endpoint`, `model`, `status`, `app` | `histogram_quantile(0.99, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))` | AI response time optimization |
| `brainbytes_ai_response_length_chars` | Histogram | Length of AI responses in characters | `model`, `subject`, `app` | `rate(brainbytes_ai_response_length_chars_sum[5m]) / rate(brainbytes_ai_response_length_chars_count[5m])` | Response quality and consistency |
| `brainbytes_ai_tokens_used_total` | Counter | Total number of tokens consumed | `model`, `type`, `app` | `sum(rate(brainbytes_ai_tokens_used_total[1h])) by (model)` | Cost tracking and optimization |
| `brainbytes_ai_errors_total` | Counter | Total number of AI service errors | `error_type`, `model`, `app` | `rate(brainbytes_ai_errors_total[5m])` | AI service reliability monitoring |
| `brainbytes_ai_queue_size` | Gauge | Current size of AI request queue | `app` | `brainbytes_ai_queue_size` | Load balancing and capacity planning |
| `brainbytes_ai_subject_requests_total` | Counter | Total AI requests by educational subject | `subject`, `grade_level`, `app` | `topk(5, sum(brainbytes_ai_subject_requests_total) by (subject))` | Subject popularity analysis |

---

## 🎓 **Business Intelligence Metrics**

| Metric Name | Type | Description | Labels | Example Query | Business Context |
|-------------|------|-------------|---------|---------------|------------------|
| `brainbytes_tutoring_sessions_total` | Counter | Total number of tutoring sessions started | `subject`, `grade_level`, `app` | `sum(rate(brainbytes_tutoring_sessions_total[1h])) by (subject)` | Educational engagement tracking |
| `brainbytes_questions_total` | Counter | Total number of questions asked in sessions | `subject`, `grade_level`, `status`, `app` | `sum(rate(brainbytes_questions_total[1h])) by (grade_level)` | Learning activity measurement |
| `brainbytes_user_session_duration_seconds` | Histogram | Duration of user sessions | `user_type`, `app` | `histogram_quantile(0.90, rate(brainbytes_user_session_duration_seconds_bucket[1h]))` | User engagement analysis |

---

## 🇵🇭 **Filipino Context Metrics**

| Metric Name | Type | Description | Labels | Example Query | Business Context |
|-------------|------|-------------|---------|---------------|------------------|
| `brainbytes_mobile_requests_total` | Counter | Total requests from mobile devices | `platform`, `network_type`, `app` | `sum(rate(brainbytes_mobile_requests_total[5m])) by (platform)` | Mobile usage patterns in Philippines |
| `brainbytes_response_size_bytes` | Histogram | Size of HTTP responses in bytes | `endpoint`, `app` | `histogram_quantile(0.95, rate(brainbytes_response_size_bytes_bucket[5m]))` | Data usage optimization for mobile users |
| `brainbytes_connection_drops_total` | Counter | Number of dropped connections | `reason`, `app` | `rate(brainbytes_connection_drops_total[5m]) by (reason)` | Network stability monitoring |

---

## 📈 **Metrics by Domain Classification**

### **System Domain Metrics**
- Infrastructure performance and resource utilization
- Container and host system monitoring

### **Application Domain Metrics**
- HTTP request patterns and performance
- Database operation efficiency
- Session management

### **Business Domain Metrics**
- Educational content engagement
- User behavior patterns
- AI service utilization for learning

---

## 🏷️ **Label Conventions**

### **Standard Labels (Applied to All Metrics)**
- `app`: Service identifier (`brainbytes-backend`, `brainbytes-ai-service`)
- `instance`: Container instance identifier
- `job`: Prometheus scrape job name

### **HTTP Request Labels**
- `method`: HTTP method (GET, POST, PUT, DELETE)
- `route`: API endpoint path
- `status_code`: HTTP response status

### **AI Service Labels**
- `endpoint`: AI service endpoint
- `model`: AI model identifier
- `status`: Request outcome (success, error)

### **Educational Context Labels**
- `subject`: Educational subject (mathematics, science, english, filipino)
- `grade_level`: Student grade level (grade-7, grade-8, grade-9, grade-10)
- `user_type`: User classification (student, teacher, parent)

### **Filipino Context Labels**
- `platform`: Mobile platform (android, ios, mobile)
- `network_type`: Connection type (wifi, cellular, unknown)
- `reason`: Connection drop reason

---

## 📊 **Metric Value Interpretation**

### **Counter Metrics**
- **Always increasing** values representing cumulative totals
- **Use `rate()` function** to get per-second rates
- **Example**: `rate(brainbytes_http_requests_total[5m])` = requests per second

### **Gauge Metrics**
- **Current state** values that can increase or decrease
- **Use directly** for current readings
- **Example**: `brainbytes_active_sessions` = current active users

### **Histogram Metrics**
- **Distribution** of values across predefined buckets
- **Use `histogram_quantile()`** for percentiles
- **Example**: `histogram_quantile(0.95, rate(brainbytes_ai_request_duration_seconds_bucket[5m]))` = 95th percentile response time

---

## 🎯 **Key Performance Indicators (KPIs)**

### **Performance KPIs**
1. **Response Time**: 95th percentile < 500ms
2. **Error Rate**: < 1% of all requests
3. **AI Response Time**: 99th percentile < 5 seconds

### **Business KPIs**
1. **Daily Active Sessions**: Track user engagement
2. **Questions per Session**: Measure learning intensity
3. **Subject Popularity**: Guide content development

### **Filipino Context KPIs**
1. **Mobile Traffic Percentage**: Target > 70% (mobile-first)
2. **Average Response Size**: Keep < 100KB for data efficiency
3. **Connection Stability**: < 5% drop rate

---

## 🔍 **Troubleshooting Guide**

### **Missing Metrics**
- Check if service is generating traffic
- Verify `/metrics` endpoints are accessible
- Confirm Prometheus scraping configuration

### **Unexpected Values**
- Review metric labels for filtering
- Check time range in queries
- Validate recording rule calculations

### **Performance Issues**
- Use recording rules for expensive queries
- Adjust scrape intervals if needed
- Monitor Prometheus resource usage

This comprehensive metrics catalog provides complete documentation for all custom metrics implemented in the BrainBytes AI monitoring system, with specific attention to Filipino user context and educational application requirements.
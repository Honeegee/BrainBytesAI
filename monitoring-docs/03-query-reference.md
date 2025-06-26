# PromQL Query Reference Guide
## Task 2.3: 10+ Useful PromQL Queries with Interpretations

### 🔍 **Query Categories**

1. **Performance Monitoring** - Application speed and efficiency
2. **Business Intelligence** - Educational metrics and user behavior  
3. **Error Tracking** - Problem identification and debugging
4. **Filipino Context** - Mobile and connectivity specific queries
5. **Capacity Planning** - Resource utilization and scaling

---

## ⚡ **Performance Monitoring Queries**

### **Query 1: Overall Request Rate**
```promql
sum(rate(brainbytes_http_requests_total[5m]))
```
**Description**: Total requests per second across all services  
**Interpretation**: 
- Normal: 1-10 requests/second
- High load: 50+ requests/second
- **Use for**: Traffic monitoring, capacity planning

### **Query 2: Error Rate Percentage**
```promql
(
  sum(rate(brainbytes_http_requests_total{status_code=~"5.."}[5m])) /
  sum(rate(brainbytes_http_requests_total[5m]))
) * 100
```
**Description**: Percentage of server errors (5xx) in the last 5 minutes  
**Interpretation**:
- Healthy: < 1%
- Warning: 1-5%
- Critical: > 5%
- **Use for**: Service reliability monitoring, alerting thresholds

### **Query 3: 95th Percentile Response Time**
```promql
histogram_quantile(0.95, 
  rate(brainbytes_http_request_duration_seconds_bucket[5m])
)
```
**Description**: 95% of requests complete within this time  
**Interpretation**:
- Excellent: < 200ms
- Good: 200-500ms
- Poor: > 1s
- **Use for**: Performance SLA monitoring, user experience tracking

### **Query 4: AI Service Performance**
```promql
histogram_quantile(0.99, 
  rate(brainbytes_ai_request_duration_seconds_bucket[5m])
) by (model)
```
**Description**: 99th percentile AI response times by model  
**Interpretation**:
- Fast: < 2s
- Acceptable: 2-5s
- Slow: > 5s
- **Use for**: AI service optimization, model comparison

---

## 📊 **Business Intelligence Queries**

### **Query 5: Most Popular Subjects**
```promql
topk(5, sum(brainbytes_ai_subject_requests_total) by (subject))
```
**Description**: Top 5 most requested educational subjects  
**Interpretation**: Shows content demand patterns
- Typical order: Mathematics, Science, English, Filipino
- **Use for**: Content development prioritization, curriculum planning

### **Query 6: Questions per Tutoring Session**
```promql
sum(rate(brainbytes_questions_total[1h])) / 
sum(rate(brainbytes_tutoring_sessions_total[1h]))
```
**Description**: Average questions asked per tutoring session  
**Interpretation**:
- Low engagement: < 3 questions/session
- Good engagement: 5-10 questions/session
- High engagement: > 10 questions/session
- **Use for**: Learning engagement measurement

### **Query 7: Active User Engagement**
```promql
avg_over_time(brainbytes_active_sessions[1h])
```
**Description**: Average active sessions over the last hour  
**Interpretation**:
- Peak hours: 15:00-20:00 (after school)
- Low activity: 00:00-06:00
- **Use for**: Resource scaling, peak load planning

---

## 🇵🇭 **Filipino Context Queries**

### **Query 8: Mobile Traffic Percentage**
```promql
(
  sum(rate(brainbytes_mobile_requests_total[5m])) /
  sum(rate(brainbytes_http_requests_total[5m]))
) * 100
```
**Description**: Percentage of traffic from mobile devices  
**Interpretation**:
- Expected for Philippines: 70-85%
- Desktop usage: 15-30%
- **Use for**: Mobile optimization prioritization

### **Query 9: Data Usage by Endpoint**
```promql
sum(rate(brainbytes_response_size_bytes_sum[5m])) by (endpoint) / 
sum(rate(brainbytes_response_size_bytes_count[5m])) by (endpoint)
```
**Description**: Average response size by API endpoint  
**Interpretation**:
- Efficient: < 50KB per response
- Heavy: > 200KB per response
- **Use for**: Data plan cost optimization

### **Query 10: Connection Stability**
```promql
rate(brainbytes_connection_drops_total[5m]) by (reason)
```
**Description**: Connection drop rate by reason  
**Interpretation**:
- Good connectivity: < 0.1 drops/second
- Poor connectivity: > 1 drop/second
- **Use for**: Network quality assessment

---

## 🔧 **Infrastructure & Capacity Queries**

### **Query 11: Database Performance**
```promql
histogram_quantile(0.95, 
  rate(brainbytes_db_operation_duration_seconds_bucket[5m])
) by (operation)
```
**Description**: 95th percentile database operation times  
**Interpretation**:
- Fast: < 50ms
- Slow: > 500ms
- **Use for**: Database optimization, query tuning

### **Query 12: AI Service Load**
```promql
rate(brainbytes_ai_requests_total[5m]) by (endpoint)
```
**Description**: AI request rate by endpoint  
**Interpretation**: Shows which AI features are most used
- **Use for**: AI service scaling, feature popularity

---

## 📈 **Advanced Analytics Queries**

### **Query 13: Peak Hours Analysis**
```promql
avg_over_time(
  sum(rate(brainbytes_http_requests_total[5m]))[1h:5m]
) by (hour)
```
**Description**: Request patterns by hour of day  
**Interpretation**: 
- Peak: 15:00-19:00 (after school hours)
- Low: 23:00-05:00 (sleeping hours)
- **Use for**: Auto-scaling configuration

### **Query 14: Error Correlation**
```promql
increase(brainbytes_ai_errors_total[1h]) and 
increase(brainbytes_connection_drops_total[1h])
```
**Description**: Correlation between AI errors and connection issues  
**Interpretation**: High correlation suggests network-related AI failures
- **Use for**: Root cause analysis

### **Query 15: Grade Level Engagement**
```promql
sum(rate(brainbytes_questions_total[1h])) by (grade_level)
```
**Description**: Question activity by student grade level  
**Interpretation**: Shows which grades are most active
- **Use for**: Educational content targeting

---

## 🎯 **Recording Rules Queries**

### **Pre-calculated Metrics (from recording_rules.yml)**

### **Query 16: Pre-calculated Request Rate**
```promql
brainbytes:request_rate_5m
```
**Description**: Uses recording rule for faster query execution  
**Benefits**: Reduces computation time for dashboards

### **Query 17: Pre-calculated Error Rate**
```promql
brainbytes:error_rate_5m
```
**Description**: Pre-calculated error percentage  
**Benefits**: Real-time alerting with minimal delay

---

## 🚨 **Alerting Queries**

### **High Error Rate Alert**
```promql
brainbytes:error_rate_5m * 100 > 5
```
**Threshold**: 5% error rate  
**Duration**: 1 minute  
**Action**: Immediate investigation required

### **AI Service Slow Response Alert**
```promql
histogram_quantile(0.95, 
  rate(brainbytes_ai_request_duration_seconds_bucket[5m])
) > 10
```
**Threshold**: 10 seconds for 95th percentile  
**Duration**: 2 minutes  
**Action**: Check AI service capacity

---

## 📊 **Query Interpretation Guidelines**

### **Rate Functions**
- `rate()`: Per-second average over time range
- `increase()`: Total increase over time range
- `irate()`: Instant rate (last two points)

### **Aggregation Functions**
- `sum()`: Add values across dimensions
- `avg()`: Average values
- `max()`/`min()`: Extreme values
- `topk()`/`bottomk()`: Top/bottom K values

### **Time Ranges**
- `[5m]`: 5-minute window (real-time monitoring)
- `[1h]`: 1-hour window (trend analysis)
- `[1d]`: 1-day window (daily patterns)

### **Histogram Quantiles**
- `0.50`: Median (50th percentile)
- `0.95`: 95th percentile (excludes outliers)
- `0.99`: 99th percentile (includes most outliers)

---

## 🔍 **Troubleshooting Query Issues**

### **No Data Returned**
- Check metric name spelling
- Verify time range includes data
- Confirm service is generating metrics

### **Unexpected Results**
- Review label filters
- Check for typos in label values
- Validate time range selection

### **Performance Issues**
- Use recording rules for complex queries
- Limit time ranges for large datasets
- Add appropriate label filters

These queries provide comprehensive monitoring capabilities for the BrainBytes AI platform, with special focus on Filipino user patterns and educational metrics analysis.
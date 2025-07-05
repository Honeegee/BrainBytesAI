# 🛠️ BrainBytesAI Operational Runbook

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Platform**: Heroku Cloud Platform  
**Target Audience**: DevOps Engineers, SRE, Operations Team

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Daily Operations](#daily-operations)
3. [Weekly Operations](#weekly-operations)
4. [Monthly Operations](#monthly-operations)
5. [Incident Response](#incident-response)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Emergency Procedures](#emergency-procedures)
8. [Monitoring Checklist](#monitoring-checklist)
9. [Philippine-Specific Operations](#philippine-specific-operations)
10. [Contact Information](#contact-information)
11. [Eco Dyno Management](#eco-dyno-management)

---

## 1. Quick Reference

### 🚀 Essential Commands

```bash
# Health Check All Services
curl -f https://brainbytes-backend-production.herokuapp.com/health
curl -f https://brainbytes-frontend-production.herokuapp.com
curl -f https://brainbytes-ai-production.herokuapp.com/health

# View Live Logs
heroku logs --tail --app brainbytes-backend-production
heroku logs --tail --app brainbytes-frontend-production
heroku logs --tail --app brainbytes-ai-production

# Check App Status
heroku ps --app brainbytes-backend-production
heroku ps --app brainbytes-frontend-production
heroku ps --app brainbytes-ai-production

# Restart Services (if needed)
heroku restart --app brainbytes-backend-production
heroku restart --app brainbytes-frontend-production
heroku restart --app brainbytes-ai-production
```

### 📊 Key URLs

| Environment | Service | URL | Purpose |
|-------------|---------|-----|---------|
| **Production** | Frontend | https://brainbytes-frontend-production.herokuapp.com | User Interface |
| **Production** | Backend | https://brainbytes-backend-production.herokuapp.com | API Endpoints |
| **Production** | AI Service | https://brainbytes-ai-production.herokuapp.com | AI Processing |
| **Staging** | Frontend | https://brainbytes-frontend-staging.herokuapp.com | Testing |
| **Staging** | Backend | https://brainbytes-backend-staging.herokuapp.com | API Testing |
| **Staging** | AI Service | https://brainbytes-ai-service-staging.herokuapp.com | AI Testing |

### 🔑 Critical Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Response Time | > 1000ms | > 2000ms | Investigate performance |
| Error Rate | > 1% | > 5% | Check logs, consider rollback |
| Memory Usage | > 80% | > 95% | Scale or restart |
| CPU Usage | > 70% | > 90% | Scale or optimize |
| Disk Usage | > 80% | > 95% | Clean logs, scale storage |

---

## 2. Daily Operations

### 🌅 Morning Checklist (9:00 AM Philippine Time)

```bash
#!/bin/bash
# daily-morning-check.sh

echo "🌅 Daily Morning Health Check - $(date)"
echo "================================================"

# 1. Service Health Check
echo "1. Checking service health..."
services=(
  "brainbytes-backend-production"
  "brainbytes-frontend-production"
  "brainbytes-ai-production"
)

for service in "${services[@]}"; do
  if curl -f "https://$service.herokuapp.com/health" > /dev/null 2>&1; then
    echo "✅ $service: HEALTHY"
  else
    echo "❌ $service: UNHEALTHY - REQUIRES ATTENTION"
  fi
done

# 2. Check overnight errors
echo -e "\n2. Checking overnight error logs..."
for service in "${services[@]}"; do
  error_count=$(heroku logs --app $service --num 1000 | grep -c "ERROR\|FATAL\|Exception" || echo "0")
  echo "📊 $service: $error_count errors in last 1000 log lines"
  
  if [ "$error_count" -gt 10 ]; then
    echo "⚠️  High error count detected in $service"
  fi
done

# 3. Performance check
echo -e "\n3. Quick performance test..."
for service in "${services[@]}"; do
  response_time=$(curl -o /dev/null -s -w %{time_total} "https://$service.herokuapp.com/health" || echo "timeout")
  echo "⏱️  $service response time: ${response_time}s"
done

# 4. Database connectivity (via backend health endpoint)
echo -e "\n4. Database connectivity check..."
if curl -f "https://brainbytes-backend-production.herokuapp.com/health/db" > /dev/null 2>&1; then
  echo "✅ Database: CONNECTED"
else
  echo "❌ Database: CONNECTION ISSUES"
fi

echo -e "\n================================================"
echo "Daily morning check completed at $(date)"
```

### 🌆 Evening Checklist (6:00 PM Philippine Time)

```bash
#!/bin/bash
# daily-evening-check.sh

echo "🌆 Daily Evening Summary - $(date)"
echo "================================================"

# 1. Daily usage summary
echo "1. Daily usage summary..."
echo "📊 Checking dyno hours usage..."

# 2. Performance summary
echo -e "\n2. Performance summary..."
echo "📈 Average response times today:"
# Check logs for response time patterns

# 3. Error summary
echo -e "\n3. Error summary..."
echo "🚨 Error incidents today:"
# Summarize error patterns

# 4. Philippine user activity
echo -e "\n4. Philippine user activity..."
echo "🇵🇭 Peak usage times:"
echo "📱 Mobile vs Desktop ratio:"

# 5. Prepare for overnight
echo -e "\n5. Overnight preparation..."
echo "💤 Services configured for overnight operations"
echo "📋 Tomorrow's scheduled maintenance: None"

echo -e "\n================================================"
echo "Daily evening check completed at $(date)"
```

---

## 3. Weekly Operations

### 📅 Monday: Security Review

```bash
#!/bin/bash
# weekly-security-review.sh

echo "🔒 Weekly Security Review - $(date)"
echo "================================================"

# 1. Security scan review
echo "1. Reviewing automated security scans..."
gh run list --workflow="Code Quality & Security" --limit 7

# 2. Dependency updates
echo -e "\n2. Checking for dependency updates..."
cd frontend && npm audit
cd ../backend && npm audit  
cd ../ai-service && npm audit

# 3. SSL certificate check
echo -e "\n3. SSL certificate status..."
for url in \
  "https://brainbytes-frontend-production.herokuapp.com" \
  "https://brainbytes-backend-production.herokuapp.com" \
  "https://brainbytes-ai-production.herokuapp.com"; do
  
  echo "🔒 Checking SSL for $url"
  openssl s_client -connect $(echo $url | sed 's/https:\/\///'):443 -servername $(echo $url | sed 's/https:\/\///') </dev/null 2>/dev/null | openssl x509 -noout -dates
done

# 4. Access audit
echo -e "\n4. Access audit..."
echo "👥 Reviewing GitHub repository access"
echo "🔑 Reviewing Heroku app access"
echo "🗄️ Reviewing MongoDB Atlas access"

echo -e "\n================================================"
echo "Weekly security review completed"
```

### 📅 Wednesday: Performance Review

```bash
#!/bin/bash
# weekly-performance-review.sh

echo "⚡ Weekly Performance Review - $(date)"
echo "================================================"

# 1. Response time analysis
echo "1. Response time analysis..."
echo "📊 Average response times this week:"

# 2. Resource utilization
echo -e "\n2. Resource utilization..."
for app in \
  "brainbytes-backend-production" \
  "brainbytes-frontend-production" \
  "brainbytes-ai-production"; do
  
  echo "📈 $app metrics:"
  heroku ps --app $app
done

# 3. Database performance
echo -e "\n3. Database performance..."
echo "🗄️ MongoDB Atlas performance metrics:"
echo "   - Connection pool usage"
echo "   - Query performance"
echo "   - Index effectiveness"

# 4. Philippine user experience
echo -e "\n4. Philippine user experience..."
echo "🇵🇭 Philippine-specific metrics:"
echo "   - Average page load time: [Check analytics]"
echo "   - Mobile vs desktop performance"
echo "   - Error rates by region"

echo -e "\n================================================"
echo "Weekly performance review completed"
```

### 📅 Friday: Backup and Maintenance

```bash
#!/bin/bash
# weekly-backup-maintenance.sh

echo "💾 Weekly Backup and Maintenance - $(date)"
echo "================================================"

# 1. Backup verification
echo "1. Backup verification..."
echo "✅ MongoDB Atlas automatic backups:"
echo "   - Verify latest backup completed successfully"
echo "   - Check backup retention policy"
echo "   - Test backup restoration process (monthly)"

# 2. Log cleanup
echo -e "\n2. Log cleanup and archival..."
echo "📋 Heroku logs automatically rotate"
echo "📊 Export important logs for long-term storage"

# 3. Configuration backup
echo -e "\n3. Configuration backup..."
echo "⚙️ Backing up Heroku app configurations..."
for app in \
  "brainbytes-backend-production" \
  "brainbytes-frontend-production" \
  "brainbytes-ai-production"; do
  
  echo "📝 Exporting config for $app..."
  heroku config --app $app > "config-backup-$app-$(date +%Y%m%d).txt"
done

# 4. Dependency updates
echo -e "\n4. Dependency updates..."
echo "📦 Schedule dependency updates for staging environment"
echo "🧪 Plan testing for next week"

echo -e "\n================================================"
echo "Weekly backup and maintenance completed"
```

---

## 4. Monthly Operations

### 📊 First Monday: Comprehensive Security Audit

```bash
#!/bin/bash
# monthly-security-audit.sh

echo "🔐 Monthly Comprehensive Security Audit - $(date)"
echo "================================================"

# 1. Penetration testing
echo "1. Security testing..."
echo "🛡️ Run automated penetration tests"
echo "🔍 Review security scan results"
echo "📊 Update security dashboard"

# 2. Access review
echo -e "\n2. Access review..."
echo "👥 Review all user access permissions"
echo "🔑 Rotate API keys and secrets"
echo "📋 Update access documentation"

# 3. Compliance check
echo -e "\n3. Philippine compliance check..."
echo "🇵🇭 Data Privacy Act compliance review"
echo "📚 Educational data handling audit"
echo "📝 Update privacy policy if needed"

# 4. Security training
echo -e "\n4. Team security training..."
echo "👨‍🏫 Schedule security awareness session"
echo "📖 Review incident response procedures"

echo -e "\n================================================"
echo "Monthly security audit completed"
```

### 📈 Second Monday: Performance Optimization

```bash
#!/bin/bash
# monthly-performance-optimization.sh

echo "🚀 Monthly Performance Optimization - $(date)"
echo "================================================"

# 1. Performance analysis
echo "1. Performance trend analysis..."
echo "📊 Analyze monthly performance trends"
echo "🎯 Identify optimization opportunities"
echo "📈 Compare with previous month"

# 2. Philippine-specific optimization
echo -e "\n2. Philippine user experience optimization..."
echo "🇵🇭 Analyze Philippine user behavior patterns"
echo "📱 Mobile performance optimization"
echo "🌐 CDN and caching effectiveness"

# 3. Database optimization
echo -e "\n3. Database optimization..."
echo "🗄️ MongoDB query optimization"
echo "📋 Index analysis and optimization"
echo "🔄 Connection pooling review"

# 4. Code optimization
echo -e "\n4. Code optimization review..."
echo "⚡ Bundle size analysis"
echo "🔧 Code splitting effectiveness"
echo "📦 Dependency cleanup"

echo -e "\n================================================"
echo "Monthly performance optimization completed"
```

---

## 5. Incident Response

### 🚨 Critical Incident Response (< 15 minutes)

```bash
#!/bin/bash
# critical-incident-response.sh

echo "🚨 CRITICAL INCIDENT RESPONSE ACTIVATED"
echo "Timestamp: $(date)"
echo "================================================"

# 1. Immediate triage
echo "1. IMMEDIATE TRIAGE"
echo "🔍 Identifying affected services..."

services=(
  "brainbytes-backend-production"
  "brainbytes-frontend-production"
  "brainbytes-ai-production"
)

affected_services=()
for service in "${services[@]}"; do
  if ! curl -f "https://$service.herokuapp.com/health" > /dev/null 2>&1; then
    echo "❌ AFFECTED: $service"
    affected_services+=("$service")
  else
    echo "✅ HEALTHY: $service"
  fi
done

# 2. Impact assessment
echo -e "\n2. IMPACT ASSESSMENT"
if [ ${#affected_services[@]} -eq 0 ]; then
  echo "✅ All services healthy - false alarm"
  exit 0
fi

echo "🎯 Impact: ${#affected_services[@]} service(s) affected"
echo "👥 Estimated affected users: [Calculate based on service]"

# 3. Immediate actions
echo -e "\n3. IMMEDIATE ACTIONS"
echo "📢 Notifying incident response team..."
echo "📊 Checking recent deployments..."
git log --oneline -5

echo "📋 Checking error logs..."
for service in "${affected_services[@]}"; do
  echo "🔍 Latest errors from $service:"
  heroku logs --app $service --num 50 | grep -E "ERROR|FATAL|Exception" | tail -5
done

# 4. Quick fixes
echo -e "\n4. ATTEMPTING QUICK FIXES"
for service in "${affected_services[@]}"; do
  echo "🔄 Restarting $service..."
  heroku restart --app $service
  
  echo "⏳ Waiting 30 seconds for restart..."
  sleep 30
  
  if curl -f "https://$service.herokuapp.com/health" > /dev/null 2>&1; then
    echo "✅ $service recovered after restart"
  else
    echo "❌ $service still unhealthy - escalating"
  fi
done

# 5. Escalation
echo -e "\n5. ESCALATION IF NEEDED"
echo "📞 Contact senior engineer if services still down"
echo "📱 Notify stakeholders if impact > 15 minutes"

echo -e "\n================================================"
echo "Critical incident response completed at $(date)"
```

### 📞 Incident Communication Template

```markdown
# INCIDENT NOTIFICATION

**Incident ID**: INC-$(date +%Y%m%d-%H%M)
**Severity**: [Critical/High/Medium/Low]
**Status**: [Investigating/Identified/Resolving/Resolved]
**Start Time**: $(date)

## Impact
- **Services Affected**: [List affected services]
- **Users Impacted**: [Estimate number/percentage]
- **Geographic Impact**: [Philippines/Global/Specific regions]
- **Functionality Lost**: [Describe what users can't do]

## Current Status
[Brief description of current situation]

## Actions Being Taken
1. [Action 1]
2. [Action 2]
3. [Action 3]

## Estimated Resolution
- **ETA**: [Time estimate]
- **Next Update**: [When next communication will be sent]

## Workarounds
[Any temporary workarounds available to users]

---
**Response Team**: [Names]
**Incident Commander**: [Name]
**Next Update**: [Time]
```

---

## 6. Troubleshooting Guide

### 🔧 Common Issues and Solutions

#### Frontend Issues

**Issue**: Frontend not loading
```bash
# Diagnosis
curl -I https://brainbytes-frontend-production.herokuapp.com
heroku logs --app brainbytes-frontend-production --num 100

# Common causes:
# 1. Build failure
# 2. Environment variable missing
# 3. Dependency issue

# Solutions:
# 1. Check build logs
heroku logs --app brainbytes-frontend-production | grep "build"

# 2. Verify environment variables
heroku config --app brainbytes-frontend-production

# 3. Restart application
heroku restart --app brainbytes-frontend-production
```

**Issue**: Slow frontend performance
```bash
# Diagnosis
# 1. Check bundle size
# 2. Analyze network requests
# 3. Check CDN performance

# Solutions:
# 1. Review Next.js build output
# 2. Optimize images and assets
# 3. Implement code splitting
```

#### Backend Issues

**Issue**: API endpoints returning 500 errors
```bash
# Diagnosis
heroku logs --app brainbytes-backend-production | grep "500\|ERROR\|Exception"

# Common causes:
# 1. Database connection issues
# 2. Environment variable problems
# 3. Code errors

# Solutions:
# 1. Check database connectivity
curl https://brainbytes-backend-production.herokuapp.com/health/db

# 2. Verify environment variables
heroku config --app brainbytes-backend-production

# 3. Check recent code changes
git log --oneline -10
```

**Issue**: High response times
```bash
# Diagnosis
# 1. Check database query performance
# 2. Analyze slow endpoints
# 3. Monitor resource usage

# Solutions:
# 1. Optimize database queries
# 2. Implement caching
# 3. Scale resources if needed
heroku ps:scale web=2 --app brainbytes-backend-production
```

#### AI Service Issues

**Issue**: AI service not responding
```bash
# Diagnosis
curl https://brainbytes-ai-production.herokuapp.com/health
heroku logs --app brainbytes-ai-production | grep -E "ERROR|GROQ|API"

# Common causes:
# 1. Groq API key issues
# 2. Rate limiting
# 3. Service timeout

# Solutions:
# 1. Verify Groq API key
heroku config:get GROQ_API_KEY --app brainbytes-ai-production

# 2. Check Groq API status
curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models

# 3. Restart service
heroku restart --app brainbytes-ai-production
```

#### Database Issues

**Issue**: Database connection timeouts
```bash
# Diagnosis
# 1. Check MongoDB Atlas status
# 2. Verify connection string
# 3. Check network connectivity

# Solutions:
# 1. Verify MongoDB Atlas cluster status
# 2. Check connection string format
# 3. Restart backend services
heroku restart --app brainbytes-backend-production
```

### 🇵🇭 Philippine-Specific Issues

#### Slow Performance for Philippine Users

```bash
# Diagnosis checklist:
echo "🇵🇭 Philippine User Performance Diagnosis"
echo "1. Check CDN effectiveness"
echo "2. Analyze mobile vs desktop performance"
echo "3. Review compression settings"
echo "4. Check image optimization"

# Solutions:
# 1. Implement Progressive Web App features
# 2. Optimize for mobile-first
# 3. Enhance caching strategies
# 4. Minimize data transfer
```

#### High Mobile Error Rates

```bash
# Diagnosis:
echo "📱 Mobile Error Rate Analysis"
echo "1. Check responsive design issues"
echo "2. Analyze touch interface problems"
echo "3. Review mobile-specific JavaScript errors"

# Solutions:
# 1. Test on actual mobile devices
# 2. Implement touch-friendly interfaces
# 3. Add mobile-specific error handling
```

---

## 7. Emergency Procedures

### 🚨 Total Service Outage

```bash
#!/bin/bash
# emergency-total-outage.sh

echo "🚨 EMERGENCY: TOTAL SERVICE OUTAGE"
echo "Timestamp: $(date)"
echo "================================================"

# 1. Immediate notification
echo "1. IMMEDIATE NOTIFICATION"
echo "📢 Alert all stakeholders immediately"
echo "📱 Activate emergency communication channels"

# 2. Rapid assessment
echo -e "\n2. RAPID ASSESSMENT"
echo "🔍 Check all services quickly"
for service in brainbytes-backend-production brainbytes-frontend-production brainbytes-ai-production; do
  echo "Checking $service..."
  curl -f "https://$service.herokuapp.com/health" || echo "❌ $service DOWN"
done

# 3. Check external dependencies
echo -e "\n3. EXTERNAL DEPENDENCIES"
echo "🌐 Checking Heroku status: https://status.heroku.com"
echo "🗄️ Checking MongoDB Atlas status"
echo "🧠 Checking Groq API status"

# 4. Emergency rollback
echo -e "\n4. EMERGENCY ROLLBACK"
echo "🔄 Consider immediate rollback to last known good state"
echo "Command: heroku rollback --app [service-name]"

# 5. Status page update
echo -e "\n5. STATUS PAGE UPDATE"
echo "📢 Update status page immediately"
echo "📧 Send customer notification"

echo -e "\n================================================"
echo "Emergency procedures initiated"
```

### 🔄 Emergency Rollback

```bash
#!/bin/bash
# emergency-rollback.sh

SERVICE=$1
if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service-name>"
  exit 1
fi

echo "🔄 EMERGENCY ROLLBACK: $SERVICE"
echo "Timestamp: $(date)"
echo "================================================"

# 1. Get current release
echo "1. Current release information:"
heroku releases --app $SERVICE | head -5

# 2. Perform rollback
echo -e "\n2. Performing rollback..."
heroku rollback --app $SERVICE

# 3. Verify rollback
echo -e "\n3. Verifying rollback..."
sleep 30
if curl -f "https://$SERVICE.herokuapp.com/health" > /dev/null 2>&1; then
  echo "✅ Rollback successful - service responding"
else
  echo "❌ Rollback failed - service still down"
fi

# 4. Notification
echo -e "\n4. Notification sent"
echo "📢 Team notified of emergency rollback"

echo -e "\n================================================"
echo "Emergency rollback completed"
```

---

## 8. Monitoring Checklist

### 📊 Real-time Monitoring Dashboard

```bash
#!/bin/bash
# monitoring-dashboard.sh

while true; do
  clear
  echo "🖥️  BRAINBYTESAI MONITORING DASHBOARD"
  echo "Updated: $(date)"
  echo "================================================"
  
  # Service health
  echo "🏥 SERVICE HEALTH"
  services=(
    "brainbytes-backend-production"
    "brainbytes-frontend-production"
    "brainbytes-ai-production"
  )
  
  for service in "${services[@]}"; do
    if curl -f "https://$service.herokuapp.com/health" > /dev/null 2>&1; then
      echo "✅ $service"
    else
      echo "❌ $service - NEEDS ATTENTION"
    fi
  done
  
  # Performance metrics
  echo -e "\n⚡ PERFORMANCE METRICS"
  for service in "${services[@]}"; do
    response_time=$(curl -o /dev/null -s -w %{time_total} "https://$service.herokuapp.com/health" 2>/dev/null || echo "timeout")
    echo "⏱️  $service: ${response_time}s"
  done
  
  # Error rates
  echo -e "\n🚨 ERROR MONITORING"
  for service in "${services[@]}"; do
    recent_errors=$(heroku logs --app $service --num 100 | grep -c "ERROR\|FATAL" || echo "0")
    echo "📊 $service: $recent_errors recent errors"
  done
  
  # Philippine-specific metrics
  echo -e "\n🇵🇭 PHILIPPINE METRICS"
  echo "📱 Mobile traffic: [Monitor via analytics]"
  echo "⚡ Average PH response time: [Monitor via APM]"
  echo "📊 PH error rate: [Monitor via logs]"
  
  echo -e "\n================================================"
  echo "Press Ctrl+C to exit monitoring"
  
  sleep 30
done
```

### 📋 Weekly Monitoring Report

```bash
#!/bin/bash
# weekly-monitoring-report.sh

echo "📊 WEEKLY MONITORING REPORT"
echo "Week of: $(date -d 'last monday' +%Y-%m-%d) to $(date +%Y-%m-%d)"
echo "================================================"

# 1. Uptime summary
echo "1. UPTIME SUMMARY"
echo "✅ Target uptime: 99.9%"
echo "📊 Actual uptime: [Calculate from monitoring data]"

# 2. Performance summary
echo -e "\n2. PERFORMANCE SUMMARY"
echo "⚡ Average response time: [From monitoring]"
echo "🎯 95th percentile: [From monitoring]"
echo "📈 Performance trend: [Improving/Stable/Degrading]"

# 3. Error analysis
echo -e "\n3. ERROR ANALYSIS"
echo "🚨 Total errors this week: [Count]"
echo "📉 Error rate: [Percentage]"
echo "🔍 Top error categories:"
echo "   - Database connection errors: [Count]"
echo "   - API timeout errors: [Count]"
echo "   - Authentication errors: [Count]"

# 4. Philippine user metrics
echo -e "\n4. PHILIPPINE USER METRICS"
echo "🇵🇭 Philippine traffic percentage: [Percentage]"
echo "📱 Mobile vs desktop ratio: [Ratio]"
echo "⚡ Average PH response time: [Time]"
echo "📊 PH-specific error rate: [Rate]"

# 5. Recommendations
echo -e "\n5. RECOMMENDATIONS"
echo "🎯 Performance optimizations needed:"
echo "🔧 Infrastructure improvements:"
echo "📚 Process improvements:"

echo -e "\n================================================"
echo "Weekly monitoring report completed"
```

---

## 9. Philippine-Specific Operations

### 🇵🇭 Philippine User Experience Monitoring

```bash
#!/bin/bash
# philippine-user-monitoring.sh

echo "🇵🇭 PHILIPPINE USER EXPERIENCE MONITORING"
echo "Timestamp: $(date)"
echo "================================================"

# 1. Mobile performance
echo "1. MOBILE PERFORMANCE"
echo "📱 Mobile traffic analysis:"
echo "   - Check mobile response times"
echo "   - Analyze mobile error rates"
echo "   - Review touch interface issues"

# 2. Connectivity monitoring
echo -e "\n2. CONNECTIVITY MONITORING"
echo "🌐 Connection quality analysis:"
echo "   - Average connection speed from PH"
echo "   - Connection drop rates"
echo "   - Peak usage hours"

# 3. Data usage optimization
echo -e "\n3. DATA USAGE OPTIMIZATION"
echo "📊 Data transfer analysis:"
echo "   - Average page size for PH users"
echo "   - Image optimization effectiveness"
echo "   - Compression ratio analysis"

# 4. Regional performance
echo -e "\n4. REGIONAL PERFORMANCE"
echo "🏝️ Regional breakdown:"
echo "   - Luzon performance metrics"
echo "   - Visayas performance metrics"
echo "   - Mindanao performance metrics"

echo -e "\n================================================"
echo "Philippine monitoring completed"
```

### 📱 Mobile-First Optimization Check

```bash
#!/bin/bash
# mobile-optimization-check.sh

echo "📱 MOBILE-FIRST OPTIMIZATION CHECK"
echo "================================================"

# 1. Responsive design validation
echo "1. RESPONSIVE DESIGN VALIDATION"
echo "🖥️ Testing responsive breakpoints"
echo "📏 Validating touch target sizes"
echo "🎨 Checking mobile UI elements"

# 2. Performance optimization
echo -e "\n2. PERFORMANCE OPTIMIZATION"
echo "⚡ Mobile page load speed:"
curl -o /dev/null -s -w "Load time: %{time_total}s\nSize: %{size_download} bytes\n" \
  "https://brainbytes-frontend-production.herokuapp.com"

# 3. Offline capability
echo -e "\n3. OFFLINE CAPABILITY"
echo "💾 Service worker status: [Check browser dev tools]"
echo "📱 Cached resources: [Verify cache implementation]"
echo "🔄 Background sync: [Test offline actions]"

# 4. Mobile-specific features
echo -e "\n4. MOBILE-SPECIFIC FEATURES"
echo "👆 Touch gestures: [Validate swipe/pinch]"
echo "📳 Haptic feedback: [Check vibration API]"
echo "🔄 Pull-to-refresh: [Test refresh mechanism]"

echo -e "\n================================================"
echo "Mobile optimization check completed"
```

---

## 10. Contact Information

### 📞 Emergency Contacts

| Role | Contact | Availability | Escalation |
|------|---------|--------------|------------|
| **Primary On-Call** | [Name/Phone] | 24/7 | 15 minutes |
| **Secondary On-Call** | [Name/Phone] | 24/7 | 30 minutes |
| **Senior Engineer** | [Name/Phone] | Business hours | 1 hour |
| **DevOps Lead** | [Name/Phone] | Business hours | 2 hours |
| **Project Manager** | [Name/Phone] | Business hours | 4 hours |

### 🏢 Vendor Contacts

| Service | Support Contact | Documentation | Status Page |
|---------|----------------|---------------|-------------|
| **Heroku** | https://help.heroku.com | https://devcenter.heroku.com | https://status.heroku.com |
| **MongoDB Atlas** | https://support.mongodb.com | https://docs.atlas.mongodb.com | https://status.mongodb.com |
| **Groq** | support@groq.com | https://console.groq.com/docs | https://status.groq.com |
| **GitHub** | https://support.github.com | https://docs.github.com | https://www.githubstatus.com |

### 📧 Communication Channels

| Type | Channel | Purpose | Audience |
|------|---------|---------|----------|
| **Critical Alerts** | [Email/Slack] | Immediate incident notification | All team members |
| **Status Updates** | [Slack Channel] | Regular status communications | Development team |
| **User Communications** | [Status Page] | Customer-facing updates | End users |
| **Post-Incident** | [Email/Document] | Incident review and learnings | Stakeholders |

### 📱 Philippine Time Zone Considerations

- **Philippine Standard Time (PST)**: UTC+8
- **Business Hours**: 9:00 AM - 6:00 PM PST
- **Peak Usage**: 7:00 PM - 11:00 PM PST (After work/school)
- **Maintenance Window**: 2:00 AM - 4:00 AM PST (Minimal usage)

---

## 📝 Document Maintenance

- **Review Frequency**: Monthly
- **Update Triggers**: Incident learnings, process changes, contact updates
- **Approval Required**: DevOps Lead, Senior Engineer
- **Distribution**: All team members, stakeholders

---

**Last Updated**: December 2024  
**Document Owner**: DevOps Team  
**Next Review**: January 2025

This operational runbook provides comprehensive guidance for day-to-day operations, incident response, and Philippines-specific considerations for the BrainBytesAI application deployed on Heroku.

---

## 11. Eco Dyno Management

### Cost Optimization - Eco Dynos

#### Current Production Apps (Eco Dyno Configuration)
```bash
# Production apps using eco dynos ($5/month each):
# - brainbytes-backend-production-d355616d0f1f
# - brainbytes-ai-production-3833f742ba79  
# - brainbytes-frontend-production-03d1e6b6b158
# Total cost: $15/month

# Check current dyno types
heroku ps --app brainbytes-backend-production-d355616d0f1f
heroku ps --app brainbytes-ai-production-3833f742ba79
heroku ps --app brainbytes-frontend-production-03d1e6b6b158

# Switch to eco dynos (if not already)
heroku ps:type eco --app brainbytes-backend-production-d355616d0f1f
heroku ps:type eco --app brainbytes-ai-production-3833f742ba79
heroku ps:type eco --app brainbytes-frontend-production-03d1e6b6b158

# Scale to 1 dyno each (recommended for eco)
heroku ps:scale web=1 --app brainbytes-backend-production-d355616d0f1f
heroku ps:scale web=1 --app brainbytes-ai-production-3833f742ba79
heroku ps:scale web=1 --app brainbytes-frontend-production-03d1e6b6b158
```

#### Eco Dyno Benefits
- **Cost**: $5/month per dyno (vs $25 for standard-1x)
- **Always On**: Never sleeps (unlike free dynos)
- **Memory**: 512MB RAM (sufficient for most small apps)
- **Performance**: Good for low-moderate traffic

#### When to Upgrade from Eco
```bash
# Upgrade to standard-1x if experiencing:
# - High memory usage (>80% of 512MB)
# - Slow response times consistently
# - High traffic (>10,000 requests/hour)

# Upgrade commands:
heroku ps:type standard-1x --app [APP_NAME]
```

#### Performance Issues

**Issue**: Backend performance slow
```bash
# Diagnosis
# 1. Check database query performance
# 2. Analyze slow endpoints
# 3. Monitor resource usage

# Solutions:
# 1. Optimize database queries
# 2. Implement caching
# 3. Scale resources if needed (for eco dynos, consider upgrading type instead of scaling)
heroku ps:type standard-1x --app brainbytes-backend-production-d355616d0f1f
```
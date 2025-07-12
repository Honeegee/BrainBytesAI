# 📋 Manual Testing Guide - Step by Step
## How to Test Your Prometheus Monitoring (No Technical Background Needed)

### 🎯 What We're Testing
You have a monitoring system that watches your BrainBytes application. Think of it like a dashboard in a car - it shows you if everything is running well.

---

## 📱 **Step 1: Open Your Web Browser**

Just like opening any website, open your web browser (Chrome, Firefox, Edge, etc.)

---

## 🔍 **Step 2: Test the Main Dashboard (Prometheus)**

### **What to do:**
1. In your browser address bar, type: `http://localhost:9090`
2. Press Enter

### **What you should see:**
- A web page that says "Prometheus" at the top
- Some menus and a search box
- If you see this = ✅ **SUCCESS!**
- If you get "page can't be reached" = ❌ **Problem**

### **What this means:**
This is your main monitoring dashboard. It's like the "control center" that watches everything.

---

## 📊 **Step 3: Check if Everything is Being Watched**

### **What to do:**
1. In the Prometheus page you just opened
2. Click on "Status" in the top menu
3. Click on "Targets" from the dropdown

### **What you should see:**
A list showing 5 items, all with **green "UP"** status:
- `brainbytes-ai-service` - UP ✅
- `brainbytes-backend` - UP ✅ 
- `cadvisor` - UP ✅
- `node-exporter` - UP ✅
- `prometheus` - UP ✅

### **What this means:**
All 5 parts of your system are being watched and are healthy. It's like having 5 green lights on your car dashboard.

---

## 🔧 **Step 4: Test Your Backend Application**

### **What to do:**
1. Open a new browser tab
2. Type: `http://localhost/health`
3. Press Enter

### **What you should see:**
Something like this text:
```json
{"status":"healthy","timestamp":"2025-06-25T06:00:58.228Z","uptime":1631.573522259,"version":"1.0.0","environment":"development","database":{"state":"connected","stateCode":1},"port":"3000","pid":8}
```

### **What this means:**
- Your main application is running ✅
- It's connected to the database ✅
- Everything is "healthy" ✅

---

## 📈 **Step 5: Test Your Application Metrics**

### **What to do:**
1. Open a new browser tab
2. Type: `http://localhost/metrics`
3. Press Enter

### **What you should see:**
A long page with lots of lines that look like:
```
# HELP brainbytes_http_requests_total Total number of HTTP requests
# TYPE brainbytes_http_requests_total counter
brainbytes_http_requests_total{method="GET",route="/health",status_code="200",app="brainbytes-backend"} 2
```

### **What this means:**
Your application is collecting data about:
- How many people visit your website
- How fast it responds
- If there are any errors
- All your custom homework metrics ✅

---

## 🤖 **Step 6: Test Your AI Service Metrics**

### **What to do:**
1. Open a new browser tab
2. Type: `http://localhost:8090/metrics`
3. Press Enter

### **What you should see:**
Another long page with lines like:
```
# HELP brainbytes_ai_requests_total Total number of AI requests
brainbytes_ai_requests_total{endpoint="/health",model="default",status="success",app="brainbytes-ai-service"} 2
```

### **What this means:**
Your AI service is collecting data about:
- How many AI questions are asked
- How long AI takes to respond
- What subjects are most popular
- All your AI-specific homework metrics ✅

---

## 🎮 **Step 7: Test a Real Query (The Fun Part!)**

### **What to do:**
1. Go back to your Prometheus tab (`http://localhost:9090`)
2. Find the search box (it might say "Expression")
3. Type exactly: `brainbytes_http_requests_total`
4. Click the blue "Execute" button

### **What you should see:**
- A table showing your website visits
- Numbers showing how many times each page was visited
- Maybe a graph if you click the "Graph" tab

### **What this means:**
You can now ask questions about your application! This is like asking "How busy is my website?" and getting real answers.

---

## 🚀 **Step 8: Try More Fun Queries**

Copy and paste these one at a time into the search box and click "Execute":

### **Query 1: How fast is my website?**
```
rate(brainbytes_http_requests_total[5m])
```
**What it shows:** Requests per second

### **Query 2: Are there any errors?**
```
brainbytes_http_requests_total{status_code="500"}
```
**What it shows:** Any broken pages (should be empty = good!)

### **Query 3: How is my AI service doing?**
```
brainbytes_ai_requests_total
```
**What it shows:** How many AI questions were asked

---

## 📱 **Step 9: Test Other Monitoring Tools**

### **Container Monitor (cAdvisor):**
1. Type: `http://localhost:8081`
2. Should show fancy graphs of your Docker containers

### **Alert Manager:**
1. Type: `http://localhost:9093`
2. Should show an alerts dashboard (probably empty = good!)

---

## ✅ **Success Checklist**

Check off each item as you test:

- [ ] Prometheus dashboard opens (Step 2)
- [ ] All 5 targets show "UP" (Step 3)  
- [ ] Health check returns "healthy" (Step 4)
- [ ] Backend metrics page loads with data (Step 5)
- [ ] AI service metrics page loads with data (Step 6)
- [ ] Can run queries and see results (Step 7)
- [ ] Additional monitoring tools work (Step 9)

**If you checked all boxes: 🎉 EVERYTHING IS WORKING!**

---

## 🚨 **If Something Doesn't Work**

### **Problem: Page won't load**
**Solution:** Make sure Docker is running
```bash
docker-compose ps
```
All containers should say "Up"

### **Problem: Shows "DOWN" instead of "UP"**
**Solution:** Restart the service
```bash
docker-compose restart
```

### **Problem: No data in metrics**
**Solution:** Use the website a bit, then check again
- Visit `http://localhost/health` a few times
- Visit `http://localhost:8090/health` a few times
- Then check metrics again

---

## 🎓 **What This Proves for Your Homework**

When everything works, you can tell your teacher:

1. ✅ **"I have Prometheus monitoring setup"** - Step 2 works
2. ✅ **"All my services are being monitored"** - Step 3 shows 5 UP targets
3. ✅ **"I have custom metrics collecting data"** - Steps 5-6 show your custom metrics
4. ✅ **"I can query my metrics"** - Step 7-8 show you can ask questions
5. ✅ **"My monitoring works end-to-end"** - Everything above works

**This proves your homework is complete and working! 🎉**

---

## 📞 **Need Help?**

If any step doesn't work:
1. Take a screenshot of what you see
2. Tell me which step number failed
3. Copy any error messages you see

The most important thing: **Steps 2, 3, 5, and 6 must work** for your homework to be complete.
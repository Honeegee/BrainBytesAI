# Grafana Step-by-Step Tutorial

## Tutorial Overview
This tutorial provides hands-on, step-by-step instructions for common Grafana tasks in your BrainBytesAI monitoring setup.

## Prerequisites
- Grafana running at `http://localhost:3000`
- Prometheus data source configured
- Access credentials (admin/admin by default)

---

## Tutorial 1: First Login and Dashboard Overview

### Step 1: Access Grafana
1. Open your web browser
2. Navigate to `http://localhost:3000`
3. Enter credentials:
   - Username: `admin`
   - Password: `admin` (or your configured password)
4. Click "Log in"

### Step 2: Explore the Interface
1. **Left Sidebar**: Main navigation menu
2. **Top Bar**: Search, alerts, user profile
3. **Main Area**: Dashboard content
4. **Time Picker**: Top-right corner (shows current time range)

### Step 3: View Pre-built Dashboards
1. Click "Dashboards" in left sidebar
2. Click "Browse"
3. Click "BrainBytes" folder
4. Click "System Overview" dashboard
5. Observe the various panels showing system metrics

### Step 4: Navigate Dashboard Features
1. **Change Time Range**: Click time picker (top-right) → Select "Last 6 hours"
2. **Refresh Data**: Click refresh button next to time picker
3. **Auto-refresh**: Click dropdown next to refresh → Select "30s"
4. **Full Screen**: Click any panel title → "View" → "Full screen"
5. **Exit Full Screen**: Press `Esc` key

---

## Tutorial 2: Creating Your First Custom Dashboard

### Step 1: Create New Dashboard
1. Click "+" in left sidebar
2. Select "Dashboard"
3. You'll see an empty dashboard with "Add new panel" option

### Step 2: Add Your First Panel
1. Click "Add new panel"
2. You'll enter the panel editor

### Step 3: Configure a CPU Usage Panel
1. **In Query Tab**:
   - Data source should show "Prometheus"
   - In query field, enter:
     ```promql
     100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
     ```
   - Click "Run query" to see preview

2. **In Panel Options (right side)**:
   - Title: `CPU Usage`
   - Description: `Average CPU usage across all instances`

3. **In Field Options**:
   - Unit: Select "Percent (0-100)"
   - Min: `0`
   - Max: `100`

4. **In Thresholds**:
   - Click "Add threshold"
   - Value: `70`, Color: Yellow
   - Click "Add threshold"
   - Value: `85`, Color: Red

5. Click "Apply" (top-right)

### Step 4: Add Memory Usage Panel
1. Click "Add panel" → "Add new panel"
2. **Query**:
   ```promql
   (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
   ```
3. **Panel Options**:
   - Title: `Memory Usage`
   - Unit: Percent (0-100)
4. **Thresholds**: 80% (Yellow), 90% (Red)
5. Click "Apply"

### Step 5: Save Dashboard
1. Click "Save dashboard" (disk icon, top bar)
2. **Dashboard name**: `My First Dashboard`
3. **Folder**: Select "BrainBytes"
4. **Description**: `Custom dashboard for learning`
5. Click "Save"

---

## Tutorial 3: Exploring Data with Queries

### Step 1: Open Explore
1. Click "Explore" in left sidebar (compass icon)
2. Ensure "Prometheus" is selected as data source

### Step 2: Basic Metric Exploration
1. **Simple Query**: Type `up` and press Enter
   - Shows which services are up (1) or down (0)

2. **Time Series Query**: Type `rate(http_requests_total[5m])` and press Enter
   - Shows request rate over time

3. **Aggregated Query**: Type `sum(rate(http_requests_total[5m])) by (method)`
   - Shows request rate grouped by HTTP method

### Step 3: Query Builder Practice
1. Click "Code" to switch to "Builder" mode
2. **Metric**: Select from dropdown (e.g., `node_cpu_seconds_total`)
3. **Labels**: Add filters (e.g., `mode != "idle"`)
4. **Operations**: Add `rate` function with `5m` range
5. Switch back to "Code" to see generated query

### Step 4: Time Range and Visualization
1. **Change Time Range**: Use time picker (top-right)
2. **Split View**: Click "Split" to compare queries
3. **Table View**: Click "Table" tab to see data in tabular format
4. **Export**: Click "Inspector" → "Data" → "Download CSV"

---

## Tutorial 4: Setting Up Your First Alert

### Step 1: Navigate to Alerting
1. Click "Alerting" in left sidebar (bell icon)
2. Click "Alert rules"
3. Click "New rule"

### Step 2: Configure Alert Query
1. **Section A - Set query and alert condition**:
   - Data source: Prometheus
   - Query: 
     ```promql
     100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
     ```
   - Click "Preview" to test query

2. **Section B - Alert condition**:
   - Condition: `IS ABOVE`
   - Threshold: `80`

### Step 3: Set Evaluation Behavior
1. **Section C - Alert evaluation behavior**:
   - Folder: Select "BrainBytes"
   - Evaluation group: `cpu-alerts`
   - Evaluation interval: `1m`
   - For: `5m` (alert fires after condition is true for 5 minutes)

### Step 4: Add Alert Details
1. **Section D - Add details for your alert rule**:
   - Rule name: `High CPU Usage`
   - Summary: `CPU usage is above 80%`
   - Description: `Average CPU usage across all instances has exceeded 80% for more than 5 minutes`

### Step 5: Save Alert Rule
1. Click "Save rule and exit"
2. Your alert rule is now active

### Step 6: Test Alert (Optional)
1. Go back to Explore
2. Run a CPU-intensive process to trigger the alert
3. Check "Alert rules" to see if alert fires

---

## Tutorial 5: Customizing Panel Visualizations

### Step 1: Edit Existing Panel
1. Go to "System Overview" dashboard
2. Click on any panel title
3. Select "Edit"

### Step 2: Change Visualization Type
1. **In Panel Options**:
   - Click "Visualization" dropdown
   - Try different types: Stat, Gauge, Bar chart
   - Observe how data presentation changes

### Step 3: Customize Appearance
1. **For Time Series Panels**:
   - Graph styles: Line width, Fill opacity
   - Legend: Position, values to display
   - Axes: Labels, units, min/max values

2. **For Stat Panels**:
   - Value options: Show, calculation method
   - Text size: Auto, or custom size
   - Color mode: Value, background

### Step 4: Add Panel Links
1. **In Panel Options**:
   - Scroll to "Panel links"
   - Click "Add link"
   - Title: `View Details`
   - URL: Link to related dashboard
   - Click "Apply"

### Step 5: Configure Value Mappings
1. **In Field Options**:
   - Scroll to "Value mappings"
   - Click "Add value mapping"
   - Type: "Value" or "Range"
   - Map values to text/colors (e.g., 0 = "Down", 1 = "Up")

---

## Tutorial 6: Using Dashboard Variables

### Step 1: Add Dashboard Variable
1. Open any dashboard
2. Click "Dashboard settings" (gear icon)
3. Click "Variables" tab
4. Click "New variable"

### Step 2: Configure Instance Variable
1. **General**:
   - Name: `instance`
   - Type: `Query`
   - Label: `Instance`

2. **Query Options**:
   - Data source: Prometheus
   - Query: `label_values(up, instance)`
   - Refresh: "On Dashboard Load"

3. **Selection Options**:
   - Multi-value: Enable
   - Include All option: Enable

4. Click "Update"

### Step 3: Use Variable in Panel
1. Edit any panel in the dashboard
2. Modify query to use variable:
   ```promql
   100 - (avg(rate(node_cpu_seconds_total{mode="idle", instance=~"$instance"}[5m])) * 100)
   ```
3. Click "Apply"

### Step 4: Test Variable
1. Save dashboard
2. Use variable dropdown at top of dashboard
3. Select different instances
4. Observe how panels update

---

## Tutorial 7: Dashboard Sharing and Export

### Step 1: Share Dashboard
1. Open any dashboard
2. Click "Share dashboard" (share icon)
3. **Link Tab**: Copy shareable URL
4. **Snapshot Tab**: Create point-in-time snapshot
5. **Export Tab**: Download JSON for backup

### Step 2: Create Snapshot
1. In Share dialog, click "Snapshot" tab
2. **Snapshot name**: `System Status - $(date)`
3. **Expire**: Set expiration time
4. **External snapshot**: Enable if sharing externally
5. Click "Local Snapshot"
6. Copy generated URL

### Step 3: Export Dashboard
1. In Share dialog, click "Export" tab
2. **Export for sharing externally**: Enable
3. **Save to file**: Downloads JSON file
4. Store file for backup/version control

### Step 4: Import Dashboard
1. Click "+" in sidebar → "Import"
2. **Upload JSON file**: Select exported file
3. **Or paste JSON**: Copy/paste dashboard JSON
4. Configure import options
5. Click "Import"

---

## Tutorial 8: Troubleshooting Common Issues

### Issue 1: No Data in Panels

**Step 1: Check Data Source**
1. Go to Configuration → Data sources
2. Click "Prometheus"
3. Click "Save & Test"
4. Should show "Data source is working"

**Step 2: Verify Query**
1. Go to Explore
2. Test your query
3. Check if data returns

**Step 3: Check Time Range**
1. Ensure time range includes data
2. Try "Last 24 hours"

### Issue 2: Slow Dashboard Loading

**Step 1: Optimize Queries**
1. Edit slow panels
2. Reduce time range in queries
3. Use recording rules for complex queries

**Step 2: Reduce Panel Count**
1. Remove unnecessary panels
2. Combine related metrics

### Issue 3: Alert Not Firing

**Step 1: Test Alert Query**
1. Go to Explore
2. Run alert query
3. Verify it returns expected values

**Step 2: Check Alert Rule**
1. Go to Alerting → Alert rules
2. Click on your rule
3. Check "State history" tab

---

## Practice Exercises

### Exercise 1: Create Application Dashboard
Create a dashboard with these panels:
1. HTTP Request Rate
2. HTTP Error Rate
3. Response Time (95th percentile)
4. Active Database Connections

### Exercise 2: Set Up Monitoring Alerts
Create alerts for:
1. High memory usage (>85%)
2. High error rate (>5%)
3. Service down (up == 0)

### Exercise 3: Build Business Metrics Dashboard
Create panels showing:
1. User registrations per hour
2. Revenue metrics
3. Feature usage statistics
4. Geographic user distribution

---

## Next Steps

After completing these tutorials:

1. **Explore Advanced Features**:
   - Annotations
   - Playlist
   - Templating
   - Transformations

2. **Integration**:
   - Connect additional data sources
   - Set up notification channels
   - Implement custom metrics

3. **Automation**:
   - Use Grafana API
   - Implement dashboard as code
   - Set up automated backups

4. **Performance Optimization**:
   - Optimize queries
   - Use recording rules
   - Configure caching

Remember: Practice is key to mastering Grafana. Start with simple dashboards and gradually add complexity as you become more comfortable with the interface and query language.
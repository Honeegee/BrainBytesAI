# Security and Resource Monitoring

This document outlines how to use the built-in security and resource monitoring tools for the BrainBytes AI application.

## Prerequisites

1. Windows with PowerShell
2. Docker Desktop for Windows must be running properly
3. WSL 2 backend must be enabled for Docker Desktop
4. Docker images must be built first:
   ```powershell
   docker compose build
   ```
   This will create:
   - brainbytesai-frontend:latest
   - brainbytesai-backend:latest
   - brainbytesai-ai-service:latest
5. Internet connection (for Trivy to fetch vulnerability databases)

## Docker Setup Verification

Before running security scans or applying updates, verify Docker is set up correctly:

1. Ensure Docker Desktop is running:
   - Check the Docker Desktop icon in system tray
   - Open Docker Desktop to verify its status

2. Verify WSL 2 backend:
   ```powershell
   wsl --status
   ```
   Should show WSL version 2 as default

3. Test Docker functionality:
   ```powershell
   docker --version
   docker ps
   ```
   Should show Docker version and running containers without errors

4. If you see pipe errors:
   - Restart Docker Desktop
   - Open PowerShell as Administrator and run:
     ```powershell
     net stop com.docker.service
     net start com.docker.service
     ```
   - Restart your terminal/VSCode

## Security Updates

When security vulnerabilities are detected, follow these steps to apply updates:

1. Verify Docker is running correctly (see Docker Setup Verification above)

2. Update Backend Dependencies:
   ```powershell
   cd backend
   npm install
   ```

3. Update Frontend Dependencies:
   ```powershell
   cd frontend
   npm install
   ```

4. Rebuild Docker Images:
   ```powershell
   docker compose build
   ```

5. Run Security Scan to Verify:
   ```powershell
   npm run security-scan
   ```

Latest Security Updates (2025-05-23):
- Backend:
  - mongoose updated to ^8.9.5 (from ^5.13.7)
  - axios updated to ^1.8.2
  - added cross-spawn ^7.0.5
- Frontend:
  - axios updated to ^1.8.2 (from ^0.24.0)

## Resource Usage Monitoring

To start continuous container resource monitoring:

```powershell
npm run monitor
```

This will:
- Start a continuous monitoring session that runs until you press Ctrl+C
- Monitor all running containers in real-time
- Display resource usage statistics every 5 seconds
- Show color-coded status:
  - Green: Memory usage below 80% threshold
  - Red: Memory usage exceeds 80% threshold

### Sample Output
```
Monitoring container resource usage...
brainbytesai-frontend: 45.2% - OK
brainbytesai-backend: 32.1% - OK
brainbytesai-ai-service: 28.7% - OK

WARNING: brainbytesai-frontend memory usage (82.5%) exceeds threshold (80.0%)
```

## Security Scanning

To run security scans on all container images:

```powershell
npm run security-scan
```

The script will:
1. Check if Docker is running
2. Verify all required images exist locally
3. Create a 'security-reports' directory to store scan results
4. Run Trivy to scan each image for vulnerabilities
5. Generate detailed reports and a summary

### Scan Reports

After running the security scan, you'll find:

1. **Individual Reports**: For each container image in the `security-reports` directory:
   - `YYYY-MM-DD_HH-mm-ss_brainbytesai-frontend-latest.txt`
   - `YYYY-MM-DD_HH-mm-ss_brainbytesai-backend-latest.txt`
   - `YYYY-MM-DD_HH-mm-ss_brainbytesai-ai-service-latest.txt`

2. **Summary Report**: `YYYY-MM-DD_HH-mm-ss_summary.txt`
   - Quick overview of findings for all images
   - Count of vulnerabilities found in each image
   - Status of each scan

### Understanding Results

The security scan checks for HIGH and CRITICAL severity vulnerabilities and provides:
- Package names and versions affected
- CVE (Common Vulnerabilities and Exposures) IDs
- Severity ratings
- Links to vulnerability details
- Recommended fixes when available

Example summary output:
```
Security Scan Summary - 2025-05-23_01-30-00

brainbytesai-frontend:latest : No vulnerabilities found
brainbytesai-backend:latest : 2 vulnerabilities found
brainbytesai-ai-service:latest : No vulnerabilities found
```

### Taking Action

If vulnerabilities are found:
1. Review the detailed report for the affected image
2. Update vulnerable packages in the corresponding package.json
3. Run npm install in the affected service directory
4. Rebuild the affected container: `docker compose build <service-name>`
5. Run the security scan again to verify fixes

### Common Docker Issues

1. **Pipe Errors**:
   ```
   error during connect: ... open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
   ```
   Solution:
   - Restart Docker Desktop
   - Run Docker Desktop as Administrator
   - Reset Docker Desktop to factory defaults if issue persists

2. **WSL Issues**:
   ```
   Error: WSL 2 installation is incomplete
   ```
   Solution:
   - Update WSL: `wsl --update`
   - Enable WSL 2: `wsl --set-default-version 2`
   - Install Windows Subsystem for Linux if needed

3. **Permission Issues**:
   - Run PowerShell as Administrator
   - Check Docker Desktop settings
   - Verify user is in docker-users group

### Troubleshooting

If you encounter any issues:

1. Ensure Docker Desktop is running properly
2. Verify the container images exist locally:
   ```powershell
   docker images | findstr brainbytesai
   ```
3. Check Docker daemon is accessible:
   ```powershell
   docker info
   ```
4. Ensure you have internet access for Trivy vulnerability database updates
5. Check the 'security-reports' directory exists and is writable

### Notes

- Resource monitoring runs continuously until stopped with Ctrl+C
- The monitoring script uses color-coded output for better visibility
- Security scan reports are timestamped for tracking changes over time
- Keep the 'security-reports' directory for historical vulnerability tracking
- The security scan may take a few minutes on first run while Trivy downloads vulnerability databases
- Always review security reports after dependency updates
- If Docker issues persist, try resetting Docker Desktop settings

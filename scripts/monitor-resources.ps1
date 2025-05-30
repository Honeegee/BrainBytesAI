# Check execution policy
$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($currentPolicy -eq "Restricted" -or $currentPolicy -eq "AllSigned") {
    Write-Host "PowerShell script execution is currently restricted." -ForegroundColor Red
    Write-Host "Please run one of the following commands to enable script execution:" -ForegroundColor Yellow
    Write-Host "`nOption 1 - For current session only:" -ForegroundColor Cyan
    Write-Host "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"
    Write-Host "`nOption 2 - Permanently for current user (requires admin rights):" -ForegroundColor Cyan
    Write-Host "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned"
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    exit 1
}

# Set thresholds
$MEM_THRESHOLD = 80.0 # 80% memory usage threshold

Write-Host "Monitoring container resource usage..." -ForegroundColor Cyan

while ($true) {
    # Get memory usage for all containers
    $stats = docker stats --no-stream --format "{{.Name}}: {{.MemPerc}}"
    
    # Process each container's stats
    $stats | ForEach-Object {
        $line = $_
        $containerName = ($line -split ':')[0]
        $memUsage = [float](($line -split ':')[1] -replace '%', '').Trim()
        
        # Check if memory usage exceeds threshold
        if ($memUsage -gt $MEM_THRESHOLD) {
            Write-Host "WARNING: $containerName memory usage ($memUsage%) exceeds threshold ($MEM_THRESHOLD%)" -ForegroundColor Red
        } else {
            Write-Host "$line - OK" -ForegroundColor Green
        }
    }
    
    # Wait 5 seconds before next check
    Start-Sleep -Seconds 5
    Write-Host "`n" # Add blank line between updates
}

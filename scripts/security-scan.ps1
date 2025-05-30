# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

Write-Host "Running security scans on containers..." -ForegroundColor Cyan

# Create reports directory if it doesn't exist
$reportsDir = "security-reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

# Get current timestamp for report
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Array of images to scan
$IMAGES = @(
    "brainbytesai-frontend:latest",
    "brainbytesai-backend:latest",
    "brainbytesai-ai-service:latest"
)

# Function to check if image exists
function Test-DockerImage {
    param($imageName)
    $exists = docker images -q $imageName
    return [bool]$exists
}

# Verify images exist first
$missingImages = @()
foreach ($IMAGE in $IMAGES) {
    if (-not (Test-DockerImage $IMAGE)) {
        $missingImages += $IMAGE
    }
}

if ($missingImages.Count -gt 0) {
    Write-Host "`nError: The following images are missing:" -ForegroundColor Red
    foreach ($img in $missingImages) {
        Write-Host "  - $img" -ForegroundColor Yellow
    }
    Write-Host "`nPlease build the missing images first using:" -ForegroundColor Cyan
    Write-Host "docker compose build" -ForegroundColor White
    exit 1
}

# Initialize summary array
$summary = @()

# Run Trivy scan for each image
foreach ($IMAGE in $IMAGES) {
    $reportFile = Join-Path $reportsDir "${timestamp}_${IMAGE}.txt"
    $reportFile = $reportFile -replace ":", "-"
    
    Write-Host "`nScanning $IMAGE..." -ForegroundColor Yellow
    
    # Run scan and save to file
    docker run --rm `
        -v /var/run/docker.sock:/var/run/docker.sock `
        aquasec/trivy image --severity HIGH,CRITICAL $IMAGE | Out-File -FilePath $reportFile
    
    if ($LASTEXITCODE -eq 0) {
        $vulnCount = (Get-Content $reportFile | Select-String "Total:").Count
        if ($vulnCount -gt 0) {
            Write-Host "Found vulnerabilities in $IMAGE - See $reportFile for details" -ForegroundColor Red
            $summary += "$IMAGE : $vulnCount vulnerabilities found"
        } else {
            Write-Host "No HIGH/CRITICAL vulnerabilities found in $IMAGE" -ForegroundColor Green
            $summary += "$IMAGE : No vulnerabilities found"
        }
    } else {
        Write-Host "Warning: Scan failed for $IMAGE." -ForegroundColor Red
        $summary += "$IMAGE : Scan failed"
    }
}

# Write summary report
$summaryFile = Join-Path $reportsDir "${timestamp}_summary.txt"
Write-Host "`nScan Summary:" -ForegroundColor Cyan
"Security Scan Summary - $timestamp`n" | Out-File -FilePath $summaryFile
$summary | ForEach-Object {
    $_ | Out-File -FilePath $summaryFile -Append
    Write-Host $_
}

Write-Host "`nDetailed scan reports have been saved to the '$reportsDir' directory" -ForegroundColor Green
Write-Host "Summary report: $summaryFile" -ForegroundColor Green

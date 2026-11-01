$artifactDir = "C:\Users\AD_4_\.gemini\antigravity\brain\2eb4222e-bac6-432c-b261-005cb980a98a"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

$pages = @(
    @{ name = "01_login_desktop"; url = "http://localhost:5000/index.html"; size = "1280,800" },
    @{ name = "02_login_mobile"; url = "http://localhost:5000/index.html"; size = "375,812" },
    @{ name = "03_servant_dashboard_desktop"; url = "http://localhost:5000/servant-dashboard.html"; size = "1280,800" },
    @{ name = "04_servant_dashboard_mobile"; url = "http://localhost:5000/servant-dashboard.html"; size = "375,812" },
    @{ name = "05_grades_entry_desktop"; url = "http://localhost:5000/servant_grades_entry.html"; size = "1280,800" },
    @{ name = "06_followup_radar_desktop"; url = "http://localhost:5000/servant_followup.html"; size = "1280,800" },
    @{ name = "07_student_portal_mobile"; url = "http://localhost:5000/student.html"; size = "375,812" },
    @{ name = "08_servant_guide_print"; url = "http://localhost:5000/servant_quick_guide.html"; size = "1024,1200" }
)

foreach ($p in $pages) {
    $outPath = Join-Path $artifactDir "$($p.name).png"
    Write-Host "Capturing $($p.name)..."
    Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--no-sandbox", "--window-size=$($p.size)", "--screenshot=$outPath", "$($p.url)" -Wait
}

Write-Host "All snapshots captured successfully!"

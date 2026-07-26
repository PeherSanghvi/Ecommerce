$base = "C:\Users\Peher\OneDrive\Desktop\ecom\backend\src\main\java\com\ecom\order"

$dirs = @(
    "config",
    "controller",
    "domain\entity",
    "domain\enums",
    "dto\request",
    "dto\response",
    "exception",
    "mapper",
    "repository",
    "service",
    "service\impl",
    "sync",
    "scheduler",
    "seeder",
    "validator",
    "util"
)

foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path "$base\$d" | Out-Null
}

Write-Host "All package directories created successfully"

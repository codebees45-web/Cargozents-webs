$port = if ($env:PORT) { [int]$env:PORT } else { 5000 }
$pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

if ($pids) {
  $pids | ForEach-Object {
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Freed port $port (stopped PID(s): $($pids -join ', '))"
} else {
  Write-Host "Port $port is already free"
}

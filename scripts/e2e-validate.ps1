$ErrorActionPreference = "Continue"
$base = "http://localhost:5000"
$results = @()

function Test-Endpoint {
  param($Name, $Url, $Method = "GET", $Body = $null, $Headers = @{})
  try {
  if ($Method -eq "GET") {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20 -Headers $Headers
    } else {
      $r = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -TimeoutSec 20 -Headers $Headers -ContentType "application/json" -Body $Body
    }
    $json = $null
    try { $json = $r.Content | ConvertFrom-Json } catch {}
    $results += [PSCustomObject]@{ Test = $Name; Status = $r.StatusCode; Ok = $true; Note = "" }
    return @{ ok = $true; status = $r.StatusCode; json = $json; raw = $r }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg = $_.Exception.Message
    try {
      $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
      $msg = $reader.ReadToEnd()
      $reader.Close()
    } catch {}
    $results += [PSCustomObject]@{ Test = $Name; Status = $code; Ok = $false; Note = $msg.Substring(0, [Math]::Min(120, $msg.Length)) }
    return @{ ok = $false; status = $code; error = $msg }
  }
}

Write-Host "=== PHASE 1: Service reachability ===" -ForegroundColor Cyan
@(
  @{ N = "API health"; U = "$base/health" },
  @{ N = "Web"; U = "http://localhost:5173" },
  @{ N = "Admin"; U = "http://localhost:5174" }
) | ForEach-Object {
  $t = Test-Endpoint $_.N $_.U
  Write-Host "$($_.N): $(if ($t.ok) { 'OK' } else { 'FAIL' })"
}

Write-Host "`n=== PHASE 2: Public API ===" -ForegroundColor Cyan
$public = @(
  "site-settings", "services?limit=5", "packages", "portfolio?limit=5", "gallery?limit=5",
  "team-members", "testimonials", "content/homepage", "seo/homepage",
  "availability/slots?date=2026-12-01"
)
foreach ($p in $public) {
  $t = Test-Endpoint "public/$p" "$base/api/v1/public/$p"
  $struct = if ($t.json -and $t.json.success -ne $null) { "success=$($t.json.success)" } else { "non-standard" }
  Write-Host "  $p : $(if ($t.ok) { $t.status } else { 'FAIL' }) $struct"
}

Write-Host "`n=== PHASE 3: Auth ===" -ForegroundColor Cyan
$loginBody = '{"email":"admin@skmakeup.com","password":"ChangeMe@Secure123!"}'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$login = Test-Endpoint "auth/login" "$base/api/v1/auth/login" "POST" $loginBody @{}
if ($login.ok) {
  $token = $login.json.data.accessToken
  Write-Host "  login: OK token=$($token.Substring(0,20))..."
  $me = Test-Endpoint "auth/me" "$base/api/v1/auth/me" "GET" $null @{ Authorization = "Bearer $token" }
  Write-Host "  me: $(if ($me.ok) { 'OK role=' + $me.json.data.role } else { 'FAIL' })"
  $dash = Test-Endpoint "admin/dashboard" "$base/api/v1/admin/dashboard/stats" "GET" $null @{ Authorization = "Bearer $token" }
  Write-Host "  dashboard: $(if ($dash.ok) { 'OK' } else { 'FAIL ' + $dash.status })"
} else {
  Write-Host "  login: FAIL"
}

Write-Host "`n=== PHASE 6-7: Booking & Contact ===" -ForegroundColor Cyan
$bookingBody = @{
  customerName = "E2E Test User"
  customerEmail = "e2e-test@example.com"
  customerPhone = "+91 9110883442"
  bookingDate = "2026-12-15"
  bookingTime = "10:00"
  notes = "E2E validation booking"
  website = ""
} | ConvertTo-Json
$book = Test-Endpoint "booking" "$base/api/v1/public/bookings" "POST" $bookingBody @{}
Write-Host "  booking: $(if ($book.ok) { 'OK ' + $book.json.data.bookingNumber } else { 'FAIL ' + $book.error })"

$contactBody = @{
  name = "E2E Contact"
  email = "e2e-contact@example.com"
  phone = "+91 9110883442"
  subject = "E2E Test"
  message = "End to end validation message"
  website = ""
} | ConvertTo-Json
$contact = Test-Endpoint "contact" "$base/api/v1/public/contact" "POST" $contactBody @{}
Write-Host "  contact: $(if ($contact.ok) { 'OK id=' + $contact.json.data.id } else { 'FAIL ' + $contact.error })"

Write-Host "`n=== PHASE 5: Website routes (HTML) ===" -ForegroundColor Cyan
@("/", "/about", "/services", "/portfolio", "/gallery", "/testimonials", "/book", "/contact") | ForEach-Object {
  $t = Test-Endpoint "web$_" "http://localhost:5173$_"
  Write-Host "  $_ : $(if ($t.ok) { $t.status } else { 'FAIL' })"
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$results | Format-Table -AutoSize
$failed = ($results | Where-Object { -not $_.Ok }).Count
Write-Host "Passed: $($results.Count - $failed) / $($results.Count)"

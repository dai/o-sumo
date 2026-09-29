param(
  [string]$BaseUrl = 'http://127.0.0.1:3002'
)

$ErrorActionPreference = 'Stop'
$uri = [Uri]$BaseUrl
if (-not $uri.IsLoopback) {
  throw 'This local verification script only accepts a loopback URL.'
}

$sessionUri = [Uri]::new($uri, '/api/auth/session')
$headers = @{ Cookie = 'o_sumo_session=local-binding-check' }
$response = Invoke-RestMethod -Uri $sessionUri -Headers $headers -Method Get
if ($response.authenticated -ne $false) {
  throw 'Expected an unauthenticated local session response.'
}

$publicApiUri = [Uri]::new($uri, '/api/v1/rikishi.json')
$publicResponse = Invoke-WebRequest -Uri $publicApiUri -Method Get
if ($publicResponse.StatusCode -ne 200) {
  throw 'The existing public API did not respond successfully.'
}

Write-Output 'My Rikishi auth local verification passed.'

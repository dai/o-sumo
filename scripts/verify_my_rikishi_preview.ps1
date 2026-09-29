param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl
)

$ErrorActionPreference = 'Stop'
$uri = [Uri]$BaseUrl
if ($uri.Scheme -ne 'https') {
  throw 'Preview verification requires an HTTPS URL.'
}

$sessionUri = [Uri]::new($uri, '/api/auth/session')
$session = Invoke-RestMethod -Uri $sessionUri -Method Get
if ($session.authenticated -ne $false) {
  throw 'Expected an anonymous session before browser login.'
}

$loginUri = [Uri]::new($uri, '/api/auth/google?returnTo=/my-rikishi/')
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$client = [System.Net.Http.HttpClient]::new($handler)
try {
  $loginResponse = $client.GetAsync($loginUri).GetAwaiter().GetResult()
  $loginStatusCode = [int]$loginResponse.StatusCode
  $loginLocation = $loginResponse.Headers.Location
}
finally {
  $client.Dispose()
  $handler.Dispose()
}

if ($loginStatusCode -ne 302) {
  throw 'Expected the Google login endpoint to redirect.'
}
if (-not $loginLocation.ToString().StartsWith('https://accounts.google.com/')) {
  throw 'The login endpoint did not redirect to Google.'
}

Write-Output 'Preview anonymous-session and OAuth-start checks passed.'
Write-Output 'Complete login, merge, second-browser, logout, and isolation checks in a browser.'

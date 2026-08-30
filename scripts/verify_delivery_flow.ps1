param(
  [string]$BaseUrl = "https://osada.us",
  [string]$LocalBaseUrl,
  [string]$PreviewBaseUrl,
  [string]$DateKey,
  [string]$ReportDir,
  [switch]$BaselineOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Get-TorikumiFromOriginMain {
  $jsonText = git show origin/main:public/api/v1/torikumi.json 2>$null
  if ([string]::IsNullOrWhiteSpace($jsonText)) {
    throw "origin/main:public/api/v1/torikumi.json を取得できませんでした。"
  }
  return $jsonText | ConvertFrom-Json
}

function Get-TorikumiFromProduction {
  $apiUrl = "$BaseUrl/api/v1/torikumi.json"
  $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }
  return $response.Content | ConvertFrom-Json
}

function Find-ResultDay([object]$Doc, [string]$TargetDateKey) {
  return $Doc.resultDays | Where-Object { $_.pathDate -eq $TargetDateKey } | Select-Object -First 1
}

function Count-Matches([object]$Day, [string]$Division) {
  if ($null -eq $Day) { return -1 }
  if ($Division -eq "makuuchi") {
    return @($Day.data.makuuchi.matches).Count
  }
  if ($Division -eq "juryo") {
    return @($Day.data.juryo.matches).Count
  }
  return -1
}

function Invoke-HeaderCheck([string]$Url) {
  function Get-LocationHeader([object]$Headers) {
    try {
      if ($null -ne $Headers.Location) {
        return [string]$Headers.Location
      }
    } catch {}
    try {
      return @($Headers.GetValues("Location")) -join ","
    } catch {}
    return ""
  }

  try {
    $response = Invoke-WebRequest -Uri $Url -MaximumRedirection 0 -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }
    return [pscustomobject]@{
      url = $Url
      statusCode = [int]$response.StatusCode
      location = (Get-LocationHeader -Headers $response.Headers)
      error = $null
    }
  } catch {
    $httpResponse = $_.Exception.Response
    if ($null -ne $httpResponse) {
      return [pscustomobject]@{
        url = $Url
        statusCode = [int]$httpResponse.StatusCode
        location = (Get-LocationHeader -Headers $httpResponse.Headers)
        error = $null
      }
    }
    return [pscustomobject]@{
      url = $Url
      statusCode = -1
      location = ""
      error = $_.Exception.Message
    }
  }
}

function Get-SitemapLocations([string]$EnvironmentBaseUrl) {
  $sitemapUrl = "$($EnvironmentBaseUrl.TrimEnd('/'))/sitemap.xml"
  try {
    $response = Invoke-WebRequest -Uri $sitemapUrl -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }
    [xml]$xml = $response.Content
    return [pscustomobject]@{
      url = $sitemapUrl
      statusCode = [int]$response.StatusCode
      locations = @($xml.SelectNodes("//*[local-name()='loc']") | ForEach-Object { $_.InnerText })
      error = $null
    }
  } catch {
    return [pscustomobject]@{
      url = $sitemapUrl
      statusCode = -1
      locations = @()
      error = $_.Exception.Message
    }
  }
}

function Get-ExpectedRouteChecks {
  return @(
    [pscustomobject]@{ path = "/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/archives/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/rikishi/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/rikishi/3842/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/kimarite/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/analytics/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/20260310-yotei/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/202607-banzuke/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/202607-torikumi/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/20260712-torikumi/"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/sitemap.xml"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/robots.txt"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/og-default.jpg"; expectedStatus = 200; expectedLocation = "" },
    [pscustomobject]@{ path = "/archives"; expectedStatus = 301; expectedLocation = "/archives/" },
    [pscustomobject]@{ path = "/rikishi/3842"; expectedStatus = 301; expectedLocation = "/rikishi/3842/" },
    [pscustomobject]@{ path = "/20260310-yotei"; expectedStatus = 301; expectedLocation = "/20260310-yotei/" },
    [pscustomobject]@{ path = "/202607-banzuke"; expectedStatus = 301; expectedLocation = "/202607-banzuke/" },
    [pscustomobject]@{ path = "/202607-torikumi"; expectedStatus = 301; expectedLocation = "/202607-torikumi/" },
    [pscustomobject]@{ path = "/20260712-torikumi"; expectedStatus = 301; expectedLocation = "/20260712-torikumi/" },
    [pscustomobject]@{ path = "/delivery-verifier-not-found/"; expectedStatus = 404; expectedLocation = "" }
  )
}

function Get-JsonDocument([string]$Url, [string]$SourceName) {
  try {
    $document = (Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }).Content | ConvertFrom-Json
    return [pscustomobject]@{ document = $document; error = $null }
  } catch {
    return [pscustomobject]@{ document = $null; error = "$SourceName failed: $Url ($($_.Exception.Message))" }
  }
}

function Get-SitemapSourceData([string]$EnvironmentBaseUrl) {
  $base = $EnvironmentBaseUrl.TrimEnd('/')
  $torikumiFetch = Get-JsonDocument -Url "$base/api/v1/torikumi.json" -SourceName "Torikumi sitemap source"
  $rikishiFetch = Get-JsonDocument -Url "$base/api/v1/rikishi.json" -SourceName "Rikishi sitemap source"
  $errors = @($torikumiFetch.error, $rikishiFetch.error) | Where-Object { $null -ne $_ }
  $paths = @()
  $torikumiDocument = $null
  if ($null -ne $torikumiFetch.document) {
    try {
      if ($torikumiFetch.document.resultDays -isnot [System.Array] -or $torikumiFetch.document.scheduleDays -isnot [System.Array]) {
        throw "resultDays and scheduleDays must be arrays"
      }
      $resultDays = @($torikumiFetch.document.resultDays | ForEach-Object {
        [pscustomobject]@{ pathDate = $_.pathDate; status = $_.status }
      })
      $scheduleDays = @($torikumiFetch.document.scheduleDays | ForEach-Object {
        [pscustomobject]@{ pathDate = $_.pathDate; status = $_.status }
      })
      $torikumiDocument = [pscustomobject]@{ resultDays = $resultDays; scheduleDays = $scheduleDays }
      foreach ($day in @($resultDays | Where-Object { $_.status -eq "pending" })) {
        $paths += "/$($day.pathDate)-torikumi/"
      }
      foreach ($day in @($scheduleDays | Where-Object { $_.status -eq "pending" })) {
        $paths += "/$($day.pathDate)-yotei/"
      }
    } catch {
      $errors += "Torikumi sitemap source shape failed: $($_.Exception.Message)"
    }
  }

  $rikishiDocument = $null
  if ($null -ne $rikishiFetch.document) {
    try {
      if ($rikishiFetch.document.rikishi -isnot [System.Array]) {
        throw "rikishi must be an array"
      }
      $rikishiDocument = [pscustomobject]@{
        rikishi = @($rikishiFetch.document.rikishi | ForEach-Object { [pscustomobject]@{ id = $_.id } })
      }
    } catch {
      $errors += "Rikishi sitemap source shape failed: $($_.Exception.Message)"
    }
  }

  return [pscustomobject]@{
    torikumiDocument = $torikumiDocument
    rikishiDocument = $rikishiDocument
    excludedPaths = $paths
    errors = $errors
  }
}

function Invoke-ResultValidation(
  [object[]]$RouteChecks,
  [string[]]$SitemapLocations,
  [string[]]$SitemapExcludedPaths,
  [object]$RikishiDocument,
  [object]$TorikumiDocument,
  [string[]]$SitemapSourceIssues
) {
  $payload = [pscustomobject]@{
    routing = $RouteChecks
    sitemapLocations = $SitemapLocations
    sitemapExcludedPaths = $SitemapExcludedPaths
    rikishiDocument = $RikishiDocument
    torikumiDocument = $TorikumiDocument
    sitemapSourceIssues = $SitemapSourceIssues
  } | ConvertTo-Json -Depth 10 -Compress
  $output = $payload | & node ./scripts/delivery-verification.mjs --validate 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "Node validation failed: $($output -join [Environment]::NewLine)"
  }
  return ($output -join [Environment]::NewLine) | ConvertFrom-Json
}

function Invoke-RenderedHeadCheck([string]$EnvironmentBaseUrl) {
  $output = & node ./scripts/delivery-verification.mjs --base-url $EnvironmentBaseUrl 2>&1
  if ($LASTEXITCODE -ne 0) {
    return [pscustomobject]@{
      status = "ISSUE"
      pages = @()
      issues = @("Playwright rendered-head check failed: $($output -join [Environment]::NewLine)")
    }
  }
  return ($output -join [Environment]::NewLine) | ConvertFrom-Json
}

function Test-DeliveryEnvironment([string]$EnvironmentName, [string]$EnvironmentBaseUrl) {
  $base = $EnvironmentBaseUrl.TrimEnd('/')
  $routeChecks = @()
  foreach ($expected in Get-ExpectedRouteChecks) {
    $actual = Invoke-HeaderCheck -Url "$base$($expected.path)"
    $routeChecks += [pscustomobject]@{
      path = $expected.path
      expectedStatus = $expected.expectedStatus
      expectedLocation = $expected.expectedLocation
      actualStatus = $actual.statusCode
      actualLocation = $actual.location
      error = $actual.error
    }
  }

  $sitemapFetch = Get-SitemapLocations -EnvironmentBaseUrl $base
  $sitemapSource = Get-SitemapSourceData -EnvironmentBaseUrl $base
  $sitemapPathChecks = @()
  foreach ($path in $sitemapFetch.locations | ForEach-Object {
    try { ([uri]$_).AbsolutePath } catch { $null }
  } | Where-Object { $null -ne $_ }) {
    $sitemapPathChecks += Invoke-HeaderCheck -Url "$base$path"
  }

  $validation = Invoke-ResultValidation `
    -RouteChecks $routeChecks `
    -SitemapLocations $sitemapFetch.locations `
    -SitemapExcludedPaths $sitemapSource.excludedPaths `
    -RikishiDocument $sitemapSource.rikishiDocument `
    -TorikumiDocument $sitemapSource.torikumiDocument `
    -SitemapSourceIssues $sitemapSource.errors
  $sitemapPathIssues = @($sitemapPathChecks | Where-Object { $_.statusCode -ne 200 } | ForEach-Object {
    "$($_.url): expected 200, received $($_.statusCode)"
  })
  $routingStatus = $validation.routing.status
  $sitemapStatus = if ($sitemapFetch.statusCode -eq 200 -and $validation.sitemap.status -eq "OK" -and $sitemapPathIssues.Count -eq 0) { "OK" } else { "ISSUE" }
  $head = Invoke-RenderedHeadCheck -EnvironmentBaseUrl $base

  return [pscustomobject]@{
    name = $EnvironmentName
    baseUrl = $base
    routingStatus = $routingStatus
    sitemapStatus = $sitemapStatus
    headStatus = $head.status
    routeChecks = $routeChecks
    sitemapFetch = $sitemapFetch
    sitemapPathChecks = $sitemapPathChecks
    sitemapExcludedPaths = $sitemapSource.excludedPaths
    routingIssues = @($validation.routing.issues)
    sitemapIssues = @($validation.sitemap.issues) + $(if ($sitemapFetch.statusCode -eq 200) { @() } else { @($sitemapFetch.error) }) + $sitemapPathIssues
    head = $head
  }
}

function Get-ActionCommits {
  $rows = git log origin/main --pretty=format:"%h|%cI|%an|%s" -n 40 --grep="^chore: realtime torikumi update$" --grep="^chore: daily sumo data update$"
  if ([string]::IsNullOrWhiteSpace($rows)) {
    return @()
  }
  $result = @()
  foreach ($row in ($rows -split "`n")) {
    if ([string]::IsNullOrWhiteSpace($row)) { continue }
    $parts = $row -split "\|", 4
    if ($parts.Count -ne 4) { continue }
    $result += [pscustomobject]@{
      commit = $parts[0]
      timestamp = $parts[1]
      author = $parts[2]
      message = $parts[3]
    }
  }
  return $result
}

function Get-DeliveryEnvironmentStatus([object]$Environment) {
  $statuses = @($Environment.routingStatus, $Environment.sitemapStatus, $Environment.headStatus)
  if ($statuses -contains "ISSUE") { return "ISSUE" }
  if (@($statuses | Where-Object { $_ -ne "SKIPPED" }).Count -eq 0) { return "SKIPPED" }
  return "OK"
}

$origin = Get-TorikumiFromOriginMain
if ([string]::IsNullOrWhiteSpace($DateKey)) {
  $originDay = $origin.resultDays | Where-Object { $_.status -eq "published" } | Sort-Object pathDate | Select-Object -Last 1
  if ($null -eq $originDay) {
    throw "origin/main resultDays contains no published day for automatic DateKey selection."
  }
  $DateKey = [string]$originDay.pathDate
} else {
  $originDay = Find-ResultDay -Doc $origin -TargetDateKey $DateKey
  if ($null -eq $originDay) {
    throw "DateKey $DateKey was not found in origin/main resultDays."
  }
}

$production = Get-TorikumiFromProduction
$productionDay = Find-ResultDay -Doc $production -TargetDateKey $DateKey
$originDayStatus = [string]$originDay.status
$productionDayStatus = if ($null -eq $productionDay) { "<missing>" } else { [string]$productionDay.status }

$checks = @(
  [pscustomobject]@{ item = "updatedAt"; origin = "$($origin.updatedAt)"; production = "$($production.updatedAt)"; matched = ($origin.updatedAt -eq $production.updatedAt) },
  [pscustomobject]@{ item = "resultUpdatedAt"; origin = "$($origin.resultUpdatedAt)"; production = "$($production.resultUpdatedAt)"; matched = ($origin.resultUpdatedAt -eq $production.resultUpdatedAt) },
  [pscustomobject]@{ item = "scheduleUpdatedAt"; origin = "$($origin.scheduleUpdatedAt)"; production = "$($production.scheduleUpdatedAt)"; matched = ($origin.scheduleUpdatedAt -eq $production.scheduleUpdatedAt) },
  [pscustomobject]@{ item = "day($DateKey).status"; origin = $originDayStatus; production = $productionDayStatus; matched = ($originDayStatus -eq $productionDayStatus) },
  [pscustomobject]@{ item = "day($DateKey).makuuchiMatches"; origin = "$(Count-Matches -Day $originDay -Division "makuuchi")"; production = "$(Count-Matches -Day $productionDay -Division "makuuchi")"; matched = ((Count-Matches -Day $originDay -Division "makuuchi") -eq (Count-Matches -Day $productionDay -Division "makuuchi")) },
  [pscustomobject]@{ item = "day($DateKey).juryoMatches"; origin = "$(Count-Matches -Day $originDay -Division "juryo")"; production = "$(Count-Matches -Day $productionDay -Division "juryo")"; matched = ((Count-Matches -Day $originDay -Division "juryo") -eq (Count-Matches -Day $productionDay -Division "juryo")) }
)

$dataSyncStatus = if (@($checks | Where-Object { -not $_.matched }).Count -eq 0) { "OK" } else { "ISSUE" }

$baseEnvironment = Test-DeliveryEnvironment -EnvironmentName "BASE" -EnvironmentBaseUrl $BaseUrl
$localEnvironment = if ($BaselineOnly -or [string]::IsNullOrWhiteSpace($LocalBaseUrl)) {
  [pscustomobject]@{
    name = "LOCAL"
    baseUrl = ""
    routingStatus = "SKIPPED"
    sitemapStatus = "SKIPPED"
    headStatus = "SKIPPED"
    routeChecks = @()
    sitemapFetch = $null
    sitemapPathChecks = @()
    sitemapExcludedPaths = @()
    routingIssues = @()
    sitemapIssues = @()
    head = $null
  }
} else {
  Test-DeliveryEnvironment -EnvironmentName "LOCAL" -EnvironmentBaseUrl $LocalBaseUrl
}
$previewEnvironment = if ($BaselineOnly -or [string]::IsNullOrWhiteSpace($PreviewBaseUrl)) {
  [pscustomobject]@{
    name = "PREVIEW"
    baseUrl = ""
    routingStatus = "SKIPPED"
    sitemapStatus = "SKIPPED"
    headStatus = "SKIPPED"
    routeChecks = @()
    sitemapFetch = $null
    sitemapPathChecks = @()
    sitemapExcludedPaths = @()
    routingIssues = @()
    sitemapIssues = @()
    head = $null
  }
} else {
  Test-DeliveryEnvironment -EnvironmentName "PREVIEW" -EnvironmentBaseUrl $PreviewBaseUrl
}
$environmentResults = @($baseEnvironment, $localEnvironment, $previewEnvironment)
$baseBaselineStatus = Get-DeliveryEnvironmentStatus -Environment $baseEnvironment
$branchGateIssues = @()
if ($BaselineOnly) {
  $branchGateStatus = "SKIPPED"
  $overallStatus = "SKIPPED"
} else {
  if ([string]::IsNullOrWhiteSpace($LocalBaseUrl)) {
    $branchGateIssues += "LOCAL URL is required in normal mode."
  } elseif ((Get-DeliveryEnvironmentStatus -Environment $localEnvironment) -eq "ISSUE") {
    $branchGateIssues += "LOCAL delivery checks contain an issue."
  }
  if (-not [string]::IsNullOrWhiteSpace($PreviewBaseUrl) -and (Get-DeliveryEnvironmentStatus -Environment $previewEnvironment) -eq "ISSUE") {
    $branchGateIssues += "Supplied PREVIEW delivery checks contain an issue."
  }
  $branchGateStatus = if ($branchGateIssues.Count -eq 0) { "OK" } else { "ISSUE" }
  $overallStatus = if ($dataSyncStatus -eq "OK" -and $branchGateStatus -eq "OK") { "OK" } else { "ISSUE" }
}

$actionCommits = Get-ActionCommits

$reportDir = if ([string]::IsNullOrWhiteSpace($ReportDir)) { Join-Path (Get-Location) "tasks/reports" } else { $ReportDir }
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
$reportTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $reportDir "delivery-flow-$reportTimestamp.md"
$generatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")

$lines = @()
$lines += "# Delivery Flow Verification Report"
$lines += ""
$lines += "- GeneratedAt: $generatedAt"
$lines += "- BaseUrl: $BaseUrl"
$lines += "- LocalBaseUrl: $(if ([string]::IsNullOrWhiteSpace($LocalBaseUrl)) { "SKIPPED" } else { $LocalBaseUrl })"
$lines += "- PreviewBaseUrl: $(if ([string]::IsNullOrWhiteSpace($PreviewBaseUrl)) { "SKIPPED" } else { $PreviewBaseUrl })"
$lines += "- TargetDateKey: $DateKey"
$lines += "- Mode: $(if ($BaselineOnly) { "BASELINE_ONLY" } else { "BRANCH_GATE" })"
$lines += "- DATA_SYNC: $dataSyncStatus"
$lines += "- BASE_BASELINE: $baseBaselineStatus"
$lines += "- BRANCH_GATE: $branchGateStatus"
$lines += "- OVERALL: $overallStatus"
$lines += "- Excluded: JSON-LD, feed.xml"
$lines += ""
$lines += "## Data Sync Check (origin/main vs production API)"
$lines += ""
$lines += "| Item | origin/main | production | Match |"
$lines += "| --- | --- | --- | --- |"
foreach ($check in $checks) {
  $matchText = if ($check.matched) { "YES" } else { "NO" }
  $lines += "| $($check.item) | $($check.origin) | $($check.production) | $matchText |"
}
$lines += ""
$lines += "## GitHub Actions Commit Timestamps (from origin/main)"
$lines += ""
if ($actionCommits.Count -eq 0) {
  $lines += "- No matching action commits found in local origin/main history."
} else {
  $lines += "| Commit | Timestamp | Author | Message |"
  $lines += "| --- | --- | --- | --- |"
  foreach ($commit in $actionCommits) {
    $lines += "| $($commit.commit) | $($commit.timestamp) | $($commit.author) | $($commit.message) |"
  }
}
$lines += ""
$lines += "## Environment Delivery Checks"
$lines += ""
foreach ($environment in $environmentResults) {
  $lines += "### $($environment.name)"
  $lines += ""
  $lines += "- BaseUrl: $(if ($environment.baseUrl) { $environment.baseUrl } else { "SKIPPED" })"
  $lines += "- ROUTING_BEHAVIOR: $($environment.routingStatus)"
  $lines += "- HEAD_METADATA: $($environment.headStatus)"
  $lines += "- SITEMAP_URLS: $($environment.sitemapStatus)"
  $lines += ""
  if ($environment.routingStatus -eq "SKIPPED") {
    $lines += "- Environment URL was not supplied; delivery checks were SKIPPED."
    $lines += ""
    continue
  }
  $lines += "#### Routing Behavior"
  $lines += ""
  $lines += "| Path | Expected | Actual | Error |"
  $lines += "| --- | --- | --- | --- |"
  foreach ($check in $environment.routeChecks) {
    $expected = "$($check.expectedStatus) $(if ($check.expectedLocation) { $check.expectedLocation } else { "-" })"
    $actual = "$($check.actualStatus) $(if ($check.actualLocation) { $check.actualLocation } else { "-" })"
    $err = if ([string]::IsNullOrWhiteSpace("$($check.error)")) { "-" } else { "$($check.error)" }
    $lines += "| $($check.path) | $expected | $actual | $err |"
  }
  $lines += ""
  $lines += "#### Sitemap URLs"
  $lines += ""
  $lines += "- Sitemap fetch: $($environment.sitemapFetch.url) ($($environment.sitemapFetch.statusCode))"
  $lines += "- Excluded pending paths: $(if ($environment.sitemapExcludedPaths.Count -eq 0) { "none" } else { $environment.sitemapExcludedPaths -join ", " })"
  foreach ($issue in $environment.sitemapIssues) { $lines += "- ISSUE: $issue" }
  if ($environment.sitemapIssues.Count -eq 0) { $lines += "- All sitemap locations were canonical and returned HTTP 200 from this environment." }
  $lines += ""
  $lines += "#### Rendered Head Metadata"
  $lines += ""
  foreach ($page in $environment.head.pages) {
    $lines += "- $($page.path): $($page.status)"
    foreach ($issue in $page.issues) { $lines += "  - ISSUE: $issue" }
  }
  foreach ($issue in $environment.head.issues) {
    if ($environment.head.pages.Count -eq 0) { $lines += "- ISSUE: $issue" }
  }
  $lines += ""
}
$lines += "## Decision"
$lines += ""
$lines += "- DATA_SYNC=$dataSyncStatus"
$lines += "- BASE_BASELINE=$baseBaselineStatus"
$lines += "- BRANCH_GATE=$branchGateStatus"
foreach ($issue in $branchGateIssues) { $lines += "  - ISSUE: $issue" }
foreach ($environment in $environmentResults) {
  $lines += "- $($environment.name)_ROUTING_BEHAVIOR=$($environment.routingStatus)"
  $lines += "- $($environment.name)_HEAD_METADATA=$($environment.headStatus)"
  $lines += "- $($environment.name)_SITEMAP_URLS=$($environment.sitemapStatus)"
}
$lines += "- OVERALL=$overallStatus"

Set-Content -Path $reportPath -Value ($lines -join "`n") -Encoding utf8

Write-Output "DATA_SYNC=$dataSyncStatus"
Write-Output "BASE_BASELINE=$baseBaselineStatus"
Write-Output "BRANCH_GATE=$branchGateStatus"
foreach ($environment in $environmentResults) {
  Write-Output "$($environment.name)_ROUTING_BEHAVIOR=$($environment.routingStatus)"
  Write-Output "$($environment.name)_HEAD_METADATA=$($environment.headStatus)"
  Write-Output "$($environment.name)_SITEMAP_URLS=$($environment.sitemapStatus)"
}
Write-Output "OVERALL=$overallStatus"
Write-Output "REPORT_PATH=$reportPath"

if (-not $BaselineOnly -and $overallStatus -eq "ISSUE") {
  exit 1
}

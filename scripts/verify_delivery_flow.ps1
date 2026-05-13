param(
  [string]$BaseUrl = "https://osada.us",
  [string]$DateKey = "20260512"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

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
  return @($Doc.resultDays | Where-Object { $_.pathDate -eq $TargetDateKey } | Select-Object -First 1)[0]
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

$origin = Get-TorikumiFromOriginMain
$production = Get-TorikumiFromProduction

$originDay = Find-ResultDay -Doc $origin -TargetDateKey $DateKey
$productionDay = Find-ResultDay -Doc $production -TargetDateKey $DateKey

$checks = @(
  [pscustomobject]@{ item = "updatedAt"; origin = "$($origin.updatedAt)"; production = "$($production.updatedAt)"; matched = ($origin.updatedAt -eq $production.updatedAt) },
  [pscustomobject]@{ item = "resultUpdatedAt"; origin = "$($origin.resultUpdatedAt)"; production = "$($production.resultUpdatedAt)"; matched = ($origin.resultUpdatedAt -eq $production.resultUpdatedAt) },
  [pscustomobject]@{ item = "scheduleUpdatedAt"; origin = "$($origin.scheduleUpdatedAt)"; production = "$($production.scheduleUpdatedAt)"; matched = ($origin.scheduleUpdatedAt -eq $production.scheduleUpdatedAt) },
  [pscustomobject]@{ item = "day($DateKey).status"; origin = "$($originDay.status)"; production = "$($productionDay.status)"; matched = ($originDay.status -eq $productionDay.status) },
  [pscustomobject]@{ item = "day($DateKey).makuuchiMatches"; origin = "$(Count-Matches -Day $originDay -Division "makuuchi")"; production = "$(Count-Matches -Day $productionDay -Division "makuuchi")"; matched = ((Count-Matches -Day $originDay -Division "makuuchi") -eq (Count-Matches -Day $productionDay -Division "makuuchi")) },
  [pscustomobject]@{ item = "day($DateKey).juryoMatches"; origin = "$(Count-Matches -Day $originDay -Division "juryo")"; production = "$(Count-Matches -Day $productionDay -Division "juryo")"; matched = ((Count-Matches -Day $originDay -Division "juryo") -eq (Count-Matches -Day $productionDay -Division "juryo")) }
)

$dataSyncStatus = if (@($checks | Where-Object { -not $_.matched }).Count -eq 0) { "OK" } else { "ISSUE" }

$pathsToCheck = @(
  "/archives",
  "/archives/",
  "/202605-torikumi",
  "/202605-torikumi/",
  "/20260512-torikumi",
  "/20260512-torikumi/",
  "/20260512-yotei",
  "/20260512-yotei/"
)

$routingChecks = @()
foreach ($path in $pathsToCheck) {
  $routingChecks += Invoke-HeaderCheck -Url "$BaseUrl$path"
}

$routingIssues = @($routingChecks | Where-Object {
  $_.statusCode -eq 308 -and $_.location -eq "/"
})
$routingStatus = if ($routingIssues.Count -gt 0) { "ISSUE" } else { "OK" }

$actionCommits = Get-ActionCommits

$reportDir = Join-Path (Get-Location) "tasks/reports"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
$reportTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $reportDir "delivery-flow-$reportTimestamp.md"
$generatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")

$lines = @()
$lines += "# Delivery Flow Verification Report"
$lines += ""
$lines += "- GeneratedAt: $generatedAt"
$lines += "- BaseUrl: $BaseUrl"
$lines += "- TargetDateKey: $DateKey"
$lines += "- DATA_SYNC: $dataSyncStatus"
$lines += "- ROUTING_BEHAVIOR: $routingStatus"
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
$lines += "## Routing Header Check"
$lines += ""
$lines += "| URL | Status | Location | Error |"
$lines += "| --- | --- | --- | --- |"
foreach ($check in $routingChecks) {
  $loc = if ([string]::IsNullOrWhiteSpace("$($check.location)")) { "-" } else { "$($check.location)" }
  $err = if ([string]::IsNullOrWhiteSpace("$($check.error)")) { "-" } else { "$($check.error)" }
  $lines += "| $($check.url) | $($check.statusCode) | $loc | $err |"
}
$lines += ""
$lines += "## Decision"
$lines += ""
$lines += "- DATA_SYNC=$dataSyncStatus"
$lines += "- ROUTING_BEHAVIOR=$routingStatus"
if ($routingIssues.Count -gt 0) {
  $lines += "- NOTE: 末尾スラッシュなし URL の一部で `308 -> /` を検出。アプリデータ欠損とは別の配信ルーティング課題として扱う。"
}

Set-Content -Path $reportPath -Value ($lines -join "`n") -Encoding utf8

Write-Output "DATA_SYNC=$dataSyncStatus"
Write-Output "ROUTING_BEHAVIOR=$routingStatus"
Write-Output "REPORT_PATH=$reportPath"

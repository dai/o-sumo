$ErrorActionPreference = "Stop"

$fixturePort = 18911
$fixtureRoot = "http://127.0.0.1:$fixturePort"
$reportRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("o-sumo-delivery-verifier-" + [guid]::NewGuid())
$originTorikumi = git show origin/main:public/api/v1/torikumi.json
if ([string]::IsNullOrWhiteSpace($originTorikumi)) { throw "Missing origin/main torikumi fixture" }
$originDocument = $originTorikumi | ConvertFrom-Json
$latestPublishedDate = @($originDocument.resultDays | Where-Object { $_.status -eq "published" } | Sort-Object pathDate | Select-Object -Last 1)[0].pathDate
$missingProductionDocument = $originTorikumi | ConvertFrom-Json
$missingProductionDocument.resultDays = @($missingProductionDocument.resultDays | Where-Object { $_.pathDate -ne "20260712" })
$missingProductionTorikumi = $missingProductionDocument | ConvertTo-Json -Depth 100 -Compress
$localTorikumi = '{"resultDays":[{"pathDate":"20990101","status":"published"},{"pathDate":"20990102","status":"pending"}],"scheduleDays":[{"pathDate":"20990102","status":"published"}]}'
$previewTorikumi = '{"resultDays":[{"pathDate":"20990201","status":"published"}],"scheduleDays":[]}'
$rikishiItems = @([pscustomobject]@{ id = 3842 }) + @(1..69 | ForEach-Object { [pscustomobject]@{ id = 5000 + $_ } })
$rikishiJson = [pscustomobject]@{ rikishi = $rikishiItems } | ConvertTo-Json -Depth 5 -Compress

$server = Start-Job -ScriptBlock {
  param($port, $originJson, $localJson, $previewJson, $missingProductionJson, $rikishiIndexJson)

  function Get-TorikumiJson([string]$Environment) {
    if ($Environment -eq "local" -or $Environment -eq "incomplete" -or $Environment -eq "broken") { return $localJson }
    if ($Environment -eq "preview" -or $Environment -eq "previewissue") { return $previewJson }
    if ($Environment -eq "missingresult") { return $missingProductionJson }
    return $originJson
  }

  function Get-SitemapFixture([string]$Environment) {
    $torikumi = Get-TorikumiJson -Environment $Environment | ConvertFrom-Json
    $rikishi = $rikishiIndexJson | ConvertFrom-Json
    $paths = [Collections.Generic.HashSet[string]]::new()
    foreach ($path in @("/", "/archives/", "/rikishi/", "/kimarite/", "/analytics/")) { [void]$paths.Add($path) }
    foreach ($item in @($rikishi.rikishi)) {
      if ($Environment -eq "incomplete" -and $item.id -eq 5069) { continue }
      [void]$paths.Add("/rikishi/$($item.id)/")
    }
    foreach ($pair in @(@("resultDays", "torikumi"), @("scheduleDays", "yotei"))) {
      $field, $suffix = $pair
      foreach ($day in @($torikumi.$field)) {
        if ($day.pathDate -match '^\d{8}$') {
          $monthKey = $day.pathDate.Substring(0, 6)
          [void]$paths.Add("/$monthKey-banzuke/")
          [void]$paths.Add("/$monthKey-torikumi/")
          [void]$paths.Add("/$monthKey-yotei/")
          if ($day.status -eq "published") { [void]$paths.Add("/$($day.pathDate)-$suffix/") }
        }
      }
    }
    $locations = @($paths | Sort-Object | ForEach-Object { "<url><loc>https://osada.us$_</loc></url>" }) -join ""
    return [pscustomobject]@{
      xml = "<?xml version=`"1.0`"?><urlset>$locations</urlset>"
      paths = $paths
    }
  }

  $sitemapFixtures = @{}
  foreach ($environment in @("base", "baseissue", "local", "preview", "previewissue", "broken", "incomplete", "missingresult")) {
    $sitemapFixtures[$environment] = Get-SitemapFixture -Environment $environment
  }

  $listener = [System.Net.HttpListener]::new()
  $listener.Prefixes.Add("http://127.0.0.1:$port/")
  $listener.Start()
  $meta = @{
    "/" = @("o-sumo | 大相撲 番付・星取表", "大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。")
    "/archives/" = @("大相撲の場所別アーカイブ | o-sumo", "大相撲の過去の場所ごとの番付、取組結果、取組予定を閲覧できます。")
    "/rikishi/" = @("fixture", "fixture")
    "/rikishi/3842/" = @("力士プロフィール | o-sumo", "大相撲力士のプロフィール、番付、成績を確認できます。")
    "/kimarite/" = @("fixture", "fixture")
    "/analytics/" = @("fixture", "fixture")
    "/202607-banzuke/" = @("2026年7月場所 番付 | o-sumo", "2026年7月場所の番付を確認できます。")
    "/202607-torikumi/" = @("2026年7月場所 取組・星取表 | o-sumo", "2026年7月場所の取組結果と星取表を確認できます。")
    "/20260712-torikumi/" = @("2026年7月場所 初日 取組・星取表 | o-sumo", "2026年7月場所初日の取組結果と星取表を確認できます。")
    "/20260310-yotei/" = @("2026年3月場所 三日目 取組予定 | o-sumo", "2026年3月場所三日目の取組予定を確認できます。")
  }
  try {
    while ($true) {
      $context = $listener.GetContext()
      $path = $context.Request.Url.AbsolutePath
      if ($path -eq "/__stop") { $context.Response.StatusCode = 200; $context.Response.Close(); break }
      $environment, $route = switch -Regex ($path) {
        '^/(?<environment>base|baseissue|local|preview|previewissue|broken|incomplete|missingresult)(?<route>/.*)$' { $Matches.environment, $Matches.route; break }
        default { "", $path }
      }
      $response = $context.Response
      $sitemap = $sitemapFixtures[$environment]
      if ($route -eq "/api/v1/torikumi.json") {
        if ($environment -eq "broken") { $response.StatusCode = 500; $body = "broken" } else { $body = Get-TorikumiJson -Environment $environment }
        $response.ContentType = "application/json"
      } elseif ($route -eq "/api/v1/rikishi.json") {
        $body = $rikishiIndexJson
        $response.ContentType = "application/json"
      } elseif ($route -eq "/sitemap.xml") {
        $body = $sitemap.xml
        $response.ContentType = "application/xml"
      } elseif ($route -eq "/og-default.jpg" -and $environment -in @("baseissue", "previewissue")) {
        $response.StatusCode = 404
        $body = "not found"
      } elseif ($route -in @("/robots.txt", "/og-default.jpg")) {
        $body = "fixture"
      } elseif ($route -in @("/archives", "/rikishi/3842", "/20260310-yotei", "/202607-banzuke", "/202607-torikumi", "/20260712-torikumi")) {
        $response.StatusCode = 301
        $response.RedirectLocation = "$route/"
        $body = ""
      } elseif ($meta.ContainsKey($route)) {
        $title, $description = $meta[$route]
        $canonical = "https://osada.us$route"
        $body = "<html><head><title>$title</title><link rel=`"canonical`" href=`"$canonical`"><meta name=`"description`" content=`"$description`"><meta property=`"og:title`" content=`"$title`"><meta property=`"og:description`" content=`"$description`"><meta property=`"og:url`" content=`"$canonical`"><meta property=`"og:image`" content=`"https://osada.us/og-default.jpg`"><meta property=`"og:type`" content=`"website`"><meta property=`"og:site_name`" content=`"o-sumo`"><meta property=`"og:image:width`" content=`"1629`"><meta property=`"og:image:height`" content=`"1007`"><meta name=`"twitter:card`" content=`"summary_large_image`"><meta name=`"twitter:title`" content=`"$title`"><meta name=`"twitter:description`" content=`"$description`"><meta name=`"twitter:image`" content=`"https://osada.us/og-default.jpg`"></head><body>fixture</body></html>"
        $response.ContentType = "text/html; charset=utf-8"
      } elseif ($sitemap.paths.Contains($route)) {
        $body = "fixture"
      } else {
        $response.StatusCode = 404
        $body = "not found"
      }
      $bytes = [Text.Encoding]::UTF8.GetBytes($body)
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
    }
  } finally {
    $listener.Stop()
  }
} -ArgumentList $fixturePort, $originTorikumi, $localTorikumi, $previewTorikumi, $missingProductionTorikumi, $rikishiJson

function Invoke-Verifier([string]$Name, [string[]]$Arguments) {
  $caseReportRoot = Join-Path $reportRoot $Name
  $output = & pwsh -NoProfile -File ./scripts/verify_delivery_flow.ps1 @Arguments -ReportDir $caseReportRoot 2>&1
  return [pscustomobject]@{
    exitCode = $LASTEXITCODE
    output = $output -join "`n"
    report = if (Test-Path $caseReportRoot) { Get-Content -Raw ((Get-ChildItem -Path $caseReportRoot -Filter "delivery-flow-*.md").FullName) } else { "" }
  }
}

try {
  Start-Sleep -Milliseconds 300

  $baselineOnly = Invoke-Verifier -Name "baseline-only" -Arguments @("-BaseUrl", "$fixtureRoot/baseissue", "-BaselineOnly")
  if ($baselineOnly.exitCode -ne 0 -or $baselineOnly.output -notmatch "BASE_BASELINE=ISSUE" -or $baselineOnly.output -notmatch "BRANCH_GATE=SKIPPED" -or $baselineOnly.output -notmatch "OVERALL=SKIPPED") {
    throw "Expected BaselineOnly to report the BASE issue without failing: $($baselineOnly.output)"
  }

  $missingLocal = Invoke-Verifier -Name "missing-local" -Arguments @("-BaseUrl", "$fixtureRoot/base")
  if ($missingLocal.exitCode -eq 0 -or $missingLocal.output -notmatch "BRANCH_GATE=ISSUE" -or $missingLocal.output -notmatch "OVERALL=ISSUE") {
    throw "Expected normal mode without LOCAL to fail its branch gate: $($missingLocal.output)"
  }
  if ($missingLocal.report -notmatch "BASE_BASELINE: OK" -or $missingLocal.report -notmatch "BRANCH_GATE: ISSUE" -or $missingLocal.report -notmatch "OVERALL: ISSUE") {
    throw "Expected gate keys in the missing-LOCAL report"
  }
  if ($missingLocal.report -notmatch "TargetDateKey: $latestPublishedDate") {
    throw "Expected omitted DateKey to select latest published result day $latestPublishedDate"
  }

  $invalid = Invoke-Verifier -Name "invalid-date" -Arguments @("-BaseUrl", "$fixtureRoot/base", "-LocalBaseUrl", "$fixtureRoot/local", "-DateKey", "20991231")
  if ($invalid.exitCode -eq 0 -or $invalid.output -notmatch "DateKey 20991231 was not found in origin/main resultDays") {
    throw "Expected an explicit missing DateKey to fail early with a clear message"
  }

  $baseIssue = Invoke-Verifier -Name "base-issue" -Arguments @("-BaseUrl", "$fixtureRoot/baseissue", "-LocalBaseUrl", "$fixtureRoot/local", "-DateKey", "20260712")
  if ($baseIssue.exitCode -ne 0 -or $baseIssue.output -notmatch "BASE_BASELINE=ISSUE" -or $baseIssue.output -notmatch "LOCAL_SITEMAP_URLS=OK" -or $baseIssue.output -notmatch "BRANCH_GATE=OK" -or $baseIssue.output -notmatch "OVERALL=OK") {
    throw "Expected a successful LOCAL to gate green despite a BASE OGP issue: $($baseIssue.output)"
  }

  $previewIssue = Invoke-Verifier -Name "preview-issue" -Arguments @("-BaseUrl", "$fixtureRoot/base", "-LocalBaseUrl", "$fixtureRoot/local", "-PreviewBaseUrl", "$fixtureRoot/previewissue", "-DateKey", "20260712")
  if ($previewIssue.exitCode -eq 0 -or $previewIssue.output -notmatch "PREVIEW_ROUTING_BEHAVIOR=ISSUE" -or $previewIssue.output -notmatch "BRANCH_GATE=ISSUE" -or $previewIssue.output -notmatch "OVERALL=ISSUE") {
    throw "Expected a supplied PREVIEW issue to fail the branch gate: $($previewIssue.output)"
  }

  $broken = Invoke-Verifier -Name "broken-source" -Arguments @("-BaseUrl", "$fixtureRoot/base", "-LocalBaseUrl", "$fixtureRoot/broken", "-DateKey", "20260712")
  if ($broken.exitCode -eq 0 -or $broken.output -notmatch "LOCAL_SITEMAP_URLS=ISSUE") {
    throw "Expected a local torikumi fetch failure to fail as LOCAL_SITEMAP_URLS=ISSUE: $($broken.output)"
  }

  $incomplete = Invoke-Verifier -Name "incomplete-sitemap" -Arguments @("-BaseUrl", "$fixtureRoot/base", "-LocalBaseUrl", "$fixtureRoot/incomplete", "-DateKey", "20260712")
  if ($incomplete.exitCode -eq 0 -or $incomplete.output -notmatch "LOCAL_SITEMAP_URLS=ISSUE" -or $incomplete.report -notmatch "sitemap is missing required path: /rikishi/5069/") {
    throw "Expected a missing local profile URL to fail sitemap completeness: $($incomplete.output)"
  }

  $dataSyncIssue = Invoke-Verifier -Name "data-sync" -Arguments @("-BaseUrl", "$fixtureRoot/missingresult", "-LocalBaseUrl", "$fixtureRoot/local", "-DateKey", "20260712")
  if ($dataSyncIssue.exitCode -eq 0 -or $dataSyncIssue.output -notmatch "DATA_SYNC=ISSUE" -or $dataSyncIssue.output -notmatch "OVERALL=ISSUE") {
    throw "Expected DATA_SYNC=ISSUE to remain a normal-mode gate: $($dataSyncIssue.output)"
  }

  Write-Output "Actual PowerShell delivery verifier integration OK"
} finally {
  try { Invoke-WebRequest -Uri "$fixtureRoot/__stop" -UseBasicParsing | Out-Null } catch {}
  Wait-Job $server | Out-Null
  Remove-Job $server -Force
  Remove-Item -LiteralPath $reportRoot -Recurse -Force -ErrorAction SilentlyContinue
}

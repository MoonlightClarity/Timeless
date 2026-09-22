param(
  [switch]$ConfirmSubmission
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmSubmission) {
  throw 'AMO submission was not confirmed. Re-run with -ConfirmSubmission only when you intend to upload Timeless to addons.mozilla.org.'
}

if (-not $env:AMO_JWT_ISSUER) {
  throw 'AMO_JWT_ISSUER is not set. Create AMO API credentials and expose the issuer only through the environment.'
}

if (-not $env:AMO_JWT_SECRET) {
  throw 'AMO_JWT_SECRET is not set. Expose the AMO JWT secret only through the environment; do not store it in Timeless.'
}

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  $package = Get-Content '.\package.json' -Raw | ConvertFrom-Json
  $sourceArchive = ".\release\timeless-$($package.version)-source.zip"
  $metadata = '.\targets\firefox\amo-metadata.json'

  npm run firefox:release
  if ($LASTEXITCODE -ne 0) {
    throw 'Firefox release preparation failed; AMO submission aborted.'
  }

  if (-not (Test-Path $sourceArchive)) {
    throw "Reviewer source archive is missing: $sourceArchive"
  }
  if (-not (Test-Path $metadata)) {
    throw "AMO metadata is missing: $metadata"
  }

  Write-Host 'Submitting Timeless to the AMO listed channel...'
  $signArgs = @(
    '--yes',
    'web-ext@10.6.0',
    'sign',
    '--source-dir', '.\release\firefox',
    '--artifacts-dir', '.\release\signed',
    '--channel', 'listed',
    '--api-key', $env:AMO_JWT_ISSUER,
    '--api-secret', $env:AMO_JWT_SECRET,
    '--amo-metadata', $metadata,
    '--upload-source-code', $sourceArchive,
    '--approval-timeout', '0'
  )
  & npx @signArgs

  if ($LASTEXITCODE -ne 0) {
    throw 'AMO submission failed.'
  }

  Write-Host 'AMO accepted the submission command. Listed add-ons may remain pending review before a signed public XPI is available.'
}
finally {
  Pop-Location
}

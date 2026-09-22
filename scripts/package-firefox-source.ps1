$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$package = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$source = Join-Path $root 'release\firefox-source'
$archive = Join-Path $root ("release\timeless-" + $package.version + "-source.zip")

if (-not (Test-Path $source)) {
  throw 'release\firefox-source does not exist. Run the source staging script first.'
}

if (Test-Path $archive) {
  Remove-Item $archive -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($archive, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -Path $source -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($source.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip,
      $_.FullName,
      $relativePath,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
}
finally {
  $zip.Dispose()
}

Write-Output ("Firefox reviewer source archive: " + $archive)

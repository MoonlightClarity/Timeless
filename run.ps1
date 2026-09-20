Set-Location $PSScriptRoot

function Test-LocalPort {
    param([int]$Port)

    $client = $null
    try {
        $client = [System.Net.Sockets.TcpClient]::new()
        $pending = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        if (-not $pending.AsyncWaitHandle.WaitOne(250)) {
            return $false
        }

        $client.EndConnect($pending)
        return $client.Connected
    }
    catch {
        return $false
    }
    finally {
        if ($client) { $client.Dispose() }
    }
}

if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$translationRoot = Join-Path $PSScriptRoot "vendor\translation-server"
$translationModules = Join-Path $translationRoot "node_modules\jsdom\package.json"

if (-not (Test-Path $translationModules)) {
    Push-Location $translationRoot
    try {
        npm ci --omit=dev
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    finally {
        Pop-Location
    }
}

$translationProcess = $null

if (-not (Test-LocalPort 1969)) {
    $translationProcess = Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $translationRoot -WindowStyle Hidden -PassThru

    for ($attempt = 0; $attempt -lt 30 -and -not (Test-LocalPort 1969); $attempt++) {
        Start-Sleep -Milliseconds 200
    }

    if (-not (Test-LocalPort 1969)) {
        if ($translationProcess -and -not $translationProcess.HasExited) {
            Stop-Process -Id $translationProcess.Id -Force
        }
        throw "Metadata translation service did not start."
    }
}

try {
    npm run preview -- --host 127.0.0.1 --port 5174 --open
}
finally {
    if ($translationProcess -and -not $translationProcess.HasExited) {
        Stop-Process -Id $translationProcess.Id
    }
}

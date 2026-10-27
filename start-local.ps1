$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeBinary = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (-not (Test-Path -LiteralPath $nodeBinary)) { throw 'Instale Node.js e execute npm install antes de iniciar.' }
if (-not (Test-Path -LiteralPath 'node_modules/vite/bin/vite.js')) { throw 'Execute npm install antes de iniciar.' }
& $nodeBinary node_modules/typescript/bin/tsc -b
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $nodeBinary node_modules/vite/bin/vite.js build --configLoader runner
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $nodeBinary node_modules/vite/bin/vite.js preview --configLoader runner --host 127.0.0.1 --port 5173

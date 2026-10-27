[CmdletBinding()]
param([switch]$SomenteVerificar, [switch]$SemExtensoes)

$ErrorActionPreference = 'Stop'

function Update-SessionPath {
    $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$machinePath;$userPath;$env:Path"
}

function Install-MissingTool {
    param([string]$Command, [string]$Package, [string]$DownloadPage)
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        Write-Host "Disponivel: $Command" -ForegroundColor Green
        return
    }
    if ($SomenteVerificar) {
        Write-Host "Nao encontrado neste terminal: $Command. Fonte: $DownloadPage" -ForegroundColor Yellow
        return
    }
    if (-not (Get-Command winget.exe -ErrorAction SilentlyContinue)) {
        throw "O Windows Package Manager (winget) nao esta disponivel neste terminal. Instale pela fonte oficial: $DownloadPage e execute novamente."
    }
    Write-Host "Instalando $Package pelo Windows Package Manager..."
    & winget.exe install --id $Package --exact --source winget
    if ($LASTEXITCODE -ne 0) { throw "A instalacao de $Package nao terminou. Codigo: $LASTEXITCODE. Fonte oficial: $DownloadPage" }
    Update-SessionPath
    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "Instalacao concluida, mas $Command ainda nao aparece neste terminal. Feche o terminal, abra novamente e execute este script outra vez."
    }
}

# Execute no PowerShell normal do Windows. Nao altera dependencias dos sites.
Update-SessionPath
Install-MissingTool -Command 'node.exe' -Package 'OpenJS.NodeJS.LTS' -DownloadPage 'https://nodejs.org/en/download'
Install-MissingTool -Command 'git.exe' -Package 'Git.Git' -DownloadPage 'https://git-scm.com/install/windows'

foreach ($tool in @('node.exe', 'npm.cmd', 'git.exe')) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        Write-Host "Versao de ${tool}:"
        & $tool --version
        if ($LASTEXITCODE -ne 0) { throw "Nao foi possivel executar $tool." }
    } elseif ($tool -eq 'npm.cmd') {
        Write-Warning 'npm.cmd nao encontrado. Repare a instalacao oficial do Node.js, incluindo o npm.'
    }
}

if (-not $SemExtensoes) {
    $editor = Get-Command code.cmd -ErrorAction SilentlyContinue
    if ($editor) {
        $installed = @(& $editor.Source --list-extensions)
        if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel consultar as extensoes do VS Code.' }
        foreach ($extension in @('dbaeumer.vscode-eslint', 'bradlc.vscode-tailwindcss', 'esbenp.prettier-vscode')) {
            if ($installed -contains $extension) {
                Write-Host "Extensao disponivel: $extension" -ForegroundColor Green
            } elseif ($SomenteVerificar) {
                Write-Host "Extensao opcional ausente: $extension" -ForegroundColor Yellow
            } else {
                & $editor.Source --install-extension $extension
                if ($LASTEXITCODE -ne 0) { throw "Nao foi possivel instalar a extensao $extension." }
            }
        }
    } else {
        Write-Warning 'VS Code nao encontrado no PATH. Editor oficial: https://code.visualstudio.com/'
    }
}

Write-Host 'Verificacao concluida. React, TypeScript e outras bibliotecas devem ser instalados por projeto, conforme o package.json.'

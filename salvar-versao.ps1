[CmdletBinding()]
param(
    [string]$Nome,
    [string]$Email,
    [string]$Mensagem = 'Salva versao atual do portfolio'
)

$ErrorActionPreference = 'Stop'
$gitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
$gitBinary = if ($gitCommand) { $gitCommand.Source } else { Join-Path $env:ProgramFiles 'Git/cmd/git.exe' }
if (-not (Test-Path -LiteralPath $gitBinary)) { throw 'Git nao encontrado. Instale em https://git-scm.com/install/windows' }

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot '.git'))) {
    & $gitBinary -C $PSScriptRoot init -b main
    if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel criar o repositorio Git.' }
}

if ($Nome) {
    & $gitBinary -C $PSScriptRoot config --local user.name $Nome
    if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel configurar o nome do autor.' }
}
if ($Email) {
    & $gitBinary -C $PSScriptRoot config --local user.email $Email
    if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel configurar o email do autor.' }
}
$authorName = & $gitBinary -C $PSScriptRoot config user.name
$authorEmail = & $gitBinary -C $PSScriptRoot config user.email
if (-not $authorName -or -not $authorEmail) {
    throw 'Informe sua identificacao: .\salvar-versao.ps1 -Nome "Seu nome" -Email "seu@email.com". A configuracao sera apenas deste projeto.'
}

& $gitBinary -C $PSScriptRoot add --all
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel preparar os arquivos para o commit.' }
& $gitBinary -C $PSScriptRoot diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Corrija os problemas de formatacao apontados antes de salvar.' }
& $gitBinary -C $PSScriptRoot diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host 'Nenhuma alteracao nova para salvar.'
    exit 0
}
if ($LASTEXITCODE -ne 1) { throw 'Nao foi possivel verificar as alteracoes preparadas.' }
& $gitBinary -C $PSScriptRoot commit -m $Mensagem
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel criar o commit.' }
& $gitBinary -C $PSScriptRoot log -1 --oneline

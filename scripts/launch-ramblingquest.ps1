chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$repoPath = Split-Path -Parent $PSScriptRoot

Set-Location $repoPath

claude

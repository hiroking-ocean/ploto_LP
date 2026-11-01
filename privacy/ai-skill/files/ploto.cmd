@echo off
setlocal
rem Execution-policy-independent launcher. The PowerShell client sends UTF-8 JSON to the loopback API.
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0ploto.ps1" %*
exit /b %errorlevel%

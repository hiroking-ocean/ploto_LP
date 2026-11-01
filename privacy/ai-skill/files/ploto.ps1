# Ploto local API client. No dependency installation or execution-policy changes.
[CmdletBinding()]
param(
    [Parameter(Position = 0)][string]$Method = 'context',
    [Parameter(Position = 1)][string]$ParamsJson = '{}',
    [string]$ParamsFile,
    [string]$NoteFile,
    [string]$TaskId,
    [string]$Revision,
    [ValidateSet('append', 'replace')][string]$NoteMode = 'append',
    [string]$RequestId = [guid]::NewGuid().ToString(),
    [switch]$Compact
)
$ErrorActionPreference = 'Stop'
try {
    # Windows PowerShell 5.1 otherwise inherits a legacy console code page. Keep both
    # terminal I/O and HTTP payloads on strict UTF-8 so Japanese text is never replaced.
    $plotoUtf8 = New-Object System.Text.UTF8Encoding($false, $true)
    [Console]::InputEncoding = $plotoUtf8
    [Console]::OutputEncoding = $plotoUtf8
    $OutputEncoding = $plotoUtf8
    if (-not $env:PLOTO_API_URL -or -not $env:PLOTO_API_TOKEN) {
        throw 'Enable AI integration in Ploto and copy the connection settings, or use its built-in terminal.'
    }
    $plotoEndpoint = [uri]$env:PLOTO_API_URL
    if ($plotoEndpoint.Scheme -ne 'http' -or $plotoEndpoint.Host -ne '127.0.0.1' -or $plotoEndpoint.AbsolutePath -ne '/v1/rpc' -or $plotoEndpoint.UserInfo -or $plotoEndpoint.Query -or $plotoEndpoint.Fragment) {
        throw 'Only the Ploto IPv4 loopback API is supported.'
    }
    if ($NoteFile) {
        if ($Method.Replace('_', '.') -notin @('task.update', 'task.preview')) { throw '-NoteFile requires task.update or task.preview.' }
        if ($ParamsFile -or $PSBoundParameters.ContainsKey('ParamsJson')) { throw '-NoteFile cannot be combined with JSON parameters.' }
        if (-not $TaskId -or -not $Revision) { throw '-NoteFile requires -TaskId and -Revision.' }
        $plotoNote = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $NoteFile).Path, $plotoUtf8)
        if ([string]::IsNullOrEmpty($plotoNote)) { throw 'An empty note file is not accepted. Use explicit JSON to clear a note.' }
        $plotoNoteField = if ($NoteMode -eq 'append') { 'note_append' } else { 'note' }
        $plotoChanges = @{}
        $plotoChanges[$plotoNoteField] = $plotoNote
        $ParamsJson = @{ id = $TaskId; revision = $Revision; changes = $plotoChanges } | ConvertTo-Json -Depth 100 -Compress
    } elseif ($PSBoundParameters.ContainsKey('TaskId') -or $PSBoundParameters.ContainsKey('Revision') -or $PSBoundParameters.ContainsKey('NoteMode')) {
        throw '-TaskId, -Revision and -NoteMode require -NoteFile.'
    }
    if ($ParamsFile) {
        if ($PSBoundParameters.ContainsKey('ParamsJson')) { throw '-ParamsFile cannot be combined with inline JSON.' }
        $ParamsJson = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $ParamsFile).Path, $plotoUtf8)
    }
    $plotoParams = ConvertFrom-Json -InputObject $ParamsJson
    if ($null -eq $plotoParams -or $plotoParams -isnot [pscustomobject]) { throw 'Params must be a JSON object.' }
    $plotoBody = @{ id = $RequestId; method = $Method; params = $plotoParams } | ConvertTo-Json -Depth 100 -Compress
    try { [void]$plotoUtf8.GetBytes($plotoBody) }
    catch [System.Text.EncoderFallbackException] { throw "Invalid Unicode at character index $($_.Exception.Index)." }
    # Disable proxies and redirects so credentials cannot leave this loopback endpoint.
    Add-Type -AssemblyName System.Net.Http
    $plotoHandler = New-Object System.Net.Http.HttpClientHandler
    $plotoHandler.UseProxy = $false
    $plotoHandler.AllowAutoRedirect = $false
    $plotoClient = New-Object System.Net.Http.HttpClient($plotoHandler)
    $plotoClient.Timeout = [timespan]::FromSeconds(40)
    $plotoClient.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue('Bearer', $env:PLOTO_API_TOKEN)
    try {
        $plotoContent = New-Object System.Net.Http.StringContent($plotoBody, $plotoUtf8, 'application/json')
        $plotoResponse = $plotoClient.PostAsync($plotoEndpoint, $plotoContent).GetAwaiter().GetResult()
        $plotoText = $plotoResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        $plotoResult = ConvertFrom-Json -InputObject $plotoText
        $plotoResult | Add-Member -NotePropertyName requestId -NotePropertyValue $RequestId -Force
        $plotoResult | ConvertTo-Json -Depth 100 -Compress:$Compact
        if (-not $plotoResponse.IsSuccessStatusCode -or -not $plotoResult.ok) { exit 1 }
    } finally {
        $plotoClient.Dispose()
        $plotoHandler.Dispose()
    }
} catch {
    @{ ok = $false; requestId = $RequestId; error = @{ code = 'client_error'; message = $_.Exception.Message } } | ConvertTo-Json -Depth 10 -Compress:$Compact
    exit 1
}

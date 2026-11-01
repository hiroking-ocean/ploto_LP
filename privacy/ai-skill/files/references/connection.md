# Connection and text transport

The built-in terminal inherits `PLOTO_API_URL`, `PLOTO_API_TOKEN`, `PLOTO_CLI`, and `PLOTO_SKILL` and starts PowerShell with a process-only execution-policy override. The connection response also advertises `clients.powershell`, `clients.cmd`, and the shell-neutral HTTP protocol; use the `.cmd` launcher with `-ParamsFile` for complex or non-ASCII JSON. Other terminals can call the loopback HTTP endpoint directly with UTF-8 JSON. An external terminal needs the connection settings copied by the user from Ploto. Do not print the token, dump environment variables, or persist credentials. Tokens expire when the session is disabled, the project changes, or Ploto exits. A newly connected session is read-only. The user controls mutation access with the API editing switch beside the terminal, and can revoke it without closing the terminal. When a requested edit needs it, `access.request` asks the user through a dialog in Ploto.

The Windows launcher invokes the bundled PowerShell client with a process-only execution-policy override; it does not change machine or user policy. The client permits only `127.0.0.1`, disables redirects and proxies, and uses strict UTF-8 for console, file, and HTTP text. If that launcher is not permitted or the terminal uses another shell, use an approved native HTTP client with the same UTF-8 JSON protocol.

## Choose an available client

The bundled client targets Windows PowerShell 5.1 (`powershell.exe`), which the app uses. PowerShell 7 (`pwsh`) is not required and may not be installed. Do not attempt `pwsh` or install it just to call this API. In the built-in PowerShell terminal, invoke `$env:PLOTO_CLI`. From `cmd.exe`, use the advertised `clients.cmd` path with `-ParamsFile`. Other external clients can use HTTP directly; that protocol is independent of the shell. A terminal in another machine/container cannot reach the Windows app through its own loopback address.

```powershell
& $env:PLOTO_CLI context -Compact
& $env:PLOTO_CLI gantt.list -Compact
& $env:PLOTO_CLI tasks.list -Compact
& $env:PLOTO_CLI task.get '{"id":"task-id"}' -Compact
```

For Japanese, multiline text or quotes, prefer UTF-8 files. For task notes, use the plain-text `-NoteFile` helper in [notes.md](notes.md). For other requests, create a JSON file with a file-editing tool or a JSON serializer and pass `-ParamsFile`; do not interpolate arbitrary user text into shell source.

## Direct HTTP from an external client

Use the user-provided connection environment on the same Windows host. POST UTF-8 JSON to `PLOTO_API_URL`, with `Authorization: Bearer <PLOTO_API_TOKEN>` and `Content-Type: application/json; charset=utf-8`. Do not send an Origin header; disable proxies and redirects. The request is the **complete envelope**, unlike a CLI `-ParamsFile`, which contains only `params`:

```json
{"id":"daily-review-unique-id","method":"tasks.schedule","params":{"period":"today"}}
```

For a POSIX-compatible shell with curl already available, create this envelope as UTF-8 `request.json` using a file tool, then call:

```sh
curl --silent --show-error --noproxy '*' --max-redirs 0 --max-time 40 \
  -H "Authorization: Bearer $PLOTO_API_TOKEN" \
  -H 'Content-Type: application/json; charset=utf-8' \
  --data-binary @request.json "$PLOTO_API_URL"
```

Use a fresh request ID for a new operation. Check the JSON `ok` field even when the HTTP call succeeds; HTTP clients do not automatically interpret API errors. On an uncertain mutation outcome, reuse the original ID and exact envelope as described in [errors.md](errors.md). Keep tokens out of request files and diagnostic output.

<!-- PLOTO-DOC-END -->

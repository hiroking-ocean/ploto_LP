# Task notes: safe text input

A memo, minutes or background belongs in the relevant task's note, including a summary task. This API does not edit standalone sidebar note tabs. Select the intended Gantt using the main workflow; ask which task only if it is unclear.

## Choose the change

Task notes are exchanged as **plain text in both directions**, in the limited Markdown described below. `task.get` (and `tasks.list` with `response:"full"`) returns `note` and omits it when empty; the underlying rich-text HTML is never exposed. Prefer `note_append` for additions and `note_patch` for an exact partial replacement, optionally calling `task.preview` first. Use `note` only for intentional whole-note replacement. Blank lines start new paragraphs and single newlines become line breaks. Send `note:null` or an empty string to clear it. HTML is never interpreted and is stored as literal text. The final note is limited to 20,000 characters. Notes can also be written on summary tasks.

- Addition: use `note_append`; existing text is preserved by the API. Read existing content if needed to avoid duplicates or understand the context.
- Partial correction: read the complete note or a search hit with `complete:true`, then use `note_patch` with exact `find`/`replace` text. Multiple matches fail unless `all:true` is intentional.
- Rewrite: read the complete note first, then use `note` only when replacing it is the user's intent. Never replace from a search excerpt.
- Clear: use explicit JSON with `note:null`. The file helper rejects empty files to avoid accidental deletion.

## Formatting

Notes accept a small, fixed Markdown subset — exactly what the memo view can display. Everything else is literal text.

| Syntax | Result |
| --- | --- |
| `**text**` | bold |
| `*text*` | italic |
| `__text__` | underline |
| `# text`, `## text`, `### text` | heading levels 1–3 |
| `- text` | bullet list (indent two spaces per nested level) |
| `1. text` | numbered list |
| `[text]{red}` | coloured text: `default`, `red`, `orange`, `green`, `blue`, `purple` only |

Reads return the same syntax, so a note you read can be edited and written back unchanged. Characters that would otherwise be read as formatting come back backslash-escaped (`2 \* 3`, `a\_b`, `\[note]`, `1\. item` at the start of a line) — **keep those backslashes when you write the text back**, or the literal text becomes formatting. Write a backslash the same way to keep a symbol literal.

Anything the user formatted that this syntax cannot express — a colour outside the six names, for example — is lost when you rewrite the note, so prefer `note_append` and `note_patch` over a whole-note `note` replacement. The text itself is always preserved.

## Plain-text file helper (preferred for append/rewrite)

1. Obtain the real task ID and current revision from an appropriate read.
2. Use the AI client's file-editing tool to create a temporary UTF-8 `memo.txt` in the AI workspace. Write the intended text literally, including Japanese, quotes and actual line breaks. This file is transport data, not a separate user deliverable. Do not build it by interpolating the memo into shell commands, here-strings, `echo`, or a second layer of source code. If only a shell is available, use a serializer with a data-input channel that does not evaluate the text; otherwise ask for a prepared UTF-8 file.
3. Call the bundled client with only paths and IDs on the command line. Substitute actual IDs/revisions below:

```powershell
& $env:PLOTO_CLI task.preview -TaskId 'task-id' -Revision 'r1-current' -NoteFile '.\memo.txt' -Compact
& $env:PLOTO_CLI task.update -TaskId 'task-id' -Revision 'r1-current' -NoteFile '.\memo.txt' -Compact
```

Preview is optional; the first command changes nothing. The helper defaults to append. For an intentional full rewrite, add `-NoteMode replace` to both calls. It reads UTF-8 text and serializes JSON internally; the memo never passes through command-line quoting. The `.cmd` launcher accepts the same file arguments.

Example file contents (literal text, not JSON or shell code):

```text
議事メモ「受入テスト」
担当者: "田中"

次回までに確認する。
保存先の例: C:\work\notes
記号も本文: $value、$(example)、バックティック `
```

## Partial edits and other complex requests

Create UTF-8 JSON directly with a file-editing tool, or serialize a data object; pass it via `-ParamsFile`. JSON strings encode line breaks as `\n`, quotes as `\"`, and backslashes as `\\`. Do not hand-concatenate arbitrary text into JSON. Example `note-patch.json`:

```json
{"id":"task-id","revision":"r1-current","changes":{"note_patch":{"find":"次回までに確認する。","replace":"次回までに確認する。\n担当: 田中"}}}
```

```powershell
& $env:PLOTO_CLI task.update -ParamsFile '.\note-patch.json' -Compact
```

## Verify

Inspect the response and `plotoErrors`. A full response that confirms the intended note needs no duplicate read; otherwise read `task.get` once and check Japanese, quotes, line breaks and preserved text. On uncertain outcome, follow [errors.md](errors.md) before changing or removing the input file. After a confirmed outcome, remove only the temporary transport files created for this operation. Report the named task and remind the user to review and save in Ploto.

<!-- PLOTO-DOC-END -->

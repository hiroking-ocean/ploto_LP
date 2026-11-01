# Daily task review

Use `tasks.schedule` for "due today", "this week", "upcoming" and "overdue" instead of downloading `tasks.list` and calculating dates yourself. This read-only query covers Gantt task schedules and unfinished ToDo deadlines. A matching ToDo includes its parent task even when that parent's schedule is outside the range, missing, complete, or a summary row. It does not navigate or change tasks.

## Choose a query

| User request | Parameters |
| --- | --- |
| Tasks due today | `{}` or `{"period":"today"}` |
| What needs doing today / today's actions | First `{"period":"today","match":"overlap"}`, then `{"period":"overdue"}` sequentially; combine by Gantt/task ID |
| Tasks due this week | `{"period":"this_week"}` |
| Tasks due next week | `{"period":"next_week"}` |
| Tasks planned to be active today | `{"period":"today","match":"overlap"}` |
| Tasks starting this week | `{"period":"this_week","match":"start"}` |
| Overdue tasks | `{"period":"overdue"}` |
| Due in a specific inclusive range | `{"from":"2026-09-09","to":"2026-09-15"}` |

Use `match:"due"` for deadlines and `match:"overlap"` for work planned during a period. If the user just says "this week's tasks", use overlap and describe them as planned work. "Upcoming" without a stated range can use this week; state the actual returned range. Do not silently treat all these questions as deadlines.

For "what do I need to do today?", include unfinished ToDos due today and earlier, alongside active/overdue tasks. Inspect returned `health.todos` and `schedule_match`, not just the task's `due_date`. If a recent complete outline already provides the relevant health alerts, reuse it rather than repeating reads only to check ToDo dates. Explain which items are overdue and which are due/planned today; do not claim every active task must be finished today. Use `task.get` only if the user needs the actual ToDo text rather than task-level alerts/counts.

The app resolves presets from its PC's local date. Weeks run Monday through Sunday, including weekends; this week includes earlier days of the week. Read the returned `today`, `timeZone`, `from` and `to`, rather than guessing from the AI environment's clock. Explicit ranges require both dates in `YYYY-MM-DD`; both endpoints are inclusive. Do not combine `period` with `from`/`to`.

## Dates and filters

- `match` is `due` (default), `start`, or `overlap` (any scheduled day intersects the range).
- `due_date` means the task's **last scheduled calendar day**, not a separately stored deadline. A three-day task starting September 7 is due September 9; the underlying API end boundary is September 10 (exclusive). Zero-day tasks match their start day. Do not subtract a day from `due_date` again.
- Complete tasks (`progress >= 1`) are excluded from task-schedule matching by default. Set `includeCompleted:true` to include them. Completion here uses task progress, not a Kanban column. An unfinished ToDo's deadline can still include a complete parent; completed ToDos never match.
- Summary rows with children are excluded from task-schedule matching by default to avoid repeating their children's work. Set `includeSummaries:true` if needed. A summary's own unfinished ToDo can still include that summary row.
- `tags` (an array of tag names) keeps only tasks carrying every listed tag, e.g. `{"period":"this_week","tags":["レビュー"]}`. Names no task in scope carries come back in `unknownTags`.
- `overdue` means an incomplete task whose `due_date` is before today, or a task holding an unfinished ToDo dated before today. It requires `match:"due"` and does not accept `includeCompleted:true`. Today's earlier times count as today, matching the health display.
- Tasks without a usable start date or calendar duration cannot match their own schedule; `undated` counts these after the completion/summary filters. Such a task can still appear because of its ToDo deadline. If nonzero, mention that the review cannot cover all task dates. It is not the number of matches omitted by pagination.
- Scope follows [reading.md](reading.md): visible Gantt by default; `scope:"project"` only for a cross-project request (or automatic fallback on a non-Gantt tab). Each project-scope row identifies its Gantt. Check the echoed `scope`.

## Small responses and pagination

Results contain outline fields including the shared `health`, `due_date` when the task has a valid schedule, ancestor `path` when present, and `editing:true` when a detail editor holds a draft. `schedule_match.task` states whether the task's own schedule matched; `schedule_match.todos` counts its unfinished ToDos whose deadline dates matched the query. A row can have a future task `due_date` because only its ToDo matched: do not label that task's own schedule overdue. No note bodies, ToDo items or dependency links are returned. Use `task.get` only when the user needs content; use `tasks.list` for dependencies before a scheduling edit. An editing row is provisional and can have an uncommitted date change on screen.

`limit` defaults to 20 and accepts 1–50. `offset` defaults to 0. Rows sort earliest date first (due date for due queries, start date otherwise); ties follow sidebar/task order. The response includes `total`, `truncated`, and `nextOffset` when more matches exist. For the full result, repeat the same filters with `offset:nextOffset`; for an overview, report the displayed count and total. Pagination reads the live model, not a frozen snapshot: restart if the user edits or navigates between pages. Across midnight, use the returned explicit `from`/`to` for a fixed date range, or restart the preset query.

```powershell
& $env:PLOTO_CLI tasks.schedule -Compact
& $env:PLOTO_CLI tasks.schedule '{"period":"this_week","match":"overlap"}' -Compact
& $env:PLOTO_CLI tasks.schedule '{"period":"overdue","scope":"project"}' -Compact
```

These are alternatives, not a checklist. No write permission is needed for a daily review.

<!-- PLOTO-DOC-END -->

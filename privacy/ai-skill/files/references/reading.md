# Reading and discovery

For daily or date-range reviews, use [tasks.schedule](schedule.md) to filter in the app. Do not fetch the entire chart to calculate today's or this week's tasks.

## Shared task health

Every task row in outline/full lists, searches, schedule reviews and task detail includes `health`, computed by the same evaluator as Ploto's health line and tooltip. Use the app's returned values; do not independently reinterpret or calculate these health rules. `healthContext` reports the app's local `today`, `timeZone` and UTC `asOf` for that read. Health is read-only, changes with time, and is not a task revision or a writable field.

- `health.status` is the health line's worst status over the task and its entire subtree: `danger` (危険), `warning` (警告), `normal` (順調), `completed` (完了), or `upcoming` (開始前). Filtering/depth does not remove hidden descendants from this calculation.
- `health.own` is the task's own evaluation, with `status`, `endOverdue`, `startDelayed`, `todoOverdueCount`, and `todoDueTodayCount`: unfinished past-end tasks or overdue ToDos cause danger; progress-zero tasks whose start has arrived or ToDos due today cause warning. Task end dates are exclusive. This is a warning about needed attention, not proof the task must all be completed today.
- `health.todos` reports the task's own incomplete checklist: `remaining`, `overdueCount` (deadline date before today) and `dueTodayCount` (deadline date today). These counts do not require downloading ToDo text. **Check these even if health is completed or upcoming**: the UI suppresses the own-health evaluation for complete/future tasks, but unfinished ToDos can still need action. Completed ToDos are excluded. Today's deadlines stay in today's count even if their clock time has passed; this matches the UI's calendar-day rule.
- `health.descendants` gives the counts of danger/warning descendants (excluding the task itself), as in the folded-row badges. Do not double-count a parent rollup and its children's individual issues.

A recent outline already tells you about deadline alerts; do not fetch every task's full ToDos just to discover whether anything is overdue. Use `task.get` when actual checklist text is needed. For "what must I do today?", include both today's work/ToDos and existing overdue work, as described in the schedule guide. Never interpret omitted ToDo text as no ToDos or no deadlines.

Call the Ploto API strictly sequentially, including reads: await each response before sending the next request. Concurrent calls can return `busy`; parallel shell jobs do not accelerate this API. Examples below are alternatives, not a checklist to execute in full.

For nearby targets, use one `tasks.list` with `parent` and an appropriate `depth`. For a known task's details use `task.get`; for discovery use a narrow `tasks.search` (use `in:["name"]` when only the name matters). There is no arbitrary task-ID bulk-read method in this version: do not invent `ids` parameters or put reads into `batch.execute`.

Keep one recent `context` per uninterrupted read-and-write operation. Refresh it after navigation, user interaction, a substantial planning pause, or a response indicating the target or access changed. Do not duplicate it immediately before and after each read. Check the response's target Gantt whenever supplied; revision checks protect task contents but do not replace checking the intended chart.

After editing, inspect the mutation response first. Re-read the affected subtree once when structure or resulting dates need verification. For scheduling or dependency changes, follow links beyond the subtree and verify affected tasks there too; widen to an outline of the chart only if the affected scope cannot be established. Simple field edits already confirmed by a full response need no identical read. Check delayed errors once after substantial work using `errors.list`; automatic highlighting needs no additional call.

On conflicts or uncertain outcomes, follow [exceptions](errors.md).

Reads come in three tiers. Start at the cheapest one that answers the question; a Gantt built through this API can hold hundreds of tasks, and pulling every note into the conversation on each new session wastes the user's budget for no benefit.

When `context.showWbs` is true, task rows include a read-only `wbs` string (for example `"2.1.3"`). Use the returned number to discuss or locate the user's task, and use its associated `id` for API calls. WBS numbers are chart-local positions, so confirm the Gantt and refresh the relevant outline after structure or sort changes. A subtree, search result or schedule result retains the whole chart's numbering; never renumber a filtered result yourself. Never add numbering to task text or submit `wbs` in a mutation.

| Tier | Method | Use it for |
| --- | --- | --- |
| Structure | `tasks.list` | The hierarchy, dates, progress and colors of the whole chart or one subtree. No note bodies, no ToDo items. |
| Search | `tasks.search` | Finding the tasks a question is about, by keyword, with the matching slice of the note. |
| Detail | `task.get` | One task in full: complete note text and every ToDo. |

`tasks.list` rows do not contain note or ToDo content, but they always report whether it exists: `note_chars` is the length of the task's note, and `todo_count`/`todo_done` count its checklist. **A row without `note_chars` has no note; a row with it has one you have not read.** Never answer a question about a task's background, decisions or history from a structure row alone — search for it, or `task.get` it. These read-only counts are deliberately named apart from the writable `note` and `todos` fields; never send them back in `changes`. Likewise `icon_count` means the row has icon markers (milestones, events) on the timeline; read them with `task.get` or `icons.list` before describing what happened or is due on that row — see [icons](icons.md).

When the user asks about a topic rather than a named task ("what did we decide about the vendor", "where is the acceptance testing"), reach for `tasks.search` first. It scans task names, note text and ToDo text and returns only the tasks that matched, so what you pay is proportional to the number of hits, not to the size of the chart.

Tags are the user's own grouping of tasks that share a property. When a question names or implies a category that exists in `context.tags` ("the legal items", "everything tagged review"), filter by it: `{"tags":["法務"]}` alone lists that tag's tasks, and `{"query":"契約","tags":["法務"]}` narrows a keyword search. Combine with `scope:"project"` when the category spans Gantts. Keyword search does not look inside tag names, so use the filter rather than putting a tag name in `query`. Do not treat a tag filter as exhaustive for the topic: untagged tasks may still be relevant, so add a keyword search when completeness matters.

### Scope

`tasks.list` and `tasks.search` take a `scope`, and the default is **the one Gantt the user is looking at**. Keep it there. Almost every request is about the chart on screen, and widening to the whole project to answer it drags in tasks from unrelated plans — more to read, more to confuse, and a worse answer.

Pass `scope:"project"` only when the target genuinely is not in the current Gantt: the user is looking for something and does not say where it is, says it might be in another plan, or asks a question that spans the file. Prefer one `tasks.search` with `scope:"project"` over selecting each Gantt in turn — it does not navigate, so the user's screen stays where it is.

When no Gantt tab is active (a board, note, or whiteboard is on screen), there is no current Gantt, so the scope falls to `"project"` on its own; asking for `scope:"gantt"` there is rejected with `active_tab_not_gantt`. **Every reply echoes the resolved `scope`** — read it, and do not assume you got the narrow one. In project scope each row carries its own `gantt`, since that is the Gantt you would have to `gantt.select` before changing it.

Searching is discovery, not navigation: it never moves the user's screen, and it does not make another Gantt writable. To edit something you found in another Gantt, `gantt.select` it first, re-read `context`, and then write — the user needs to see where the change lands.

For recording memos, follow [notes.md](notes.md).

<!-- PLOTO-DOC-END -->

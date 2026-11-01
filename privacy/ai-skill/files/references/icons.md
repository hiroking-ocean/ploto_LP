# Icon markers

Icon markers are symbols placed on one task row at one day on the Gantt timeline. They mark a point in time: a milestone, a decision, something that happened that day, or anything the user wants to stand out. They do not change the schedule, and they are not tasks.

An icon has:

- `task_id` and `date`: the row and day cell it sits on. One icon per row and day.
- `label`: a short title drawn above the icon on the chart. Everyone looking at the chart sees it.
- `notes`: plain-text details that appear only on hover. Use it for context, not for the headline.
- `symbol` and `color`: the visual meaning.

## Reading

- Task rows from `tasks.list`, `tasks.search` and `tasks.schedule` carry `icon_count` when that row has icons. Like `note_chars`, it only signals unread content.
- `task.get` includes the task's `icons` with full labels and notes.
- `tasks.schedule` also returns `icons` dated within the resolved range (not for `overdue`), with `iconsTotal`. Mention these when summarizing a day or week: they are often milestones or events the user placed on purpose.
- `icons.list` answers "what milestones/events are there" directly: filter with `from`/`to`, `taskId`, `query` (label and notes), or `scope:"project"`. Rows are sorted by date and include `task_name`, `path`, and `wbs` when numbering is on.

Report icons by their `label`, date and row name. A `color_name` is returned when the color is a palette color; otherwise describe the color only if it matters.

## Writing

Only add icons when the user asks for markers, milestones or highlights, or when a requested plan explicitly calls for them. Do not decorate every task.

1. Choose the row: the task the event belongs to. For a project-wide milestone use the summary row it concludes, or the milestone task if one exists.
2. Choose the date: the day the event happens or is due.
3. Write a `label` of a few words that reads on its own on the chart, such as `Release`, `Client review`, `Spec frozen`. Put reasons, attendees and links in `notes`.
4. Choose symbol and color by meaning, and stay consistent within a chart: read existing icons with `icons.list` first and reuse the conventions already there.

| Symbol | Use for |
| --- | --- |
| `Flag` | Milestone, deadline, release, go-live |
| `Star` | Important or highlighted moment |
| `CheckCircle2` | Approval, sign-off, completion, passed review |
| `AlertTriangle` | Risk, issue, blocker, incident |
| `Bookmark` | Record of something that happened, reference point, decision log |
| `Sun`, `Cloud`, `CloudRain`, `CloudSnow`, `CloudLightning`, `Wind`, `Umbrella` | Weather conditions (for example site work) |
| `Moon` | Night work, closure, off day |

Default color intent: `red` for risks and hard deadlines, `orange` for warnings, `yellow` for highlights, `green` for approval and completion, `blue` for neutral milestones, `purple` for external events, `grey` for past records. Use `#RRGGBB` only when the user specifies an exact color.

`task_undated` means the task has no usable dates for `"last_day"`. `icon_cell_occupied` means that row already has an icon on that day; its `details.existingId` names it. Update that icon or pick another row, instead of retrying. Place several icons, or tasks together with their icons, in one `batch.execute`: it is one Undo step. `task_id` accepts a `@ref` for a task the same batch creates.

`date` also accepts `"last_day"`, which places the icon on the task's last working calendar day (the returned `last_day`) as it stands after the write, including scheduling within the same batch. It is resolved once: the icon does not follow later schedule changes. Use it for "mark the end of this task" instead of calculating the date yourself. Like every edit, icons must still be saved by the user in Ploto.

<!-- PLOTO-DOC-END -->

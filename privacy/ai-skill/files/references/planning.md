# Task structure, scheduling and batches

## Task creation: names, hierarchy and numbering

Before submitting `task.add` or a creation batch:

1. Put only the task name in `text` at every level: parent/summary, child and grandchild. For example, use `"要件定義"`, not `"1. 要件定義"`, `"1.1 要件定義"` or `"① 要件定義"`. Never add sequence or hierarchy numbering to task names, including top-level phase headings. Preserve numbers that are part of the actual name, such as a product version.
2. Express hierarchy with `parent` (an existing task ID or a batch `@ref`) and sibling placement with `before` / `after` when needed. Do not encode either in `text`. Ploto assigns WBS numbers automatically; never calculate or submit `wbs`, or copy WBS numbers into task names, notes or ToDos.
3. Check every planned `text` value before writing, especially parent/summary names, and remove any numbering you added. After creation, verify the affected outline for correct names and parent relationships. When `context.showWbs` is true, use only the returned `wbs` values in conversation; when false, report task names.

## Optional priority: importance and urgency

Priority is the existing two-dimensional plane, not a single rank: `priority: { "importance": 75, "urgency": 25 }` places a task high on the vertical importance axis and low on the horizontal urgency axis. Both scores range from 0 (low) to 100 (high), and both must be supplied together. Decimals are accepted. Send `priority:null` to clear the position. Omit it to leave a new task unassigned or preserve an existing task's position. Unset is different from low priority or a neutral 50/50; never fill unknown values with defaults.

Do not add priorities to every task whenever creating a plan. Use them when the user requests prioritization, or an authorized planning request involves deciding which competing tasks to tackle first. Parallel dates alone are insufficient: tasks with different available owners may proceed together without any priority decision. Check shared people/resources, dependencies, deadlines, consequences of delay and available slack in the relevant scope. Read notes or ToDos when outline data cannot establish the reason. Preserve existing positions unless the request includes reprioritization.

- **Importance** is the impact on the goal, deliverable, customers or risk if the task is left undone. A task that unlocks important downstream work can be important even if its own due date is distant. Do not derive importance solely from the deadline, task name or WBS depth.
- **Urgency** is how soon action is necessary given the deadline, remaining effort, dependencies and slack. A distant delivery can still require action now; a near date alone does not establish urgency without that context. Urgency is an assessment at the time of the edit, not a score Ploto automatically updates as time passes.

Use the user's explicit scores or criteria first. Otherwise, when evidence is sufficient, use consistent coarse anchors (for example 25 low, 50 medium, 75 high) rather than implying unsupported precision. Explain the assessment and its reason when reporting it; do not insert explanations into notes unless requested. If either axis lacks evidence, leave the task unassigned or ask a focused question when the missing decision prevents the requested prioritization. Never silently overwrite the user's ratings or turn a priority decision into unauthorized schedule, dependency or assignment edits.

The four regions help communicate actions, without automatically changing the plan: high importance/high urgency calls for attention first; high importance/low urgency calls for planned time; low importance/high urgency calls for checking a limited response or delegation; low importance/low urgency calls for considering deferral. These are suggestions to discuss, not permission to delete, reassign or reschedule tasks.

Use `task.add`, `task.update`, `task.preview`, or task operations within `batch.execute`. For an existing task, read its current revision and priority first:

```json
{ "id": "task-id-from-Ploto", "revision": "r1-token-from-Ploto", "changes": { "priority": { "importance": 75, "urgency": 25 } } }
```

The API maps urgency to the existing horizontal coordinate and importance to the existing vertical coordinate. Never submit internal `matrix_x` or `matrix_y` fields. Assigned priorities are visible in outline/search/schedule rows and full task responses; an omitted `priority` means no complete valid position is assigned.

## Tags: shared categories across tasks

A tag groups tasks that **share a property** — a kind of work (`review`, `procurement`), a concern (`risk`, `legal`), a customer or product line, a recurring deliverable — so that people can filter the Notes and Kanban tabs by it and you can find the group again with `tasks.search {"tags":[...]}`. Tags are one project-wide vocabulary shared by every Gantt. A tag is only useful if the same name is applied consistently; a vocabulary full of near-duplicates or one-off labels makes filtering worse than having no tags.

- **Reuse first.** `context.tags` lists every existing tag name. Pick from it before inventing anything. Treat singular/plural, abbreviations, translations and synonyms of an existing tag as that tag (`レビュー` exists → do not add `Review` or `レビュー作業`). Case, full/half-width and spacing variants are matched automatically.
- **Create sparingly.** Introduce a new tag only when no existing tag fits and the category will apply to several tasks, now or foreseeably. Keep names short nouns in the language the project already uses for its tags. Do not create tags that duplicate other fields: hierarchy/phase (use `parent`), dates or status (use schedule, progress and Kanban), priority (use `priority`), assignee, or anything unique to a single task (put that in the name or note). When a request would add several new tags, say which ones you are adding.
- **Tag when asked or when organizing.** Tag tasks when the user asks you to tag or organize information, or when adding tasks to a plan that already uses tags for the same kind of work. Do not tag every task routinely. Preserve existing tags unless retagging is part of the request.
- **Full replacement.** `tags` replaces the task's whole list. Outline, search and schedule rows show the current `tags`, so start from that list: to add a tag send the existing names plus the new one; to remove one send the rest; `[]` removes all. Omit `tags` to leave them unchanged.

```json
{ "id": "task-id-from-Ploto", "revision": "r1-token-from-Ploto", "changes": { "tags": ["レビュー", "法務"] } }
```

`task.add` takes `tags` at the top level; `task.update`, `task.preview` and batch task operations take it in `changes`. At most 20 tags per task, 50 characters per name, no commas or line breaks. A name that matches no existing tag creates it (with a color picked by Ploto); the write reply lists such names in `createdTags`, and `task.preview` reports them in `newTags` without creating anything. Check these lists against your intent — an unexpected entry usually means a typo of an existing tag, which you should fix on the task. Tag renaming, recoloring and deletion are done by the user in Ploto, not through the API.

## Visual color consistency

Task color is human-facing project information, not decoration. People scan a Gantt before reading every label: matching colors suggest shared ownership, phase, workstream or hierarchy, and an isolated different color suggests a deliberate exception. An accidental color therefore changes what the plan appears to mean. Preserve the chart's visual grammar whenever adding, moving, copying, restructuring or recoloring tasks.

Use the smallest palette that carries the required distinctions, and let indentation, ordering, summary rows, labels and dependency links carry what they already express. Add a distinct color only when it helps a human separate meaningful categories at a glance — never one color per task, per nesting level, or per minor status. When choosing between a new distinction and an established color, reuse.

Before creating tasks in an existing Gantt, use a recent scoped `tasks.list` result to inspect the destination parent, its existing children, and relevant siblings. Choose color using this precedence:

1. Follow an explicit color or color-semantic instruction from the user.
2. If the destination parent has an explicit `color`, give a new child that same color unless the surrounding children clearly establish another deliberate convention. This mirrors the normal UI expectation for children grouped under a colored parent; do not assume the API will inherit it when `color` is omitted.
3. If the parent has no explicit color and comparable siblings consistently use one color, reuse that exact palette ID or HEX value.
4. If nearby colors are mixed, appear to encode statuses/categories, or provide no clear pattern, do not guess from task wording. Preserve the default by omitting `color`, or ask the user when color materially affects the requested organization.

Apply one decision consistently to every comparable task in the same operation or batch. No alternating or rainbow colors to make a plan look varied, and no several tones of one hue unless the difference is clearly visible and already means something. Equally, do not flatten deliberate distinctions into a single color. In a new empty Gantt, use the default color throughout; introduce more only when the user asks or when you are defining a small, explainable scheme such as one palette color per top-level workstream.

When moving a task, keep its color by default. Re-evaluate only if the destination has a clear convention, or if the old color would falsely imply membership in the old group; when recoloring was not implied and the meaning is ambiguous, ask rather than change it silently. When adding under several parents, resolve each parent's convention independently.

During the affected-scope verification after a substantial add or restructure, look for outliers: a new child differing from an otherwise uniform group, a summary and its children in unrelated colors, or a stray custom HEX among palette colors. Color must reinforce labels and hierarchy, never be the only carrier of essential meaning. Report any scheme you introduced so the user can review it in Ploto.

```powershell
& $env:PLOTO_CLI task.add '{"text":"Design","start_date":"2026-09-07","duration":3}' -Compact
& $env:PLOTO_CLI errors.list '{"after":0}' -Compact
# Use the real ID and revision returned by task.get:
& $env:PLOTO_CLI task.update -ParamsFile '.\task-update.json' -Compact
# Restore the default task color (use the latest revision):
& $env:PLOTO_CLI task.update '{"id":"task-id","revision":"r1-token-from-task-get","changes":{"color":null}}' -Compact
# Delete a task using the latest revision returned by task.get:
& $env:PLOTO_CLI task.delete -ParamsFile '.\task-delete.json' -Compact
# Use task IDs returned by tasks.list:
& $env:PLOTO_CLI link.add '{"source":"predecessor-id","target":"successor-id"}' -Compact
# Create a complete WBS with one request:
& $env:PLOTO_CLI batch.execute -ParamsFile '.\wbs-batch.json' -Compact
# Write a task note. Use -ParamsFile for multi-line text so the shell cannot mangle it:
& $env:PLOTO_CLI task.update -ParamsFile '.\task-note.json' -Compact
# Clear a note:
& $env:PLOTO_CLI task.update '{"id":"task-id","revision":"r1-token-from-task-get","changes":{"note":null}}' -Compact
# Replace a task's ToDo list. Read the current todos first and send the complete new list:
& $env:PLOTO_CLI task.update -ParamsFile '.\task-todos.json' -Compact
# Fetch member IDs when assigning a ToDo:
& $env:PLOTO_CLI members.list -Compact
```

## Worked example: read, plan, write

The user asks, about the plan already on screen: "Add a three-week acceptance-test phase after development, with a test-plan and a test-execution task."

1. **Read the situation.** `& $env:PLOTO_CLI context -Compact`
   Confirm `gantt.name` is the chart the user means, `ganttReady:true` and `allowWrite:true`. Keep the returned `errorCursor`.
2. **Read the plan.** `& $env:PLOTO_CLI tasks.list '{"depth":1}' -Compact`
   The structure outline is enough here: take the development phase's real ID (used below as `ph-dev`), the color its comparable sibling phases use, and any revisions you will need. Never invent IDs for tasks that already exist. On a large chart, start with `'{"depth":2}'` to see the phases, then `'{"parent":"ph-dev"}'` for the part you are about to touch. If the user had instead asked *"what did we agree with the vendor?"*, the first call would be `tasks.search '{"query":"ベンダー"}'` — not a full listing.
3. **Plan the whole change, then write it once.** `ref` and `@ref` let later operations in the same batch reference tasks the batch itself creates, so no intermediate read is needed. Save this as `uat-batch.json`:

```json
{ "response": "minimal", "operations": [
  { "method": "task.add", "params": { "ref": "ph-uat", "text": "Acceptance test", "type": "project", "after": "ph-dev", "color": "blue-base" } },
  { "method": "task.add", "params": { "ref": "uat-plan", "text": "Test plan", "parent": "@ph-uat", "start_date": "2026-10-05", "duration": 5, "color": "blue-base" } },
  { "method": "task.add", "params": { "ref": "uat-run", "text": "Test execution", "parent": "@ph-uat", "start_date": "2026-10-12", "duration": 16, "color": "blue-base" } },
  { "method": "link.add", "params": { "source": "@uat-plan", "target": "@uat-run" } }
] }
```

   Note that `after: "ph-dev"` is a real ID read in step 2, while `@ph-uat` names a task this batch is creating. The reply's `refs` array carries the IDs Ploto assigned, which is what you use if a later request needs to touch these tasks.

   `& $env:PLOTO_CLI batch.execute -ParamsFile '.\uat-batch.json' -Compact`
4. **Check for trouble.** Read `plotoErrors` in the reply, then `& $env:PLOTO_CLI errors.list '{"after":<errorCursor from step 1>}' -Compact`.
5. **Verify the affected scope.** Use `tasks.list` with `parent` set to the new phase ID returned in `refs`. Check its placement using the relevant parent's outline when needed, and follow any dependency links leaving this subtree to check scheduling effects. Reuse this read for the color check.
6. **Report.** The changed tasks are highlighted automatically. Say what changed, and that it exists only in the working model until the user saves it in Ploto.

Batch the writes. The API serializes requests and each CLI call is a separate round trip, so issuing those four operations one at a time is several times slower, produces four separate Undo steps instead of one, and runs the scheduler four times. Split a batch only when a later operation genuinely depends on a value you can read only after an earlier write.

<!-- PLOTO-DOC-END -->

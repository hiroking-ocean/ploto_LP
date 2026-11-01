# Kanban workflows

A board is a reusable workflow, each stage is a step, and each assigned task is one instance of that workflow. Standard ToDos describe the work for each stage.

## When Pro is missing

Kanban creation and edits require Ploto Pro as well as API editing permission. If `context.entitlements.ready` is true and `context.entitlements.pro` is false, call `license.show {}` once for the user's requested Kanban operation instead of only refusing it. This opens the Pro purchase/activation dialog without buying anything. If an attempted operation returns `pro_required`, Ploto already requests the dialog; do not call `license.show` again. Do not treat entitlement loading as proof that Pro is missing.

Explain the blocked operation in one or two sentences, in the user's language: say that Pro is required, mention at most one benefit relevant to their request, and point to purchase or serial-code activation in the opened dialog only if it was successfully requested. For example: "Creating a Kanban board requires Ploto Pro. Its stages and standard ToDos let you share a repeatable workflow; you can purchase or activate Pro in the license dialog I opened."

Keep the explanation factual and optional. Do not list unrelated Pro features, invent prices, promise outcomes, add urgency or pressure, or turn general discussion/read-only board access into a purchase prompt. If the user declines, closes the dialog or asks to continue without Pro, respect that choice: no automatic retries, repeated prompts or reopening for the same blocked request. Do not change project data as a workaround without the user's direction. Retry the requested operation only after activation and closing the dialog, then refresh `context` and check editing permission.

## Read and select

- `board.list {}` returns all boards with ids, names and descriptions.
- `board.select {"id":"board-id"}` opens a board. Then `board.get {"id":"board-id"}` reads its live stages, standard ToDos, assigned task outline, revision and rules. Context reports `board`, `boardReady` and optional `boardError`; `ready` describes the selected board while `ganttReady:false` is expected. Retry `board_not_ready` after its delay; do not recreate the board.
- `task.get {"id":"task-id"}` works on the selected board as well as on a Gantt. It returns the full task, ToDos and exact task revision. On a board it can also read an unassigned task discovered with `tasks.search` or `tasks.list` in project scope.
- Task get/list/search/schedule and full mutation replies include `kanban: {board_id, board_name, stage_id, stage_name}`, or null for an unassigned task. Use these names in conversation. ToDos include `kanban_status_id` and `todo_template_id` when applicable; resolve their stage names through board.get.

## Create and configure

`board.create {"name":"Article production","description":"Publish reviewed articles","stages":[{"title":"Draft","todos":[{"text":"Write the draft"}]},{"title":"Review","todos":[{"text":"Review and approve"}]}]}` creates and selects the board. The completed stage is created automatically.

`board.update {"id":"board-id","revision":"exact-board-revision","name":"New name","description":"Workflow instructions","stages":[...]}` updates metadata and/or stages. Omit fields to preserve them. Read board.get first. `stages` is the complete ordered list of non-completed stages: retain every existing stage id and omit id only for new stages. Do not send the fixed completed stage. Stage deletion and board removal are GUI operations in this version.

Each stage accepts id, title, description, color, icon and todos. The supplied todos array replaces that stage's standard ToDos; include existing template ids to retain them, omit id to add, omit a template to delete it, and reorder the array to reorder templates. Omit todos to preserve them. Standard changes apply to future assignments; existing task checklists and completion records remain intact. Read responses include display_order/completed fields which are not writable; send only the documented parameters.

Stage `color`, `icon` and `description` exist for humans to tell a task's status apart at a glance, not for the AI's own bookkeeping — weigh a change to them the same way you would a visible label. `color` and `icon` are painted onto every task in that stage wherever the board's workflow surfaces beyond the board itself, most visibly the status column and cell colors on the Gantt grid; picking one is choosing how the whole stage reads across the app, not decorating one card. `color` accepts a Ploto palette ID (hue `red`/`orange`/`green`/`blue`/`purple`/`grey` combined with tone `base`/`lightest`/`light`/`dark`, e.g. `orange-light`) or a six-digit `#RRGGBB` value; as with task colors (see [api.md](api.md)), prefer a palette ID and reserve hex for a color the user gave exactly. Send `null` to remove the color and fall back to the default dot. `icon` accepts one preset name from a fixed set (for example `Inbox`, `Clock`, `Play`, `Eye`, `CheckCircle2`, `Pause`, `AlertTriangle`, `Star`, `Flag`, `User`); an `invalid_icon` rejection lists every accepted name. Send `null` or `""` to remove the icon and fall back to a plain color dot. Reads return the same palette ID or hex a write would accept, never a raw CSS value.

`description` is the stage's memo: free-form plain text for how to actually do the work in that stage — steps, a checklist a standard ToDo is too rigid for, links to a manual, exceptions. It is a companion to the stage's standard ToDos, not a replacement: standard ToDos are the up-front checklist generated onto every task that enters the stage, while the memo is where to put procedural detail that does not fit as discrete checkable items. Only set it when the user is actually documenting how the stage works; do not invent process documentation the user has not described. It is plain text, at most 2000 characters, and any HTML the user already wrote in the memo through the GUI is discarded the moment the AI writes a new value — read it back first if the change should build on what is there rather than replace it.

## Assign and move

`board.task.move {"board_id":"selected-board-id","id":"task-id","revision":"exact-task-revision","stage_id":"target-stage-id"}` assigns an unassigned task or moves a task already on this board. Initial assignment is to the first stage only and generates all stages' standard ToDos once. To change boards or remove a task from a board, use the GUI; these operations affect existing stage ToDos.

Movement enforces the same application policy as drag/drop and the detail editor. Unfinished ToDos in any preceding stage block movement. Entering the completed stage also requires all common ToDos complete and progress at 100%; parent tasks depend on child progress. No force flag or revision override exists for board operations. Unknown fields are rejected.

On `incomplete_stage_todos`, explain the blocker using `error.details.incomplete_todos` (id, text, stage id/name) and the target stage. The task and ToDos have not changed. Never complete, delete, rename or move ToDos merely to defeat the restriction. Ask for the actual work result if it is unknown. An error is useful information about the workflow, not a reason to bypass it.

## Record work

`board.todo.update {"board_id":"selected-board-id","id":"task-id","revision":"exact-task-revision","todo_id":"todo-id","status":"completed"}` records actual work while preserving all other ToDos, their identities, template origins and timestamps. Read task.get first. As in the GUI, unfinished stage ToDos are in progress only in the current stage; other stages' unfinished ToDos are not started. Task progress recalculates when automatic progress is enabled. Complete only work the user reports done or that you actually executed and verified.

Board writes require the editing switch and Pro. Call these methods sequentially; they are not part of batch.execute. An open board editor or drag blocks operations to protect human drafts. Changes update the visible working model; the user saves the .ploto file in Ploto.

<!-- PLOTO-DOC-END -->

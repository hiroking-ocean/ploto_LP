# Exceptions and recovery

Read the relevant case when a response blocks the normal workflow.

- `conflict`: retain planned operations, re-read the conflicting task and affected prerequisites (parent, placement, dependencies, complete ToDos), reassess and update affected operations only. Submit the corrected request with a new request ID. Never blindly replace a revision or use `"latest"` to bypass a conflict.
- Transport failure or `outcome_unknown`: the mutation may have completed. With the terminal client, retry the original request ID with exactly the original method and parameters using `-RequestId` to retrieve its receipt before planning another mutation. Keep note/JSON input files unchanged for this retry. With MCP, there is no request-ID retry mechanism: read current state after reconnecting and reconcile the result before any further mutation.
- `busy`: wait the suggested delay and retry the same request. All API calls are sequential.
- `session_request_limit`: a session retains up to 1,000 receipts; a new user-enabled session is needed. A revoked session cannot return old receipts, so inspect current data before considering another mutation.
- `read_only_session` or API editing switched off: stop mutations. Inspect any mutation already started before reporting its outcome. Only when the user's task needs a write, call `access.request` with a short `reason`; on `granted` retry the write directly (no context refresh needed). On `denied`, continue read-only. On `pending`, the dialog is still open: tell the user, then check `context.allowWrite` later instead of requesting again.
- `pro_required`: the operation was not applied and Ploto requests the Pro license dialog. Follow [Kanban](kanban.md#when-pro-is-missing) for a brief, relevant explanation and purchase/activation guidance. Do not reopen the dialog or retry until the user activates Pro and closes it; then refresh `context`.
- `ai_consent_required`: ask the user to open Ploto's AI Terminal and approve the first-use notice. Approval is remembered on this PC. Do not retry until approval.
- `ai_trial_exhausted`: stop API calls and direct the user to License > AI Terminal. AI Terminal is a separate one-time purchase from Pro. Do not attempt to reset or bypass the usage limit; retry only after activation.
- `ai_state_unavailable`: stop and report that Ploto could not read or save its local AI access state. Do not delete or reset licensing data.
- File change or revoked session: reconnect to Ploto's new session and read `context` to confirm the intended file. Editing starts disabled again; previous write permission does not carry over.
- `active_tab_not_gantt`: discover the requested chart with `tasks.search` or `gantt.list`, select it, then refresh `context`. Ask only if the target is ambiguous.
- `close_task_editor`: ask the user to finish and close the detail editor. Do not overwrite its draft. Discovery reads remain available, but an `editing:true` row is provisional and must not be used as an editing prerequisite.
- `ready:false` after `gantt.create`: creation succeeded; wait `retryAfterMs` and use `context`, not another create. For a batch with `operationsApplied:false`, submit only the remaining operations once ready.
- Missing reference or missing `PLOTO-DOC-END` marker: read the file in smaller sections before assuming it is missing from distribution. If the on-disk file is missing/incomplete, report it and stop the operation that needs those instructions.

Captured errors: inspect `plotoErrors` even on successful responses. Use `errors.list` with the previous cursor for delayed errors after substantial work. While `truncated`, continue from `nextCursor`. Explain errors relevant to the outcome; do not claim unconditional success when they may affect it.

`errors.list` accepts `after` and `limit`, not `sinceCursor`. `{}` starts from this session's initial cursor; `{"after":12,"limit":20}` gets entries with sequence greater than 12. See the parameter table in [api.md](api.md#errorslist-parameters).

<!-- PLOTO-DOC-END -->

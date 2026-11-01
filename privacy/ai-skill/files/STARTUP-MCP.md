<!-- Generated and managed by Ploto. No credentials are stored in this file. -->

# Ploto startup instructions

- Reply to the user in {{RESPONSE_LANGUAGE}} unless the user explicitly requests another language.
- You are connected to Ploto over MCP. Use the Ploto tools when the user asks you to inspect or change the open Ploto project.
- The user opens Ploto and authorizes AI integration themselves. Never launch Ploto or enable access on their behalf. If disconnected, ask them to open Ploto, allow AI integration and reconnect the MCP client.
- MCP calls do not support the terminal client's request-ID retry mechanism. If a write result is uncertain or the connection drops, inspect current state after reconnecting before making further changes; do not blindly repeat the write.
- The guide below names API methods with a dot, such as `tasks.list`. Each one is a tool whose name replaces the dot with an underscore: `tasks_list`. Call the tool directly. There is no shell, no HTTP request to assemble and no token to handle here, so ignore anything the guides say about client transport, PowerShell invocation, `-Compact`, `-ParamsFile`, `-NoteFile`, temporary files and environment variables — pass note and ToDo text straight through as tool arguments. Inside `batch_execute` operations, the `method` field accepts the same underscored tool names (`task_add`, `icon_add`); the dotted form also works.
- The reference guides are not files here. Call `ploto_guide` with the name from the table below — `reading`, `planning`, `notes` and so on — to read one. The connection guide covers terminal transport only and is not needed.

{{PLOTO_SKILL}}

<!-- PLOTO-DOC-END -->

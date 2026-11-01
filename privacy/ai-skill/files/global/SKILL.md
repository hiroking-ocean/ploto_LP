---
name: ploto-control
description: Work with the user's open Ploto project through the Ploto MCP server - its plan, schedule, tasks, Gantt charts, Kanban boards and ToDos. Use whenever the Ploto tools are connected and the request concerns that project's plan or work items, including when the user says "the plan", "the schedule", "my tasks" or "this task" without naming Ploto. Not for planning the agent's own work, implementation or refactoring plans, or TODOs kept in files.
---

# Ploto control

Inside a Ploto-generated AI workspace - `AGENTS.md` and `PLOTO.md` are present, or the `PLOTO_*`
environment variables are set - that folder's guide is authoritative. Follow it instead of this
skill, including where it sends you when no MCP tools are available.

Prefer the configured Ploto MCP server. Its tools include `context`, `tasks_list`, and `ploto_guide`; a client may add a `ploto` prefix.

## When the request is about Ploto

The tools being connected means Ploto is running and the user has authorized the connection, so their project is open in front of them. Read an unqualified "the plan", "the schedule", "my tasks" or "add this task" as that project unless the conversation is clearly about something else.

What decides is the subject, not the word Ploto. A plan made of dated work items, assignees and progress is the Ploto project. A plan for the work you are doing here - an implementation approach, a refactoring sequence, a design document, TODOs kept in files - is not, even when the user calls it a plan.

When it could be either, read before writing: `context` and `tasks_list` are read-only, so looking at what is open costs nothing and usually settles it. If it still does not fit what the user asked for, ask. Never write on a guess.

## Rules

- Use the tools for all Ploto work. If the server instructions are not already present, call `ploto_guide` with `{"name":"instructions"}` before the first operation and follow that current guide.
- If the tools are unavailable, do not discover or guess Ploto databases, named pipes, configuration, URLs, or credentials. Tell the user to start Ploto, enable AI integration, and reload the AI client's MCP servers or begin a new session.
- Use the terminal API only when `PLOTO_API_URL`, `PLOTO_API_TOKEN`, `PLOTO_CLI`, and `PLOTO_SKILL` are already provided by Ploto in the current environment. Read `PLOTO_SKILL` first; never print or persist the token.
- Respect Ploto's access request and editing controls. Project changes remain in Ploto's working model for the user to review and save.

<!-- PLOTO-DOC-END -->

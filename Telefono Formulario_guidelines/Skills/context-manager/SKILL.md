---
name: context-manager
description: Use this skill whenever starting a complex multi-folder project, adding a new feature that spans multiple files, or when the user asks to manage context, organize a project, or keep track of files. This skill provides a protocol for maintaining persistent state (PROJECT_STATE.md), preventing "context rot", and ensuring no files are forgotten during updates.
---

# Context Management Protocol

When working on large or multi-folder projects, AI agents face the challenge of "context rot"—losing track of which files are active, forgetting architectural boundaries, or making changes in one file while neglecting its dependencies. 

This skill enforces a robust context management strategy inspired by best practices from advanced coding agents (like Claude Code and Cursor).

## Phase 1: The `PROJECT_STATE.md` Ledger

Instead of trying to hold all files in your immediate context window, you MUST externalize the project state. 

1. **Check for State:** At the beginning of a complex multi-file task, check if a `PROJECT_STATE.md` file exists in the root directory.
2. **Create/Update State:** If it doesn't exist, create it. This file is your "North Star". It should contain:
   - **Active Task:** A 1-2 sentence description of the current objective.
   - **File Ledger:** An explicit, bulleted list of ALL absolute file paths that are relevant to the current task. 
   - **Dependency Graph:** Brief notes on how the active files relate (e.g., "If I update `A.js`, I must also update `B.js` and `C.css`").
3. **Continuous Maintenance:** Every time you add, delete, or significantly modify a file, you MUST update the `PROJECT_STATE.md` ledger. Before finalizing a task, review this ledger to verify all associated files were handled.

## Phase 2: The Three-Phase Workflow

Never attempt a "one-shot" implementation for a multi-folder task. Follow this rigid progression:

1. **Research (Explore):** 
   - Use search tools (e.g., `grep_search`, `list_dir`) to map out where relevant code lives.
   - Do NOT edit code during this phase. 
   - Record your findings in `PROJECT_STATE.md`.
2. **Plan:**
   - Draft a step-by-step implementation plan.
   - Explicitly cite the file paths (`src/components/Button.jsx:12-25`) you intend to change.
   - Wait for user approval if the changes are architectural.
3. **Implement:**
   - Execute the plan. Reference the `PROJECT_STATE.md` ledger constantly to ensure you aren't leaving any connected files behind.

## Phase 3: Mitigating Context Rot

- **Explicit File References:** Never use vague descriptions like "the styles file". Always use the absolute path or exact relative path.
- **Narrow Depth-First Exploration:** Do not try to read entire massive directories into context. Read only the specific files you need.
- **Flush and Refresh:** If a task takes many turns and the context window is getting bloated with old research, suggest to the user to summarize the progress into `PROJECT_STATE.md` and start a fresh session. The new session can read `PROJECT_STATE.md` to instantly regain orientation.
- **Project Constitution:** If the project has a `CLAUDE.md` or `.claude/rules/` directory containing global guidelines (like naming conventions or architecture rules), prioritize reading those before making structural changes.

By strictly adhering to these phases, you ensure that multi-folder updates are consistent, no files are orphaned, and the project context remains pristine.

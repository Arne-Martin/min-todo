<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/004-apply-design-system/plan.md`. Supporting docs in the same folder:
`spec.md`, `research.md`, `data-model.md`, `quickstart.md`,
`contracts/css-variables.md`, `contracts/component-styles.md`.

This feature is a CSS-only design migration that applies constitution
v1.1.0's Designspråk + Komponentprinciper to existing 001 + 002 code. No
hooks, JSX (except a single `<span ☐>` in TodoList's empty state), or
storage code is touched.

Earlier features as foundation:
- `specs/001-todo-app/plan.md` — base todo-app, component layout, useTodos.
- `specs/002-dark-mode-toggle/plan.md` — theme-toggle infrastructure.

The project constitution (v1.1.0) is at `.specify/memory/constitution.md`.
<!-- SPECKIT END -->

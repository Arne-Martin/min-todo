# min-todo

Min första app byggd med spec-driven development. En enkel todo-app som sparar
uppgifter i webbläsarens `localStorage`.

## Kom igång

```powershell
npm install
npm run dev
```

Öppna `http://localhost:3000`.

## Dokumentation

All design och alla beslut lever i `specs/001-todo-app/`:

- [`spec.md`](specs/001-todo-app/spec.md) – funktionsspec
- [`plan.md`](specs/001-todo-app/plan.md) – teknisk plan
- [`research.md`](specs/001-todo-app/research.md) – tekniska val och alternativ
- [`data-model.md`](specs/001-todo-app/data-model.md) – datamodell och localStorage-format
- [`contracts/useTodos.md`](specs/001-todo-app/contracts/useTodos.md) – hookens kontrakt
- [`contracts/storage-schema.md`](specs/001-todo-app/contracts/storage-schema.md) – storage-kontrakt
- [`quickstart.md`](specs/001-todo-app/quickstart.md) – kom-igång + manuell verifiering
- [`tasks.md`](specs/001-todo-app/tasks.md) – uppgiftslista per user story

Projektets principer ligger i [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

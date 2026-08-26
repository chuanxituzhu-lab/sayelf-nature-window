# Architecture v0.4 — Negative-Entropy Plugin Model

```text
Human / AI Agent
      │
      ├── WebUI
      ├── MCP
      ├── CLI
      └── HTTP API
              │
              ▼
        Interface Layer
              │
              ▼
        Core Compiler
              │
    ┌─────────┼──────────┐
    │         │          │
Scene     Variation   Composer
Provider   Provider    Provider
    │         │          │
    └─────────┴──────────┘
              │
              ▼
        Prompt Contract
              │
              ▼
Enter → Enclose → Guide → Reveal
              │
              ▼
      Prompt / Series Output
```

## Negative-entropy rules

Core knows only:
- plugin contracts,
- plugin registry,
- frozen visual grammar,
- prompt compilation,
- deterministic variation composition.

Core does **not** know:
- specific scene names,
- specific plant catalogs,
- provider credentials,
- AI host brands,
- image-generation vendors,
- UI business logic.

## Plugin boundaries

### Scene Provider
Contributes SceneSpec records.

### Variation Provider
Contributes controlled variation axes.

### Composer Provider
Builds a SceneSpec dynamically from user/agent intent.

### Interface Adapter
CLI / MCP / API / WebUI expose Core, but never own visual logic.

## Failure isolation

Disabling one plugin must not mutate others. A provider can be replaced without changing Core.

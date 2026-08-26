# Architecture

```text
AI Agent / Human
      │
      ├── MCP
      ├── CLI
      ├── HTTP API
      └── WebUI
          │
          ▼
  Prompt Contract
          │
          ▼
 Hidden Nature Window Core
          │
     Scene Catalog
          │
          ▼
  Prompt + Negative Prompt
```

Core owns only:
- scene semantics
- visual grammar
- prompt compilation
- validation-by-construction

Interfaces own transport only.

Image providers remain external.

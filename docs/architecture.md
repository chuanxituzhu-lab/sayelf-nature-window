# Architecture (v0.5)

```text
AI Agent / Human
      │
      ├── MCP
      ├── CLI
      ├── HTTP API
      └── WebUI
          │
          ▼
  OutputContract
          │
          ▼
 Hidden Nature Window Core
          │
  Enter → Enclose → Guide → Reveal
          │
     ┌────┴────┐
     ▼         ▼
  Image    Storyboard
  output   five shots
```

Core owns only:
- scene semantics
- visual grammar
- deterministic variation
- OutputContract dispatch

Image and storyboard prompt prose belongs to output plugins.
Interfaces own transport only.

Image and video providers remain external.

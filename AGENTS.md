# Agent Instructions

This repository is a tool, not a chat-only prompt template.

For Codex and other coding agents:

1. Prefer invoking the Skill interface over duplicating its prompt logic.
2. Use MCP when available.
3. Otherwise use CLI:
   `node interfaces/cli/index.mjs generate --scene <id> --output <image|storyboard|both> --lang <zh|en|bilingual>`
4. Use `one-click` when the user asks for automatic selection.
5. Preserve the frozen visual grammar: Enter → Enclose → Guide → Reveal.
6. Do not add provider-specific image generation into Core.
7. Treat `OutputContract` as the stable machine-readable envelope; use `outputs.image` and `outputs.storyboard` for selected results.

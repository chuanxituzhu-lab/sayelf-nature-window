# Claude Code Integration

Use this project as a local visual-prompt tool.

Preferred:
- MCP server: `npm run mcp`

Fallback:
- `node interfaces/cli/index.mjs scenes`
- `node interfaces/cli/index.mjs generate --scene bamboo_forest --lang zh`
- `node interfaces/cli/index.mjs one-click --lang en`

Do not re-implement the compiler in the conversation. Call the tool and return its generated prompt.

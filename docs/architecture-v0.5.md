# Architecture v0.5 — One Core, Two Outputs

```text
Human / AI Agent
      │
      ├── MCP
      ├── CLI
      ├── HTTP API
      └── WebUI
              │
              ▼
        OutputContract request
              │
              ▼
        Core SceneSpec pipeline
        Scene / Variation / Composer Providers
              │
              ▼
     Enter → Enclose → Guide → Reveal
              │
       ┌──────┴──────┐
       ▼             ▼
  image output   storyboard output
  one frame      ENTER / ENCLOSE / GUIDE / REVEAL / HOLD
```

## Core boundary

The Core owns SceneSpec resolution, deterministic variation selection, the four-stage visual grammar, and output dispatch. It does not own image prompt prose, storyboard shot prose, model calls, or provider credentials.

`HOLD` is a temporal output requirement. It does not expand the Core grammar.

## OutputContract

Every output request uses `output: image | storyboard | both`. The envelope carries the shared SceneSpec, seed, variation, and frozen grammar. Output-specific fragments live under `outputs.image` and `outputs.storyboard`.

## Storyboard minimum

The storyboard plugin always returns five ordered shots:

1. `ENTER` — camera enters the natural interior.
2. `ENCLOSE` — authentic foreground occlusion surrounds the lens.
3. `GUIDE` — natural lines, scale and luminance guide attention.
4. `REVEAL` — the one hidden window becomes visible.
5. `HOLD` — the final discovery is held with subtle natural motion.

Each shot contains an image prompt for a storyboard frame and a video direction for temporal motion. The plugin does not call an image or video service.

## Failure isolation

Output plugins compile independently. When `both` is requested, a failed plugin produces a structured error while a successful sibling remains available. Scene, Variation and Composer providers keep their existing replaceable boundaries and tolerate broken lower-priority modules.

## Interfaces

- MCP tool schemas expose the `output` selector.
- CLI exposes `--output` and keeps image-only commands backward compatible.
- HTTP endpoints return the OutputContract envelope.
- WebUI keeps `Open → Input → Execute → Result` and adds one output selector.

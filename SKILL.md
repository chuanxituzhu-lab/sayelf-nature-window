# Hidden Nature Window

## Purpose

Transform a normal natural environment into an immersive hidden-world photographic prompt by applying:

**Enter → Enclose → Guide → Reveal**

The same `SceneSpec` can compile to `image`, `storyboard`, or `both`. A storyboard is always five shots: `ENTER / ENCLOSE / GUIDE / REVEAL / HOLD`; `HOLD` is output timing, not a new Core stage.

The camera must enter the environment rather than observe it from outside.

## Required decisions

1. World / scene.
2. Camera entry.
3. Environmental enclosure.
4. Hidden window.
5. Single visual hook.
6. Physical light.
7. Dominant / hook / window color relationship.
8. One emotion.

## Hard rules

- Keep a believable physical camera position.
- Use foreground occlusion.
- Use at least three spatial layers.
- The environment occupies most of the frame.
- Keep one primary visual exit/window.
- Keep one primary hook.
- Favor real daylight and real plant texture.
- Avoid fake bokeh, CGI foliage, fantasy glow, excessive HDR, perfect symmetry.
- Do not turn the composition into a normal eye-level flower-field photograph.

## Invocation policy

When an AI agent receives a request like:

- “用竹林做一张秘密窗口的提示词”
- “generate a lotus hidden-window prompt in English”
- “随机来一张”
- “换成雪枝，中文”

it should call the Skill core through MCP, CLI, or HTTP rather than manually reconstructing the prompt.

## Language

`zh` | `en` | `bilingual`

## Main tools

- `hidden_window_list_scenes`
- `hidden_window_generate_prompt`
- `hidden_window_one_click`

Generation tools accept the `output` choice: `image`, `storyboard`, or `both`.


## v0.5 modular rule

Never add new content families directly into Core.

Use:
- Scene Provider for preset ecosystems.
- Variation Provider for controlled expression diversity.
- Composer Provider for natural-language/dynamic scene creation.
- Image Output Provider for one decisive image prompt.
- Storyboard Output Provider for five-shot image/video directions.
- Interface Adapter for MCP/CLI/API/WebUI.

The frozen visual mechanism must remain unchanged.

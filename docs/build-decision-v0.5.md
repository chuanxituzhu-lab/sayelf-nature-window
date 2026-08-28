# Build Decision Record — v0.5 One Core, Two Outputs

## Idea / real task

Keep the frozen `Enter → Enclose → Guide → Reveal` visual grammar as the only Core mechanism, and compile one `SceneSpec` into a deterministic image prompt, a minimum five-shot storyboard, or both.

## Closest existing projects or capabilities

- The fetched target repository already provides the frozen Core, Scene Provider, Variation Provider, Composer Provider, MCP/CLI/HTTP/Web adapters, visual styles, aspect ratios, dynamic preview, and Composer modes through v0.12.0.
- BlueFish is a broader open-source storyboard and video-generation studio with provider orchestration; it is not a drop-in replacement for this small local visual-grammar compiler.
- Storyboard Director and related storyboard skills provide production-oriented shot and asset workflows; they do not provide this repository's fixed nature-discovery grammar.

## Step 0 decision

**Improve** — reuse the current implementation and improve its measurable output modularity and interoperability.

## Measurable improvement or differentiator

One input `SceneSpec` now produces two independently selectable, deterministic output types (`image` and `storyboard`) plus `both`, with exactly five ordered storyboard shots and one shared `seed`/`visual_grammar`. No new runtime dependency is required.

## Success measure and required evidence

- Core grammar is exactly four stages and remains unchanged.
- Image output and storyboard output compile from the same SceneSpec and seed.
- Storyboard always contains `ENTER`, `ENCLOSE`, `GUIDE`, `REVEAL`, `HOLD` in order.
- Same input and seed produce byte-equivalent JSON output.
- A disabled or failing output plugin does not prevent the other output from succeeding.
- MCP, CLI, HTTP API, WebUI, and agent integration docs expose `image`, `storyboard`, and `both`.
- Full test suite and one CLI/API smoke path pass.

## Minimum Core

Scene resolution, deterministic variation selection, frozen grammar, SceneSpec validation, and output dispatch/contract validation. The Core does not contain image wording or storyboard shot prose.

## Plugin boundaries

- `plugins/outputs/image`: image prompt compiler and image-specific contract.
- `plugins/outputs/storyboard`: five-shot storyboard compiler and storyboard-specific contract.
- Existing `scene-providers`, `variation-providers`, and `composer-providers` remain unchanged in responsibility.
- Output plugin failures are isolated by the dispatcher.

## Local-first boundary

All parsing, deterministic compilation, validation, adapters, and tests run locally. No model, cloud, telemetry, or external generation service is added.

## Data classification and local trust boundary

Repository source, tests, docs, generated prompt templates, and the existing public README asset are classified `Public` for the requested public repository. Credentials, local paths outside the repository, environment values, logs containing secrets, and unknown data remain local and are excluded from commits.

## GitHub/public release decision: Allowed — review evidence

The target public repository already exists and is the configured `origin`. Before push, inspect the complete staged diff, tracked file list, generated artifacts, and secret-like strings. Push only the reviewed public source and docs; do not push local outputs, credentials, or runtime state.

## External transfer plan

Push the reviewed public commit to the existing `origin/main`. No sensitive or unknown data is required for the transfer.

## State, change signals, and next-check rule

This is a synchronous deterministic compiler. State is the request (`SceneSpec`, output selection, language, seed) and result contract. The next check occurs after each compile, plugin failure, adapter call, and test run; no polling loop or background state is introduced.

## Observation / inference / hypothesis / fact boundary

- Observation: the latest target history (v0.12.0) still exposes one image-prompt compilation path and no unified output selector.
- Inference: the current SceneSpec fields contain enough stable semantics to drive both outputs.
- Hypothesis: a fixed five-shot temporal mapping preserves the visual DNA across image and storyboard outputs.
- Fact required for promotion: tests demonstrate grammar invariance, five-shot order, same-seed reproducibility, shared SceneSpec semantics, and failure isolation.

## Evolution, validation, canary, version, and rollback plan

Validate locally with focused unit tests, full tests, adapter smoke tests, and staged-diff review. The v0.5 output-contract milestone is versioned as the next package release after the existing v0.12.0 history (v0.13.0); promote by pushing that reviewed commit. Roll back by reverting the integrated commit through normal reviewed Git operations.

## WebUI decision

**Required** — the user explicitly requires WebUI interoperability and output selection. Keep the ordinary path `Open → Input → Execute → Result`; expose output selection as a small control and progressively disclose the two result sections.

## Simplest reliable implementation

ES modules, plain JSON contracts, pure output plugins, one dispatcher, existing Node HTTP server, existing MCP SDK, existing CLI, and the current dependency set.

## Explicitly not building

No image/video model calls, vendor-specific providers, authentication, persistence, job queue, cloud database, new Core stages, extra visual grammar, media rendering, or unrelated UI features.

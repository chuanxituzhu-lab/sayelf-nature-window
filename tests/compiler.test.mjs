import test from "node:test";
import assert from "node:assert/strict";
import { generatePrompt, listScenes, oneClick, series, VISUAL_GRAMMAR, generateComposedPrompt, composeSceneSpec } from "../core/compiler.mjs";

test("scene catalog is non-empty", () => {
  assert.ok(listScenes().length >= 24);
});

test("visual grammar remains frozen", () => {
  assert.deepEqual(VISUAL_GRAMMAR, ["enter", "enclose", "guide", "reveal"]);
});

test("Chinese prompt compiles", () => {
  const out = generatePrompt({ scene: "wildflower_meadow", language: "zh" });
  assert.equal(out.language, "zh");
  assert.match(out.prompt, /【进入】/);
  assert.match(out.prompt, /隐藏窗口/);
  assert.match(out.prompt, /单一视觉钩子/);
});

test("English prompt compiles", () => {
  const out = generatePrompt({ scene: "lotus_pond", language: "en" });
  assert.equal(out.language, "en");
  assert.match(out.prompt, /Hidden window/);
  assert.match(out.prompt, /Single visual hook/);
});

test("overrides are applied", () => {
  const out = generatePrompt({
    scene: "winter_branches",
    language: "zh",
    overrides: { hook: "一只停在枝头的小鸟" }
  });
  assert.match(out.prompt, /一只停在枝头的小鸟/);
});

test("one-click can be deterministic with seed", () => {
  const a = oneClick({ language: "en", seed: 3 });
  const b = oneClick({ language: "en", seed: 3 });
  assert.equal(a.scene_id, b.scene_id);
  assert.equal(a.prompt, b.prompt);
});


test("same scene can produce different series prompts while grammar stays frozen", () => {
  const items = series({ scene: "lotus_pond", language: "zh", count: 5, seed: 2026 });
  assert.equal(items.length, 5);
  assert.equal(new Set(items.map(x => x.prompt)).size, 5);
  for (const item of items) {
    assert.deepEqual(item.visual_grammar, ["enter", "enclose", "guide", "reveal"]);
    assert.match(item.prompt, /核心机制固定不变：进入 → 包围 → 引导 → 显露/);
  }
});

test("same scene + same seed stays reproducible", () => {
  const a = generatePrompt({ scene: "bamboo_forest", language: "en", seed: 77 });
  const b = generatePrompt({ scene: "bamboo_forest", language: "en", seed: 77 });
  assert.equal(a.prompt, b.prompt);
});


test("expanded scene library contains distinct ecosystems", () => {
  const ids = new Set(listScenes().map(x => x.id));
  for (const id of ["wheat_field","rice_field","sunflower_field","cherry_blossom","wisteria","fern_forest","pine_forest","banana_grove","tea_garden","coastal_grass","alpine_meadow"]) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});

test("expanded variations never mutate frozen grammar", () => {
  const items = series({ scene: "wheat_field", language: "zh", count: 20, seed: 3030 });
  for (const item of items) {
    assert.deepEqual(item.visual_grammar, ["enter","enclose","guide","reveal"]);
    assert.match(item.prompt, /【进入】/);
    assert.match(item.prompt, /【包围】/);
    assert.match(item.prompt, /【引导】/);
    assert.match(item.prompt, /【显露】/);
  }
});


test("scene catalog now loads through plugin registry", () => {
  assert.ok(listScenes().length >= 24);
});

test("dynamic composer creates a valid scene without touching core grammar", async () => {
  const scene = await composeSceneSpec({
    plant: "bamboo",
    location: "mountain",
    emotion: "longing"
  });
  assert.match(scene.name_zh, /隐藏窗口/);
  assert.ok(scene.entry_zh);
  assert.ok(scene.enclosure_zh);
  assert.ok(scene.window_zh);
  assert.ok(scene.hook_zh);
});

test("composed prompt preserves frozen core grammar", async () => {
  const out = await generateComposedPrompt({
    input: {
      plant: "fern",
      location: "forest",
      emotion: "mystery",
      window: "蕨叶之间一小束远处自然光",
      hook: "一枚刚展开的嫩蕨叶"
    },
    language: "zh",
    seed: 4040
  });
  assert.deepEqual(out.visual_grammar, ["enter","enclose","guide","reveal"]);
  assert.equal(out.source, "composed");
  assert.match(out.prompt, /【进入】/);
  assert.match(out.prompt, /【包围】/);
  assert.match(out.prompt, /【引导】/);
  assert.match(out.prompt, /【显露】/);
});

test("composer supports reproducible series diversity by seed", async () => {
  const a = await generateComposedPrompt({
    input: { plant: "grass", location: "coast", emotion: "freedom" },
    language: "en",
    seed: 1
  });
  const b = await generateComposedPrompt({
    input: { plant: "grass", location: "coast", emotion: "freedom" },
    language: "en",
    seed: 2
  });
  assert.notEqual(a.prompt, b.prompt);
  assert.deepEqual(a.visual_grammar, b.visual_grammar);
});

#!/usr/bin/env node
import { generatePrompt, listScenes, oneClick, series, generateComposedPrompt } from "../../core/compiler.mjs";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
const cmd = process.argv[2] || "help";

try {
  if (cmd === "scenes") {
    console.log(JSON.stringify(listScenes(), null, 2));
  } else if (cmd === "generate") {
    const scene = arg("scene");
    const language = arg("lang", "zh");
    const aspectRatio = arg("ratio", "9:16");
    const seedRaw = arg("seed");
    const seed = seedRaw === undefined ? Date.now() : Number(seedRaw);
    const out = generatePrompt({ scene, language, seed, aspectRatio });
    console.log(process.argv.includes("--json") ? JSON.stringify(out, null, 2) : out.prompt);
  } else if (cmd === "one-click") {
    const language = arg("lang", "zh");
    const aspectRatio = arg("ratio", "9:16");
    const seedRaw = arg("seed");
    const seed = seedRaw === undefined ? Date.now() : Number(seedRaw);
    const out = oneClick({ language, seed, aspectRatio });
    console.log(process.argv.includes("--json") ? JSON.stringify(out, null, 2) : out.prompt);
  } else if (cmd === "compose") {
    const language = arg("lang", "zh");
    const aspectRatio = arg("ratio", "9:16");
    const seedRaw = arg("seed");
    const seed = seedRaw === undefined ? Date.now() : Number(seedRaw);
    const out = await generateComposedPrompt({
      language,
      seed,
      aspectRatio,
      input: {
        mode: arg("mode", "manual"),
        plant: arg("plant", "grass"),
        location: arg("location", "field"),
        emotion: arg("emotion", "calm"),
        window: arg("window"),
        hook: arg("hook")
      }
    });
    console.log(process.argv.includes("--json") ? JSON.stringify(out, null, 2) : out.prompt);
  } else if (cmd === "series") {
    const scene = arg("scene");
    const language = arg("lang", "zh");
    const aspectRatio = arg("ratio", "9:16");
    const count = Number(arg("count", "6"));
    const seed = Number(arg("seed", "1"));
    const out = series({ scene, language, count, seed, aspectRatio });
    console.log(JSON.stringify(out.map((x, i) => ({
      index: i + 1,
      scene_id: x.scene_id,
      seed: x.seed,
      prompt: x.prompt
    })), null, 2));
  } else {
    console.log(`Hidden Nature Window Skill v0.12.0

Commands:
  scenes
  generate --scene <id> [--ratio 9:16] [--lang zh|en|bilingual] [--seed N] [--json]
  one-click [--ratio 9:16] [--lang zh|en|bilingual] [--seed N] [--json]
  compose [--mode auto|random|manual] [--plant grass] [--location field] [--emotion calm] [--window "..."] [--hook "..."] [--ratio 9:16] [--lang zh|en|bilingual] [--seed N]
  series --scene <id> [--count 6] [--ratio 9:16] [--lang zh|en|bilingual] [--seed N]
`);
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message, code: error.code || "ERROR" }, null, 2));
  process.exit(1);
}

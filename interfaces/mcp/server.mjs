import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generatePrompt, listScenes, oneClick, series, generateComposedPrompt } from "../../core/compiler.mjs";

const server = new McpServer({ name: "hidden-nature-window", version: "0.12.0" });

server.tool("hidden_window_list_scenes", "List available natural-scene presets.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(listScenes(), null, 2) }]
}));

server.tool(
  "hidden_window_generate_prompt",
  "Generate one prompt while preserving Enter → Enclose → Guide → Reveal.",
  {
    scene: z.string(),
    language: z.enum(["zh", "en", "bilingual"]).default("zh"),
    aspect_ratio: z.enum(["1:1", "4:5", "3:4", "9:16", "16:9"]).default("9:16"),
    seed: z.number().int().optional(),
    emotion: z.string().optional(),
    window: z.string().optional(),
    hook: z.string().optional()
  },
  async ({ scene, language, aspect_ratio, seed, emotion, window, hook }) => {
    const overrides = {};
    if (emotion) overrides.emotion = emotion;
    if (window) overrides.window = window;
    if (hook) overrides.hook = hook;
    const out = generatePrompt({ scene, language, seed: seed ?? Date.now(), overrides, aspectRatio: aspect_ratio });
    return { content: [{ type: "text", text: out.prompt }] };
  }
);

server.tool(
  "hidden_window_one_click",
  "One-click generation. Scene and expression vary, core grammar remains frozen.",
  {
    language: z.enum(["zh", "en", "bilingual"]).default("zh"),
    aspect_ratio: z.enum(["1:1", "4:5", "3:4", "9:16", "16:9"]).default("9:16"),
    seed: z.number().int().optional()
  },
  async ({ language, aspect_ratio, seed }) => {
    const out = oneClick({ language, seed: seed ?? Date.now(), aspectRatio: aspect_ratio });
    return { content: [{ type: "text", text: JSON.stringify({
      scene_id: out.scene_id, seed: out.seed, prompt: out.prompt
    }, null, 2) }] };
  }
);


server.tool(
  "hidden_window_compose_scene",
  "Compose a new scene that does not need to exist in the preset catalog, while preserving the frozen visual grammar.",
  {
    plant: z.enum(["bamboo","lotus","reeds","maple","snow_branches","grass","fern"]).default("grass"),
    location: z.enum(["forest","pond","mountain","wetland","garden","coast","field"]).default("field"),
    emotion: z.enum(["calm","longing","mystery","freedom","renewal","solitude"]).default("calm"),
    mode: z.enum(["auto", "random", "manual"]).default("manual"),
    window: z.string().optional(),
    hook: z.string().optional(),
    language: z.enum(["zh","en","bilingual"]).default("zh"),
    aspect_ratio: z.enum(["1:1", "4:5", "3:4", "9:16", "16:9"]).default("9:16"),
    seed: z.number().int().optional()
  },
  async ({ plant, location, emotion, mode, window, hook, language, aspect_ratio, seed }) => {
    const out = await generateComposedPrompt({
      input: { plant, location, emotion, mode, window, hook },
      language,
      seed: seed ?? Date.now(),
      aspectRatio: aspect_ratio
    });
    return { content: [{ type: "text", text: out.prompt }] };
  }
);

server.tool(
  "hidden_window_generate_series",
  "Generate a same-scene content series with different prompts while preserving the same core mechanism.",
  {
    scene: z.string(),
    language: z.enum(["zh", "en", "bilingual"]).default("zh"),
    count: z.number().int().min(1).max(50).default(6),
    aspect_ratio: z.enum(["1:1", "4:5", "3:4", "9:16", "16:9"]).default("9:16"),
    seed: z.number().int().default(1)
  },
  async ({ scene, language, count, aspect_ratio, seed }) => {
    const out = series({ scene, language, count, seed, aspectRatio: aspect_ratio });
    return { content: [{ type: "text", text: JSON.stringify(out.map((x, i) => ({
      index: i + 1, seed: x.seed, prompt: x.prompt
    })), null, 2) }] };
  }
);

await server.connect(new StdioServerTransport());

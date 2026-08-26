import { loadJsonProviders, loadComposer } from "./plugin-loader.mjs";

export const LANGUAGES = ["zh", "en", "bilingual"];
export const VISUAL_GRAMMAR = ["enter", "enclose", "guide", "reveal"];

export function loadScenes() {
  return loadJsonProviders("scene-provider");
}
export function loadVariations() {
  return loadJsonProviders("variation-provider");
}

export function listScenes() {
  const scenes = loadScenes();
  return Object.entries(scenes).map(([id, scene]) => ({
    id,
    name_zh: scene.name_zh,
    name_en: scene.name_en
  }));
}

export function resolveScene(sceneId, overrides = {}) {
  const scenes = loadScenes();
  const base = scenes[sceneId];
  if (!base) {
    const err = new Error(`Unknown scene: ${sceneId}`);
    err.code = "UNKNOWN_SCENE";
    throw err;
  }

  const map = {
    plant: ["plant_zh", "plant_en"],
    entry: ["entry_zh", "entry_en"],
    enclosure: ["enclosure_zh", "enclosure_en"],
    window: ["window_zh", "window_en"],
    hook: ["hook_zh", "hook_en"],
    light: ["light_zh", "light_en"],
    emotion: ["emotion_zh", "emotion_en"],
    dominant: ["dominant_zh", "dominant_en"]
  };

  const scene = { ...base };
  for (const [key, value] of Object.entries(overrides || {})) {
    if (value == null || value === "") continue;
    if (key in scene) {
      scene[key] = value;
      continue;
    }
    if (map[key]) {
      scene[map[key][0]] = value;
      scene[map[key][1]] = value;
    }
  }
  return scene;
}

function hashSeed(value) {
  const s = String(value ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pick(arr, seed, salt) {
  return arr[(hashSeed(`${seed}:${salt}`)) % arr.length];
}

export function buildVariation(seed = Date.now()) {
  const v = loadVariations();
  return {
    time: pick(v.time, seed, "time"),
    weather: pick(v.weather, seed, "weather"),
    camera_micro: pick(v.camera_micro, seed, "camera"),
    window_shape: pick(v.window_shape, seed, "window"),
    moment: pick(v.moment, seed, "moment"),
    seasonal_trace: pick(v.seasonal_trace, seed, "season"),
    foreground_occlusion: pick(v.foreground_occlusion, seed, "foreground"),
    depth_rhythm: pick(v.depth_rhythm, seed, "depth"),
    hook_state: pick(v.hook_state, seed, "hookstate")
  };
}

function zhPrompt(scene, variation) {
  return [
    `真实自然摄影，9:16竖屏。场景：${scene.name_zh}。`,
    `【进入】${scene.entry_zh}；本次机位变化：${variation.camera_micro.zh}。`,
    `【包围】${scene.enclosure_zh}，让植物和自然元素占据画面大多数区域，并允许近镜叶片、枝条或花朵产生真实遮挡与自然失焦。`,
    `空间至少三层：贴近镜头的遮挡层 → 可辨识的中景环境层 → 远处的发现层。`,
    `【引导】利用茎秆、枝条、叶片方向、尺寸递减与明暗变化，将视线从画面边缘自然引向隐藏窗口。`,
    `【显露】隐藏窗口：${scene.window_zh}；${variation.window_shape.zh}。它仍然是唯一主要视觉出口。`,
    `单一视觉钩子：${scene.hook_zh}。不要增加第二个竞争主体。`,
    `本次前景遮挡：${variation.foreground_occlusion.zh}。`,
    `本次空间节奏：${variation.depth_rhythm.zh}。`,
    `视觉钩子状态：${variation.hook_state.zh}。`,
    `季节痕迹：${variation.seasonal_trace.zh}。`,
    `本次决定性瞬间：${variation.moment.zh}。`,
    `光线与天气：${variation.time.zh}；${variation.weather.zh}。保持可信的物理自然光和真实曝光过渡。`,
    `色彩：${scene.dominant_zh}为主色，视觉钩子作为少量强调色，窗口与主体环境保持自然分离。`,
    `情绪：${scene.emotion_zh}。`,
    `核心机制固定不变：进入 → 包围 → 引导 → 显露。变化只发生在时间、天气、机位微差、窗口形态、前景遮挡、空间节奏、季节痕迹、视觉钩子状态和决定性瞬间。`,
    `保持真实植物纹理、随机生长、自然缺损、可信相机位置与真实物理景深。`
  ].join("\n");
}

function enPrompt(scene, variation) {
  return [
    `Photorealistic nature photography, vertical 9:16. Scene: ${scene.name_en}.`,
    `[ENTER] ${scene.entry_en}; this variation uses: ${variation.camera_micro.en}.`,
    `[ENCLOSE] ${scene.enclosure_en}. Natural elements occupy most of the frame with believable foreground occlusion and optical focus falloff.`,
    `Keep at least three physical depth layers: near occlusion → recognizable midground environment → distant discovery layer.`,
    `[GUIDE] Use stems, branches, leaf direction, diminishing scale and natural luminance gradients to guide the eye toward the hidden window.`,
    `[REVEAL] Hidden window: ${scene.window_en}; ${variation.window_shape.en}. It remains the single primary visual exit.`,
    `Single visual hook: ${scene.hook_en}. Do not introduce a second competing focal subject.`,
    `Foreground variation: ${variation.foreground_occlusion.en}.`,
    `Depth rhythm: ${variation.depth_rhythm.en}.`,
    `Hook state: ${variation.hook_state.en}.`,
    `Seasonal trace: ${variation.seasonal_trace.en}.`,
    `Decisive moment for this variation: ${variation.moment.en}.`,
    `Light and weather: ${variation.time.en}; ${variation.weather.en}. Keep physically believable daylight and natural exposure transitions.`,
    `Color logic: ${scene.dominant_en} as the dominant field, the hook as a restrained accent, and the window naturally separated from the environment.`,
    `Emotion: ${scene.emotion_en}.`,
    `The core mechanism is frozen: Enter → Enclose → Guide → Reveal. Variation is allowed only in time, weather, camera micro-position, window shape, foreground occlusion, depth rhythm, seasonal trace, hook state and decisive moment.`,
    `Keep authentic plant texture, random growth, natural imperfections, believable camera placement and real optical depth.`
  ].join("\n");
}

export const NEGATIVE_ZH = "避免：普通平视花田、站立视角、俯拍、人工拱门、完美对称、人物抢主体、多个竞争焦点、假散景、梦幻光晕、过度HDR、塑料植物、CGI、3D渲染、摄影棚灯光、所有景物同时锐利、过度清洁和刻意摆拍。";
export const NEGATIVE_EN = "Avoid: conventional eye-level flower-field photography, standing viewpoint, top-down view, artificial arches, perfect symmetry, dominant human subjects, multiple competing focal points, fake bokeh, fantasy glow, excessive HDR, plastic foliage, CGI, 3D-rendered look, studio lighting, everything tack-sharp, overly clean or staged vegetation.";

export function generatePrompt({ scene, language = "zh", overrides = {}, seed = Date.now() } = {}) {
  if (!scene) throw new Error("scene is required");
  if (!LANGUAGES.includes(language)) throw new Error(`Unsupported language: ${language}`);

  const resolved = resolveScene(scene, overrides);
  const variation = buildVariation(seed);
  const prompt_zh = zhPrompt(resolved, variation);
  const prompt_en = enPrompt(resolved, variation);

  const result = {
    skill: "hidden-nature-window",
    version: "0.4.0",
    scene_id: scene,
    scene: resolved,
    seed,
    variation,
    visual_grammar: VISUAL_GRAMMAR,
    prompt_zh,
    prompt_en,
    negative_zh: NEGATIVE_ZH,
    negative_en: NEGATIVE_EN
  };

  if (language === "zh") {
    result.prompt = `${prompt_zh}\n\n${NEGATIVE_ZH}`;
  } else if (language === "en") {
    result.prompt = `${prompt_en}\n\n${NEGATIVE_EN}`;
  } else {
    result.prompt = `【中文】\n${prompt_zh}\n\n${NEGATIVE_ZH}\n\n【English】\n${prompt_en}\n\n${NEGATIVE_EN}`;
  }
  result.language = language;
  return result;
}


export async function composeSceneSpec(input = {}) {
  const composer = await loadComposer();
  return composer.composeScene(input);
}

export async function generateComposedPrompt({
  input = {},
  language = "zh",
  seed = Date.now()
} = {}) {
  if (!LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  const scene = await composeSceneSpec(input);
  const variation = buildVariation(seed);
  const prompt_zh = zhPrompt(scene, variation);
  const prompt_en = enPrompt(scene, variation);

  const result = {
    skill: "hidden-nature-window",
    version: "0.4.0",
    source: "composed",
    scene,
    seed,
    variation,
    visual_grammar: VISUAL_GRAMMAR,
    prompt_zh,
    prompt_en,
    negative_zh: NEGATIVE_ZH,
    negative_en: NEGATIVE_EN
  };

  if (language === "zh") result.prompt = `${prompt_zh}\n\n${NEGATIVE_ZH}`;
  else if (language === "en") result.prompt = `${prompt_en}\n\n${NEGATIVE_EN}`;
  else result.prompt = `【中文】\n${prompt_zh}\n\n${NEGATIVE_ZH}\n\n【English】\n${prompt_en}\n\n${NEGATIVE_EN}`;

  result.language = language;
  return result;
}

export function oneClick({ language = "zh", seed = Date.now() } = {}) {
  const ids = listScenes().map(s => s.id);
  const sceneIndex = hashSeed(`${seed}:scene`) % ids.length;
  return generatePrompt({ scene: ids[sceneIndex], language, seed });
}

export function series({ scene, language = "zh", count = 6, seed = 1, overrides = {} } = {}) {
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error("count must be an integer between 1 and 50");
  }
  return Array.from({ length: count }, (_, i) =>
    generatePrompt({
      scene,
      language,
      overrides,
      seed: hashSeed(`${seed}:series:${i}`)
    })
  );
}

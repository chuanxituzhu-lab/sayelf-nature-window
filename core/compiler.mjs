import { loadJsonProviders, loadComposer } from "./plugin-loader.mjs";

export const LANGUAGES = ["zh", "en", "bilingual"];
export const VISUAL_GRAMMAR = ["enter", "enclose", "guide", "reveal"];
export const VISUAL_STYLES = {
  natural: {
    name_zh: "自然克制",
    name_en: "Natural restraint",
    zh: "保持真实曝光、自然层次和克制的色彩关系，不人为制造戏剧化效果",
    en: "keep natural exposure, believable layers and restrained color relationships without artificial drama",
    saturation_zh: "背景饱和度中等，视觉钩子只提高一级",
    saturation_en: "keep background saturation moderate and raise the hook by only one level",
    brightness_zh: "保持自然曝光，暗部保留植物纹理，窗口明亮但不过曝",
    brightness_en: "keep natural exposure, preserve plant texture in shadows, and keep the window bright without clipping"
  },
  contrast: {
    name_zh: "反差增强",
    name_en: "Strong contrast",
    zh: "加强明暗反差、冷暖色温对比与前后景尺度差异，让隐藏窗口从深色包围中清晰跳出，同时保持真实自然光",
    en: "increase light-dark separation, warm-cool contrast and near-far scale difference so the hidden window clearly breaks out of the dark enclosure while keeping believable natural light",
    saturation_zh: "压低非焦点背景饱和度，让视觉钩子提高一级饱和度",
    saturation_en: "lower saturation in non-focal background areas and raise the hook by one level",
    brightness_zh: "扩大暗部与窗口高光的明度差，但避免死黑和过曝",
    brightness_en: "widen the value gap between the enclosure and window highlights without crushed blacks or blown highlights"
  },
  impact: {
    name_zh: "视觉冲击",
    name_en: "High visual impact",
    zh: "使用强烈但可信的明暗对比、鲜明色彩对照、夸张近景尺度和明确视觉钩子，形成第一眼冲击与深处发现，不使用过度HDR或虚假光晕",
    en: "use bold but believable light-dark contrast, vivid color opposition, exaggerated near-foreground scale and one decisive visual hook for immediate impact and deeper discovery without excessive HDR or fake glow",
    saturation_zh: "背景饱和度受控，视觉钩子达到最高局部饱和度，其他颜色退后",
    saturation_en: "control background saturation so the hook carries the highest local saturation while other colors recede",
    brightness_zh: "让深色包围与明亮窗口形成明确亮度断层，保留纹理并避免过度HDR",
    brightness_en: "create a clear value break between the dark enclosure and bright window, preserving texture without excessive HDR"
  }
};

const COLOR_FAMILY_RULES = [
  {
    id: "green",
    pattern: /绿|青|苔|翡翠|橄榄|松针|茶叶|green|moss|emerald|olive|pine|tea|coastal|alpine/i,
    hue_zh: "以场景绿色为连续主场，视觉钩子自动使用一处暖红、橙金或珊瑚色互补强调",
    hue_en: "keep the green scene family continuous and use one warm red, amber or coral accent for the hook"
  },
  {
    id: "warm",
    pattern: /橙|红|金|黄|粉|orange|red|gold|wheat|yellow|pink/i,
    hue_zh: "保留暖色主场，隐藏窗口或视觉钩子自动加入一处冷蓝、青绿或青色对照",
    hue_en: "keep the warm scene family dominant and add one cool blue, teal or cyan counterpoint at the window or hook"
  },
  {
    id: "violet",
    pattern: /紫|violet|lavender|blue-violet/i,
    hue_zh: "保留紫色层次，自动加入一处温暖金色或嫩绿色作为焦点对照",
    hue_en: "preserve the violet range and add one warm gold or young-green counterpoint as the focal contrast"
  },
  {
    id: "neutral",
    pattern: /白|雪|white|snow/i,
    hue_zh: "以白灰和低饱和环境为底，自动用深绿或单点暖色建立清晰焦点",
    hue_en: "use white-gray and low-saturation surroundings as the base, then establish focus with deep green or one warm accent"
  }
];

function buildColorPlan(scene, style) {
  const source = `${scene.dominant_zh} ${scene.dominant_en}`;
  const family = COLOR_FAMILY_RULES
    .map(rule => ({ rule, index: source.search(rule.pattern) }))
    .filter(item => item.index >= 0)
    .sort((a, b) => a.index - b.index)[0]?.rule || COLOR_FAMILY_RULES[0];
  return {
    profile: style.id,
    family: family.id,
    base_zh: scene.dominant_zh,
    base_en: scene.dominant_en,
    saturation: { zh: style.saturation_zh, en: style.saturation_en },
    hue: { zh: family.hue_zh, en: family.hue_en },
    brightness: { zh: style.brightness_zh, en: style.brightness_en }
  };
}

function resolveVisualStyle(styleId = "natural") {
  const id = VISUAL_STYLES[styleId] ? styleId : "natural";
  return { id, ...VISUAL_STYLES[id] };
}

function buildAutoMatch(scene, style, overrides = {}) {
  const manualOverrides = ["hook", "emotion", "window"]
    .filter(key => overrides?.[key] != null && overrides[key] !== "");
  const manual = manualOverrides.length > 0;
  return {
    mode: manual ? "automatic_with_manual_overrides" : "automatic",
    mode_zh: manual ? "自动匹配 + 手动覆盖" : "自动匹配",
    mode_en: manual ? "Automatic + manual overrides" : "Automatic",
    visual_style: { id: style.id, zh: style.name_zh, en: style.name_en },
    visual_hook: { zh: scene.hook_zh, en: scene.hook_en },
    emotion: { zh: scene.emotion_zh, en: scene.emotion_en },
    hidden_window: { zh: scene.window_zh, en: scene.window_en },
    manual_overrides: manualOverrides
  };
}

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
    hook_state: pick(v.hook_state, seed, "hookstate"),
    upward_sky: pick(v.upward_sky, seed, "upward-sky")
  };
}

function zhPrompt(scene, variation, style, colorPlan) {
  return [
    `真实自然摄影，9:16竖屏。场景：${scene.name_zh}。`,
    `【进入】${scene.entry_zh}；本次机位变化：${variation.camera_micro.zh}。`,
    `【向上】${variation.upward_sky.zh}。`,
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
    `智能色彩调整：饱和度——${colorPlan.saturation.zh}；色相——${colorPlan.hue.zh}；明亮度——${colorPlan.brightness.zh}。`,
    `视觉表现（${style.name_zh}）：${style.zh}。`,
    `情绪：${scene.emotion_zh}。`,
    `核心机制固定不变：进入 → 包围 → 引导 → 显露。变化只发生在时间、天气、机位微差、向上视角与天空情绪、窗口形态、前景遮挡、空间节奏、季节痕迹、视觉钩子状态和决定性瞬间。`,
    `保持真实植物纹理、随机生长、自然缺损、可信相机位置与真实物理景深。`
  ].join("\n");
}

function enPrompt(scene, variation, style, colorPlan) {
  return [
    `Photorealistic nature photography, vertical 9:16. Scene: ${scene.name_en}.`,
    `[ENTER] ${scene.entry_en}; this variation uses: ${variation.camera_micro.en}.`,
    `[LOOK UP] ${variation.upward_sky.en}.`,
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
    `Smart color adjustment: saturation — ${colorPlan.saturation.en}; hue — ${colorPlan.hue.en}; brightness — ${colorPlan.brightness.en}.`,
    `Visual treatment (${style.name_en}): ${style.en}.`,
    `Emotion: ${scene.emotion_en}.`,
    `The core mechanism is frozen: Enter → Enclose → Guide → Reveal. Variation is allowed only in time, weather, camera micro-position, upward gaze and sky mood, window shape, foreground occlusion, depth rhythm, seasonal trace, hook state and decisive moment.`,
    `Keep authentic plant texture, random growth, natural imperfections, believable camera placement and real optical depth.`
  ].join("\n");
}

export const NEGATIVE_ZH = "避免：普通平视花田、站立视角、俯拍、人工拱门、完美对称、人物抢主体、多个竞争焦点、假散景、梦幻光晕、过度HDR、塑料植物、CGI、3D渲染、摄影棚灯光、所有景物同时锐利、过度清洁和刻意摆拍。";
export const NEGATIVE_EN = "Avoid: conventional eye-level flower-field photography, standing viewpoint, top-down view, artificial arches, perfect symmetry, dominant human subjects, multiple competing focal points, fake bokeh, fantasy glow, excessive HDR, plastic foliage, CGI, 3D-rendered look, studio lighting, everything tack-sharp, overly clean or staged vegetation.";

export function generatePrompt({ scene, language = "zh", overrides = {}, seed = Date.now(), visualStyle = "natural" } = {}) {
  if (!scene) throw new Error("scene is required");
  if (!LANGUAGES.includes(language)) throw new Error(`Unsupported language: ${language}`);

  const resolved = resolveScene(scene, overrides);
  const variation = buildVariation(seed);
  const style = resolveVisualStyle(visualStyle);
  const colorPlan = buildColorPlan(resolved, style);
  const prompt_zh = zhPrompt(resolved, variation, style, colorPlan);
  const prompt_en = enPrompt(resolved, variation, style, colorPlan);

  const result = {
    skill: "hidden-nature-window",
    version: "0.10.0",
    scene_id: scene,
    scene: resolved,
    seed,
    variation,
    visual_style: style.id,
    visual_style_name: { zh: style.name_zh, en: style.name_en },
    upward_motif: variation.upward_sky,
    auto_match: buildAutoMatch(resolved, style, overrides),
    color_plan: colorPlan,
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
  seed = Date.now(),
  visualStyle = "natural"
} = {}) {
  if (!LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  const scene = await composeSceneSpec(input);
  const variation = buildVariation(seed);
  const style = resolveVisualStyle(visualStyle);
  const colorPlan = buildColorPlan(scene, style);
  const prompt_zh = zhPrompt(scene, variation, style, colorPlan);
  const prompt_en = enPrompt(scene, variation, style, colorPlan);

  const result = {
    skill: "hidden-nature-window",
    version: "0.10.0",
    source: "composed",
    scene,
    seed,
    variation,
    visual_style: style.id,
    visual_style_name: { zh: style.name_zh, en: style.name_en },
    upward_motif: variation.upward_sky,
    auto_match: buildAutoMatch(scene, style),
    color_plan: colorPlan,
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

export function oneClick({ language = "zh", seed = Date.now(), visualStyle = "natural" } = {}) {
  const ids = listScenes().map(s => s.id);
  const sceneIndex = hashSeed(`${seed}:scene`) % ids.length;
  return generatePrompt({ scene: ids[sceneIndex], language, seed, visualStyle });
}

export function series({ scene, language = "zh", count = 6, seed = 1, overrides = {}, visualStyle = "natural" } = {}) {
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error("count must be an integer between 1 and 50");
  }
  return Array.from({ length: count }, (_, i) =>
    generatePrompt({
      scene,
      language,
      overrides,
      visualStyle,
      seed: hashSeed(`${seed}:series:${i}`)
    })
  );
}

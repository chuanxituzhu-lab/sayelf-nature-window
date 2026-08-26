const PLANTS = {
  bamboo: {
    zh: "青竹、竹叶与自然落叶",
    en: "green bamboo, bamboo leaves and natural fallen leaves",
    dominant_zh: "青绿色",
    dominant_en: "blue-green"
  },
  lotus: {
    zh: "巨大荷叶、细长荷梗与少量荷花",
    en: "large lotus leaves, slender stems and a few lotus blossoms",
    dominant_zh: "翡翠绿",
    dominant_en: "emerald green"
  },
  reeds: {
    zh: "高密度芦苇、细长叶片与浅金色芦花",
    en: "dense reeds, slender blades and pale-gold reed plumes",
    dominant_zh: "橄榄绿与浅金",
    dominant_en: "olive green and pale gold"
  },
  maple: {
    zh: "枫叶、深色细枝与自然落叶",
    en: "maple leaves, dark fine branches and fallen leaves",
    dominant_zh: "橙红与深褐",
    dominant_en: "orange red and dark brown"
  },
  snow_branches: {
    zh: "覆雪枝条、深色树皮与少量红果",
    en: "snow-covered branches, dark bark and a few red berries",
    dominant_zh: "雪白与冷蓝",
    dominant_en: "snow white and cool blue"
  },
  grass: {
    zh: "茂密高草、细长草叶与少量野花",
    en: "dense tall grass, slender blades and a few wildflowers",
    dominant_zh: "鲜活自然绿色",
    dominant_en: "lively natural green"
  },
  fern: {
    zh: "大型蕨叶、湿润腐殖土与幼嫩卷叶",
    en: "large fern fronds, moist humus and young curled shoots",
    dominant_zh: "深绿与嫩绿",
    dominant_en: "deep and young green"
  }
};

const LOCATIONS = {
  forest: { zh: "森林深处", en: "deep forest" },
  pond: { zh: "安静荷塘", en: "quiet pond" },
  mountain: { zh: "山地坡谷", en: "mountain slope and valley" },
  wetland: { zh: "湿地边缘", en: "wetland edge" },
  garden: { zh: "自然生长的庭园角落", en: "a naturally grown garden corner" },
  coast: { zh: "海岸草坡", en: "coastal grass slope" },
  field: { zh: "开阔田野内部", en: "inside an open field" }
};

const EMOTIONS = {
  calm: { zh: "安静与庇护", en: "quietness and shelter" },
  longing: { zh: "思念与远望", en: "longing and looking beyond" },
  mystery: { zh: "神秘与探索", en: "mystery and exploration" },
  freedom: { zh: "自由与远行", en: "freedom and departure" },
  renewal: { zh: "恢复与新生", en: "renewal and recovery" },
  solitude: { zh: "孤独与留白", en: "solitude and negative space" }
};

function norm(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function composeScene(input = {}) {
  const plantKey = norm(input.plant, "grass");
  const locationKey = norm(input.location, "field");
  const emotionKey = norm(input.emotion, "calm");

  const plant = PLANTS[plantKey] || PLANTS.grass;
  const location = LOCATIONS[locationKey] || LOCATIONS.field;
  const emotion = EMOTIONS[emotionKey] || EMOTIONS.calm;

  const customWindowZh = input.window_zh || input.window || "自然元素之间一小块明亮天空";
  const customWindowEn = input.window_en || input.window || "a small bright sky opening between natural elements";
  const customHookZh = input.hook_zh || input.hook || "一处被自然光轻轻命中的小型视觉锚点";
  const customHookEn = input.hook_en || input.hook || "one small visual anchor gently touched by natural light";

  const nameZh = input.name_zh || `${location.zh}·隐藏窗口`;
  const nameEn = input.name_en || `${location.en} · Hidden Window`;

  return {
    name_zh: nameZh,
    name_en: nameEn,
    plant_zh: plant.zh,
    plant_en: plant.en,
    entry_zh: `镜头真正进入${location.zh}的自然内部，贴近地面或植株根部，从植物结构之间向远处或上方寻找出口`,
    entry_en: `camera physically enters ${location.en}, staying close to the ground or plant base and looking through natural structures toward an exit`,
    enclosure_zh: `植物从画面四周形成不规则天然包围，近景允许真实遮挡，中景保持可辨识结构`,
    enclosure_en: `plants form an irregular natural enclosure around the frame, allowing authentic foreground occlusion while keeping the midground legible`,
    window_zh: customWindowZh,
    window_en: customWindowEn,
    hook_zh: customHookZh,
    hook_en: customHookEn,
    light_zh: input.light_zh || input.light || "可信的自然天光，保持真实物理曝光过渡",
    light_en: input.light_en || input.light || "believable natural skylight with physically realistic exposure transitions",
    emotion_zh: emotion.zh,
    emotion_en: emotion.en,
    dominant_zh: plant.dominant_zh,
    dominant_en: plant.dominant_en
  };
}

export const composerCapabilities = {
  plants: Object.keys(PLANTS),
  locations: Object.keys(LOCATIONS),
  emotions: Object.keys(EMOTIONS)
};

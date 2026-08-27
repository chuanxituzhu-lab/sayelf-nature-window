const sceneEl = document.querySelector("#scene");
const langEl = document.querySelector("#language");
const visualStyleEl = document.querySelector("#visualStyle");
const matchModeEl = document.querySelector("#matchMode");
const manualFieldsEl = document.querySelector("#manualFields");
const outputEl = document.querySelector("#output");
const metaEl = document.querySelector("#meta");
const previewEl = document.querySelector("#preview");
const previewEmptyEl = document.querySelector("#previewEmpty");
const previewCaptionEl = document.querySelector("#previewCaption");
const copyStatusEl = document.querySelector("#copyStatus");
let copyStatusTimer;

function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value ?? "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = hashText(seed) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function previewPalette(data) {
  const motif = data.upward_motif?.id || "healing_blue";
  const palettes = {
    healing_blue: { skyTop: "#3b9fc5", skyBottom: "#e8f8ff", glow: "#f4ffff", deep: "#06130b", forest: "#12371c", darkLeaf: "#0b2a14", mid: "#1f5a28", leaf: "#4e8f2e", accent: "#eb397f" },
    dawn_rise: { skyTop: "#c65776", skyBottom: "#ffe3a2", glow: "#fff1c7", deep: "#1a0d18", forest: "#2d1d20", darkLeaf: "#1d2916", mid: "#663642", leaf: "#456f32", accent: "#f28b54" },
    sunset_glow: { skyTop: "#783b55", skyBottom: "#ffad62", glow: "#ffe09b", deep: "#140b12", forest: "#2b171b", darkLeaf: "#1d2716", mid: "#5f302d", leaf: "#456f31", accent: "#ee5c49" },
    after_rain_sky: { skyTop: "#278db0", skyBottom: "#e8fbff", glow: "#ffffff", deep: "#061518", forest: "#10362d", darkLeaf: "#0a2a24", mid: "#1f5f58", leaf: "#3f8b4a", accent: "#f2c34d" }
  };
  const palette = palettes[motif] || palettes.healing_blue;
  if (data.visual_style === "natural") return palette;
  if (data.visual_style === "contrast") return { ...palette, deep: "#041009", forest: "#164520", accent: palette.accent };
  return { ...palette, deep: "#020a05", forest: "#0d3319", accent: palette.accent };
}

function leafSvg(x, y, scale, angle, color, opacity = 1, blur = 0) {
  const filter = blur ? ` filter="url(#leafBlur)"` : "";
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${scale.toFixed(2)})" opacity="${opacity.toFixed(2)}"${filter}>
    <path d="M0 0 C28 -62 105 -82 153 -45 C119 8 45 34 0 0Z" fill="${color}"/>
    <path d="M2 0 Q70 -24 145 -45" fill="none" stroke="#b8dc83" stroke-opacity=".26" stroke-width="2"/>
  </g>`;
}

function flowerSvg(x, y, scale, color, angle) {
  const petals = Array.from({ length: 5 }, (_, index) => {
    const petalAngle = index * 72;
    return `<ellipse cx="0" cy="-${(17 * scale).toFixed(1)}" rx="${(8 * scale).toFixed(1)}" ry="${(20 * scale).toFixed(1)}" fill="${color}" transform="rotate(${petalAngle})"/>`;
  }).join("");
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})">
    ${petals}<circle r="${(8 * scale).toFixed(1)}" fill="#f6d45e"/>
  </g>`;
}

function createPreviewSvg(data) {
  const random = seededRandom(`${data.seed}:${data.scene_id}:${data.upward_motif?.id}:${data.visual_style}`);
  const palette = previewPalette(data);
  const width = 720;
  const height = 1120;
  const center = width / 2 + (random() - .5) * 42;
  const apertureTop = 285 + random() * 105;
  const apertureBottom = 790 + random() * 110;
  const apertureWidth = 150 + random() * 60;
  const left = center - apertureWidth;
  const right = center + apertureWidth;
  const aperturePath = `M ${center.toFixed(1)} ${apertureTop.toFixed(1)} C ${(right + 44).toFixed(1)} ${(apertureTop + 120).toFixed(1)}, ${(right + 22).toFixed(1)} ${(apertureBottom - 110).toFixed(1)}, ${right.toFixed(1)} ${apertureBottom.toFixed(1)} C ${(center + 70).toFixed(1)} ${(apertureBottom + 52).toFixed(1)}, ${(center - 80).toFixed(1)} ${(apertureBottom + 42).toFixed(1)}, ${left.toFixed(1)} ${apertureBottom.toFixed(1)} C ${(left - 28).toFixed(1)} ${(apertureBottom - 120).toFixed(1)}, ${(left - 38).toFixed(1)} ${(apertureTop + 90).toFixed(1)}, ${center.toFixed(1)} ${apertureTop.toFixed(1)}Z`;

  const skyDetails = Array.from({ length: 7 }, () => {
    const x = left + random() * apertureWidth * 2;
    const y = apertureTop + random() * (apertureBottom - apertureTop);
    const r = 9 + random() * 28;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * 1.8).toFixed(1)}" ry="${(r * .45).toFixed(1)}" fill="#ffffff" opacity="${(.08 + random() * .16).toFixed(2)}"/>`;
  }).join("");

  const stems = Array.from({ length: 12 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const x = center + side * (apertureWidth * (.7 + random() * .9));
    const bend = center + side * (apertureWidth * (.35 + random() * .7));
    return `<path d="M ${x.toFixed(1)} 1120 Q ${bend.toFixed(1)} ${(780 - random() * 230).toFixed(1)} ${(center + side * random() * 80).toFixed(1)} ${(apertureTop + random() * 180).toFixed(1)}" fill="none" stroke="${palette.mid}" stroke-width="${(4 + random() * 7).toFixed(1)}" opacity=".72"/>`;
  }).join("");

  const leaves = [];
  for (let index = 0; index < 52; index++) {
    const edge = index % 4;
    let x;
    let y;
    let angle;
    if (edge === 0) {
      x = random() * width;
      y = -50 + random() * 260;
      angle = 125 + random() * 85;
    } else if (edge === 1) {
      x = random() * 190 - 80;
      y = 130 + random() * 890;
      angle = -35 + random() * 90;
    } else if (edge === 2) {
      x = 530 + random() * 240;
      y = 150 + random() * 920;
      angle = 95 + random() * 95;
    } else {
      x = random() * width;
      y = 850 + random() * 300;
      angle = -115 + random() * 85;
    }
    const scale = .62 + random() * .78;
    const color = index % 5 === 0 ? palette.mid : (index % 3 === 0 ? palette.leaf : palette.darkLeaf);
    leaves.push(leafSvg(x, y, scale, angle, color, .58 + random() * .36, index % 6 === 0 ? 1 : 0));
  }

  const tubeLeaves = Array.from({ length: 18 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const x = center + side * (apertureWidth * (.72 + random() * .35));
    const y = apertureTop + 70 + random() * (apertureBottom - apertureTop - 130);
    return leafSvg(x, y, .32 + random() * .34, side < 0 ? 5 + random() * 60 : 115 + random() * 60, index % 3 === 0 ? palette.mid : palette.leaf, .72, 0);
  }).join("");

  const flowers = Array.from({ length: 8 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    return flowerSvg(
      center + side * (apertureWidth + 80 + random() * 180),
      430 + random() * 600,
      .45 + random() * .58,
      index % 3 === 0 ? palette.accent : palette.mid,
      random() * 80 - 40
    );
  }).join("");

  const motifId = data.upward_motif?.id || "healing_blue";
  const sunY = motifId === "sunset_glow" ? apertureBottom - 80 : motifId === "dawn_rise" ? apertureTop + 92 : apertureTop + (apertureBottom - apertureTop) * .34;
  const motifName = escapeXml(data.upward_motif?.name_zh || "向上发现");
  const sceneName = escapeXml(data.scene?.name_zh || data.scene?.name_en || "Nature Window");
  const styleLabel = escapeXml(data.visual_style || "natural");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${sceneName} ${motifName} visual simulation">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${palette.skyTop}"/>
      <stop offset=".58" stop-color="${palette.skyBottom}"/>
      <stop offset="1" stop-color="${palette.glow}"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${palette.glow}" stop-opacity=".98"/>
      <stop offset=".48" stop-color="${palette.glow}" stop-opacity=".38"/>
      <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="48%" r="70%">
      <stop offset=".42" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity=".78"/>
    </radialGradient>
    <radialGradient id="forest" cx="50%" cy="46%" r="74%">
      <stop offset="0" stop-color="${palette.forest}"/>
      <stop offset=".62" stop-color="${palette.deep}"/>
      <stop offset="1" stop-color="#010604"/>
    </radialGradient>
    <filter id="softBlur"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="leafBlur"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#forest)"/>
  <path d="${aperturePath}" fill="url(#sky)"/>
  <ellipse cx="${(center + (random() - .5) * 70).toFixed(1)}" cy="${sunY.toFixed(1)}" rx="145" ry="145" fill="url(#sun)" filter="url(#softBlur)"/>
  ${skyDetails}
  ${stems}
  ${tubeLeaves}
  ${leaves.join("")}
  ${flowers}
  <path d="${aperturePath}" fill="none" stroke="#ffffff" stroke-opacity=".16" stroke-width="3"/>
  <rect width="${width}" height="${height}" fill="url(#vignette)"/>
  <text x="30" y="46" fill="#ffffff" fill-opacity=".72" font-family="Arial, sans-serif" font-size="16" letter-spacing="3">NATURE WINDOW · SIMULATION</text>
  <text x="30" y="1080" fill="#ffffff" fill-opacity=".88" font-family="Arial, sans-serif" font-size="22" font-weight="700">${motifName}</text>
  <text x="30" y="1107" fill="#ffffff" fill-opacity=".58" font-family="Arial, sans-serif" font-size="13" letter-spacing="1.2">${sceneName} · ${styleLabel}</text>
</svg>`;
}

function previewDataUri(data) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(createPreviewSvg(data))}`;
}

function showCopyStatus(message, isError = false) {
  clearTimeout(copyStatusTimer);
  copyStatusEl.textContent = message;
  copyStatusEl.classList.toggle("error", isError);
  if (!isError) {
    copyStatusTimer = setTimeout(() => {
      copyStatusEl.textContent = "";
    }, 2400);
  }
}

function updatePreview(data) {
  const sceneName = data.scene?.name_zh || data.scene?.name_en || "Nature Window";
  previewEl.src = previewDataUri(data);
  previewEl.alt = `${sceneName} Nature Window visual simulation`;
  previewEl.hidden = false;
  previewEmptyEl.hidden = true;
  previewCaptionEl.textContent = `${sceneName} · 视觉模拟图已根据本次提示词的构图、天空情绪与色彩自动变化；不是最终照片。`;
}

function resetPreview() {
  previewEl.src = "/assets/nature-window-preview.png";
  previewEl.hidden = true;
  previewEmptyEl.hidden = false;
  previewCaptionEl.textContent = "预览图展示 Nature Window 的观看方式；生成后会依据提示词自动绘制视觉模拟图。";
}

function getManualOverrides() {
  if (matchModeEl.value !== "manual") return {};
  return {
    emotion: document.querySelector("#emotion").value.trim(),
    hook: document.querySelector("#hook").value.trim(),
    window: document.querySelector("#window").value.trim()
  };
}

function updateMatchMode() {
  manualFieldsEl.hidden = matchModeEl.value !== "manual";
}

function updateMeta(data, prefix) {
  const match = data.auto_match;
  if (!match) {
    metaEl.textContent = prefix;
    return;
  }
  const hook = langEl.value === "en" ? match.visual_hook.en : match.visual_hook.zh;
  const emotion = langEl.value === "en" ? match.emotion.en : match.emotion.zh;
  const windowText = langEl.value === "en" ? match.hidden_window.en : match.hidden_window.zh;
  const upward = data.upward_motif
    ? (langEl.value === "en" ? data.upward_motif.en : data.upward_motif.zh)
    : "";
  const upwardLine = upward ? `\n向上视角：${upward}` : "";
  metaEl.textContent = `${prefix} · ${match.mode_zh}\n视觉钩子：${hook} · 情绪：${emotion} · 隐藏窗口：${windowText}${upwardLine}`;
}

async function json(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
}

async function loadScenes() {
  const data = await json("/v1/scenes");
  sceneEl.innerHTML = data.scenes.map(s =>
    `<option value="${s.id}">${s.name_zh} / ${s.name_en}</option>`
  ).join("");
}

async function generate() {
  const body = {
    scene: sceneEl.value,
    language: langEl.value,
    visual_style: visualStyleEl.value,
    overrides: getManualOverrides()
  };
  const data = await json("/v1/prompt", {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify(body)
  });
  outputEl.value = data.prompt;
  updatePreview(data);
  updateMeta(data, `${data.scene.name_zh} / ${data.scene.name_en} · ${data.language}`);
}

async function oneClickPrompt() {
  const data = await json("/v1/one-click", {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify({ language: langEl.value, visual_style: visualStyleEl.value })
  });
  sceneEl.value = data.scene_id;
  outputEl.value = data.prompt;
  updatePreview(data);
  updateMeta(data, `${data.scene.name_zh} / ${data.scene.name_en} · ${data.language}`);
}

document.querySelector("#generate").onclick = () => generate().catch(e => alert(e.message));
document.querySelector("#oneClick").onclick = () => oneClickPrompt().catch(e => alert(e.message));
document.querySelector("#copy").onclick = async () => {
  if (!outputEl.value.trim()) {
    showCopyStatus("暂无内容可复制", true);
    return;
  }
  try {
    await navigator.clipboard.writeText(outputEl.value);
    showCopyStatus("复制成功");
  } catch (error) {
    showCopyStatus("复制失败，请手动复制", true);
  }
};
document.querySelector("#clear").onclick = () => { outputEl.value = ""; metaEl.textContent = ""; copyStatusEl.textContent = ""; resetPreview(); };

matchModeEl.onchange = updateMatchMode;
updateMatchMode();

loadScenes().catch(error => {
  metaEl.textContent = `场景加载失败：${error.message}`;
});


async function composeScenePrompt() {
  const body = {
    language: langEl.value,
    visual_style: visualStyleEl.value,
    input: {
      plant: document.querySelector("#plant").value,
      location: document.querySelector("#location").value,
      emotion: document.querySelector("#composerEmotion").value
    }
  };
  const data = await json("/v1/compose", {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify(body)
  });
  outputEl.value = data.prompt;
  updatePreview(data);
  updateMeta(data, `动态组合 · ${data.scene.name_zh} / ${data.scene.name_en}`);
}

async function composeSeriesPrompt() {
  const base = {
    language: langEl.value,
    visual_style: visualStyleEl.value,
    input: {
      plant: document.querySelector("#plant").value,
      location: document.querySelector("#location").value,
      emotion: document.querySelector("#composerEmotion").value
    }
  };
  const items = [];
  let lastData;
  const seedBase = Date.now();
  for (let i = 0; i < 6; i++) {
    const data = await json("/v1/compose", {
      method: "POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({...base, seed: seedBase + i})
    });
    lastData = data;
    items.push(`### ${i+1}\n${data.prompt}`);
  }
  outputEl.value = items.join("\n\n");
  updatePreview(lastData);
  metaEl.textContent = "动态组合系列 · 6条";
}

document.querySelector("#compose").onclick = () => composeScenePrompt().catch(e => alert(e.message));
document.querySelector("#composeSeries").onclick = () => composeSeriesPrompt().catch(e => alert(e.message));

const sceneEl = document.querySelector("#scene");
const langEl = document.querySelector("#language");
const outputEl = document.querySelector("#output");
const metaEl = document.querySelector("#meta");

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
    overrides: {
      emotion: document.querySelector("#emotion").value.trim(),
      hook: document.querySelector("#hook").value.trim(),
      window: document.querySelector("#window").value.trim()
    }
  };
  const data = await json("/v1/prompt", {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify(body)
  });
  outputEl.value = data.prompt;
  metaEl.textContent = `${data.scene.name_zh} / ${data.scene.name_en} · ${data.language}`;
}

async function oneClickPrompt() {
  const data = await json("/v1/one-click", {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify({ language: langEl.value })
  });
  sceneEl.value = data.scene_id;
  outputEl.value = data.prompt;
  metaEl.textContent = `${data.scene.name_zh} / ${data.scene.name_en} · ${data.language}`;
}

document.querySelector("#generate").onclick = () => generate().catch(e => alert(e.message));
document.querySelector("#oneClick").onclick = () => oneClickPrompt().catch(e => alert(e.message));
document.querySelector("#copy").onclick = async () => {
  await navigator.clipboard.writeText(outputEl.value);
};
document.querySelector("#clear").onclick = () => { outputEl.value = ""; metaEl.textContent = ""; };

await loadScenes();


async function composeScenePrompt() {
  const body = {
    language: langEl.value,
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
  metaEl.textContent = `动态组合 · ${data.scene.name_zh} / ${data.scene.name_en}`;
}

async function composeSeriesPrompt() {
  const base = {
    language: langEl.value,
    input: {
      plant: document.querySelector("#plant").value,
      location: document.querySelector("#location").value,
      emotion: document.querySelector("#composerEmotion").value
    }
  };
  const items = [];
  const seedBase = Date.now();
  for (let i = 0; i < 6; i++) {
    const data = await json("/v1/compose", {
      method: "POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({...base, seed: seedBase + i})
    });
    items.push(`### ${i+1}\n${data.prompt}`);
  }
  outputEl.value = items.join("\n\n");
  metaEl.textContent = "动态组合系列 · 6条";
}

document.querySelector("#compose").onclick = () => composeScenePrompt().catch(e => alert(e.message));
document.querySelector("#composeSeries").onclick = () => composeSeriesPrompt().catch(e => alert(e.message));

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.resolve(ROOT, "plugins/registry.json");

export function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

export function enabledPlugins(type) {
  return loadRegistry().plugins
    .filter(p => p.enabled && (!type || p.type === type))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

export function loadJsonProviders(type) {
  const plugins = enabledPlugins(type);
  const merged = {};
  for (const plugin of plugins) {
    if (!plugin.source) continue;
    const full = path.resolve(ROOT, "plugins", plugin.source);
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    Object.assign(merged, data);
  }
  return merged;
}

export async function loadComposer() {
  const plugin = enabledPlugins("composer-provider")[0];
  if (!plugin) throw new Error("No enabled composer-provider");
  const full = path.resolve(ROOT, plugin.module.replace("./plugins/", "plugins/"));
  return import(pathToFileURL(full).href);
}

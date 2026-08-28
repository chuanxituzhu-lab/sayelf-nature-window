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

export function loadJsonProviders(type, { onError } = {}) {
  const plugins = enabledPlugins(type);
  const merged = {};
  for (const plugin of plugins) {
    if (!plugin.source) continue;
    try {
      const full = path.resolve(ROOT, "plugins", plugin.source);
      const data = JSON.parse(fs.readFileSync(full, "utf8"));
      Object.assign(merged, data);
    } catch (error) {
      onError?.({
        plugin: plugin.id,
        code: "PROVIDER_LOAD_FAILED",
        message: error.message
      });
    }
  }
  return merged;
}

export async function loadComposer() {
  const errors = [];
  for (const plugin of enabledPlugins("composer-provider")) {
    try {
      const full = path.resolve(ROOT, plugin.module.replace("./plugins/", "plugins/"));
      return await import(pathToFileURL(full).href);
    } catch (error) {
      errors.push({ plugin: plugin.id, code: "PROVIDER_LOAD_FAILED", message: error.message });
    }
  }
  const error = new Error(errors.map(item => item.message).join("; ") || "No enabled composer-provider");
  error.code = "COMPOSER_UNAVAILABLE";
  error.details = errors;
  throw error;
}

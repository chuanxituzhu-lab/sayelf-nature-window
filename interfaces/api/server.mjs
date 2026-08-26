import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePrompt, listScenes, oneClick, series, generateComposedPrompt } from "../../core/compiler.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "../web");
const port = Number(process.env.PORT || 4178);
const host = process.env.HOST || "127.0.0.1";

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "access-control-allow-origin": "*" });
  res.end(typeof body === "string" ? body : JSON.stringify(body, null, 2));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, "");

  try {
    if (req.method === "GET" && req.url === "/v1/scenes") {
      return send(res, 200, { scenes: listScenes() });
    }
    if (req.method === "POST" && req.url === "/v1/prompt") {
      const body = await readJson(req);
      return send(res, 200, generatePrompt({
        scene: body.scene,
        language: body.language || "zh",
        overrides: body.overrides || {},
        visualStyle: body.visual_style || body.visualStyle || "natural"
      }));
    }
    if (req.method === "POST" && req.url === "/v1/one-click") {
      const body = await readJson(req);
      return send(res, 200, oneClick({
        language: body.language || "zh",
        seed: Number.isInteger(body.seed) ? body.seed : undefined,
        visualStyle: body.visual_style || body.visualStyle || "natural"
      }));
    }
    if (req.method === "POST" && req.url === "/v1/compose") {
      const body = await readJson(req);
      return send(res, 200, await generateComposedPrompt({
        input: body.input || {},
        language: body.language || "zh",
        seed: Number.isInteger(body.seed) ? body.seed : Date.now(),
        visualStyle: body.visual_style || body.visualStyle || "natural"
      }));
    }
    if (req.method === "POST" && req.url === "/v1/series") {
      const body = await readJson(req);
      return send(res, 200, {
        items: series({
          scene: body.scene,
          language: body.language || "zh",
          count: Number.isInteger(body.count) ? body.count : 6,
          seed: Number.isInteger(body.seed) ? body.seed : 1,
          overrides: body.overrides || {},
          visualStyle: body.visual_style || body.visualStyle || "natural"
        })
      });
    }
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      const html = fs.readFileSync(path.join(webRoot, "index.html"), "utf8");
      return send(res, 200, html, "text/html; charset=utf-8");
    }
    if (req.method === "GET" && req.url === "/app.js") {
      const js = fs.readFileSync(path.join(webRoot, "app.js"), "utf8");
      return send(res, 200, js, "text/javascript; charset=utf-8");
    }
    return send(res, 404, { error: "not_found" });
  } catch (error) {
    return send(res, 400, { error: error.message, code: error.code || "BAD_REQUEST" });
  }
});

server.listen(port, host, () => {
  console.log(`Hidden Nature Window WebUI/API: http://${host}:${port}`);
});

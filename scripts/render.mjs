// Renderiza stills ou o vídeo do motor toy. Uso:
//   node scripts/render.mjs still <prefixo> <frame,frame,...> [escala=0.5]
//   node scripts/render.mjs video <saida.mp4> [escala=1] [crf=18] [inicio-fim]
// Chrome da máquina (sem GPU): WebGL por software via ANGLE/SwiftShader. REMOTION_TMP aponta para disco grande.
import fs from "node:fs";
import path from "node:path";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const [mode, out, a3, a4, a5] = process.argv.slice(2);
const browserExecutable = process.env.CHROME || "/usr/bin/google-chrome";
const chromiumOptions = { gl: process.env.GL || "swangle", disableWebSecurity: false };
const concurrency = Number(process.env.CONC || 8);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "ToyShort", browserExecutable, chromiumOptions });
const onBrowserLog = (l) => { if (l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };

if (mode === "still") {
  const scale = Number(a4 || 0.5);
  for (const f of a3.split(",").map(Number)) {
    const t0 = Date.now();
    await renderStill({ composition, serveUrl, frame: f, output: `${out}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 90, scale,
      browserExecutable, chromiumOptions, timeoutInMilliseconds: 240000, onBrowserLog });
    console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
  }
} else {
  const scale = Number(a3 || 1), crf = Number(a4 || 18);
  const frameRange = a5 ? a5.split("-").map(Number) : null;
  const t0 = Date.now();
  await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, crf, scale, concurrency, frameRange,
    browserExecutable, chromiumOptions, timeoutInMilliseconds: 240000, onBrowserLog, muted: true,
    onProgress: ({ renderedFrames }) => { if (renderedFrames % 60 === 0) console.log("frames", renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + "s"); } });
  console.log("done", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
}

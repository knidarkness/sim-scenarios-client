import { build } from "esbuild";
import { mkdirSync } from "fs";

mkdirSync("dist-electron/simconnect", { recursive: true });

// Build main process (ESM, matches "type": "module" in package.json)
await build({
  entryPoints: ["src/electron/main.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist-electron/main.js",
  external: ["electron", "node-simconnect"],
  sourcemap: true,
});

// Build preload (CommonJS, loaded by Electron as .cjs)
await build({
  entryPoints: ["src/electron/preload.cts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "dist-electron/preload.cjs",
  external: ["electron"],
  sourcemap: true,
});

console.log("Electron build complete.");

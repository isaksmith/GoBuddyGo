import { existsSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const assetsDir = path.resolve(projectRoot, "public", "assets");

const MODEL_NAMES = ["buddy-car", "jeep", "mini-coop", "cruiser"];

function runOptimize(inputPath, outputPath) {
  const args = [
    "exec",
    "gltf-transform",
    "optimize",
    inputPath,
    outputPath,
    "--compress",
    "false",
    "--texture-compress",
    "auto",
    "--texture-size",
    "1024",
    "--simplify",
    "true",
    "--simplify-ratio",
    "0.35",
    "--simplify-error",
    "0.002",
  ];

  const result = spawnSync("pnpm", args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Optimization failed for ${path.basename(inputPath)}`);
  }
}

function main() {
  for (const name of MODEL_NAMES) {
    const inputPath = path.join(assetsDir, `${name}.glb`);
    const outputPath = path.join(assetsDir, `${name}.mobile.glb`);

    if (!existsSync(inputPath)) {
      console.warn(`Skipping missing source model: ${inputPath}`);
      continue;
    }

    console.log(`Optimizing ${name}.glb -> ${name}.mobile.glb`);
    runOptimize(inputPath, outputPath);
  }

  console.log("Model optimization complete.");
}

main();

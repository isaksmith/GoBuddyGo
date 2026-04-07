import { existsSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const assetsDir = path.resolve(projectRoot, "public", "assets");

const MODEL_NAMES = ["buddy-car", "jeep", "mini-coop", "cruiser"];
const MOBILE_TEXTURE_SIZE = process.env.MOBILE_TEXTURE_SIZE ?? "512";
const MOBILE_SIMPLIFY_RATIO = process.env.MOBILE_SIMPLIFY_RATIO ?? "0.22";
const MOBILE_SIMPLIFY_ERROR = process.env.MOBILE_SIMPLIFY_ERROR ?? "0.003";
const MOBILE_TEXTURE_FORMAT = process.env.MOBILE_TEXTURE_FORMAT ?? "webp";

function runOptimize(inputPath, outputPath) {
  const args = [
    "exec",
    "gltf-transform",
    "optimize",
    inputPath,
    outputPath,
    "--compress",
    "draco",
    "--texture-compress",
    MOBILE_TEXTURE_FORMAT,
    "--texture-size",
    MOBILE_TEXTURE_SIZE,
    "--simplify",
    "true",
    "--simplify-ratio",
    MOBILE_SIMPLIFY_RATIO,
    "--simplify-error",
    MOBILE_SIMPLIFY_ERROR,
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
  console.log(
    `Mobile optimize settings: texture=${MOBILE_TEXTURE_SIZE}px, format=${MOBILE_TEXTURE_FORMAT}, simplifyRatio=${MOBILE_SIMPLIFY_RATIO}, simplifyError=${MOBILE_SIMPLIFY_ERROR}`
  );

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

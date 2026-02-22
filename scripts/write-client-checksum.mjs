import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const clientDir = process.cwd();
const repoRoot = join(clientDir, "..");

const packageJson = JSON.parse(readFileSync(join(clientDir, "package.json"), "utf8"));
const productName = packageJson.build?.productName ?? "Sim Scenarios Client";
const version = packageJson.version;
const backendVersionPath = join(repoRoot, "back", "app-version.json");
const installerName = `${productName} Setup ${version}.exe`;
const installerPath = join(clientDir, "release", installerName);

const buffer = readFileSync(installerPath);
const sha256 = createHash("sha256").update(buffer).digest("hex").toUpperCase();

writeFileSync(
	backendVersionPath,
	`${JSON.stringify({ version, checksum: sha256 }, null, 2)}\n`,
	"utf8",
);

console.log("Updated back/app-version.json with version and checksum.");
console.log(`${basename(installerPath)} SHA256: ${sha256}`);
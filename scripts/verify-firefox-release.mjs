import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const dist = path.join(root, "dist");
const staged = path.join(root, "release", "firefox");
const sourceStage = path.join(root, "release", "firefox-source");
const extensionZip = path.join(root, "release", `timeless-${pkg.version}.zip`);
const sourceZip = path.join(root, "release", `timeless-${pkg.version}-source.zip`);

function fail(message) {
  console.error(`firefox release verify: FAIL — ${message}`);
  process.exitCode = 1;
}

function walkFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(full));
    else files.push(full);
  }
  return files;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

for (const [label, target] of [
  ["dist", dist],
  ["Firefox staging", staged],
  ["reviewer source staging", sourceStage],
  ["extension ZIP", extensionZip],
  ["reviewer source ZIP", sourceZip],
]) {
  if (!fs.existsSync(target)) fail(`${label} is missing: ${target}`);
}

if (process.exitCode) process.exit();

const manifest = JSON.parse(fs.readFileSync(path.join(staged, "manifest.json"), "utf8"));

if (manifest.manifest_version !== 3) fail("manifest_version must remain 3");
if (manifest.version !== pkg.version) {
  fail(`manifest version ${manifest.version} does not match package version ${pkg.version}`);
}
if (manifest.browser_specific_settings?.gecko?.id !== "timeless@moonlightclarity") {
  fail("permanent Firefox extension ID changed");
}
if (manifest.browser_specific_settings?.gecko?.strict_min_version !== "140.0") {
  fail("Firefox desktop minimum version changed");
}
const requiredData =
  manifest.browser_specific_settings?.gecko?.data_collection_permissions?.required;
if (JSON.stringify(requiredData) !== JSON.stringify(["none"])) {
  fail('Firefox data collection declaration must remain required:["none"]');
}
if ("permissions" in manifest && manifest.permissions?.length) {
  fail(`unexpected Firefox permissions: ${JSON.stringify(manifest.permissions)}`);
}
if ("host_permissions" in manifest && manifest.host_permissions?.length) {
  fail(`unexpected Firefox host permissions: ${JSON.stringify(manifest.host_permissions)}`);
}
if (manifest.homepage_url !== "https://github.com/MoonlightClarity/Timeless") {
  fail("Firefox homepage URL changed");
}

const csp = manifest.content_security_policy?.extension_pages ?? "";
if (csp.includes("'unsafe-eval'")) fail("ordinary unsafe-eval must not be enabled");

const indexHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(indexHtml)) {
  fail("production index.html contains an inline script");
}
if (/(?:src|href)=["']\/assets\//i.test(indexHtml)) {
  fail("production index.html contains root-absolute asset URLs");
}

const distFiles = walkFiles(dist);
for (const source of distFiles) {
  const relative = path.relative(dist, source);
  const target = path.join(staged, relative);
  if (!fs.existsSync(target)) {
    fail(`Firefox staging is missing Timeless file: ${relative}`);
    continue;
  }
  if (sha256(source) !== sha256(target)) {
    fail(`Firefox staging modified Timeless file: ${relative}`);
  }
}

const expectedWrapperFiles = new Set([
  "manifest.json",
  "background.js",
  "icon-48.png",
  "icon-96.png",
]);
const stagedRelative = walkFiles(staged).map((file) =>
  path.relative(staged, file).replaceAll("\\", "/"),
);
const distRelative = new Set(
  distFiles.map((file) => path.relative(dist, file).replaceAll("\\", "/")),
);
for (const relative of stagedRelative) {
  if (!distRelative.has(relative) && !expectedWrapperFiles.has(relative)) {
    fail(`unexpected Firefox-only staged file: ${relative}`);
  }
}

for (const forbidden of ["node_modules", "dist", ".git", "release", "translation-server"]) {
  if (fs.existsSync(path.join(sourceStage, forbidden))) {
    fail(`reviewer source staging contains forbidden directory: ${forbidden}`);
  }
}

const stagedJs = walkFiles(staged).filter((file) => file.endsWith(".js"));
const stagedText = stagedJs.map((file) => fs.readFileSync(file, "utf8")).join("\n");
if (stagedText.includes("/metadata-translate/")) {
  fail("Firefox bundle still contains the desktop metadata-service endpoint");
}

const maxBytes = 200 * 1024 * 1024;
if (fs.statSync(extensionZip).size > maxBytes) fail("extension ZIP exceeds AMO 200 MB limit");
if (fs.statSync(sourceZip).size > maxBytes) fail("source ZIP exceeds AMO 200 MB limit");

if (!process.exitCode) {
  console.log(
    `firefox release verify: PASS — Timeless ${pkg.version}; ${distFiles.length} app files; no extension permissions; desktop metadata service excluded; source + extension artifacts present`,
  );
}

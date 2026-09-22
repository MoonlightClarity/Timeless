import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, "dist");
const targetSource = path.join(root, "targets", "firefox");
const staging = path.join(root, "release", "firefox");

function fail(message) {
  console.error(`firefox stage: FAIL — ${message}`);
  process.exit(1);
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

if (!fs.existsSync(dist)) fail("dist does not exist; run the Firefox build first");
if (!fs.existsSync(targetSource)) fail("targets/firefox does not exist");

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const manifestTemplate = fs.readFileSync(
  path.join(targetSource, "manifest.template.json"),
  "utf8",
);

fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });
fs.cpSync(dist, staging, { recursive: true });

const manifest = manifestTemplate.replaceAll("__TIMELESS_VERSION__", pkg.version);
fs.writeFileSync(path.join(staging, "manifest.json"), manifest);
fs.copyFileSync(path.join(targetSource, "background.js"), path.join(staging, "background.js"));
fs.copyFileSync(path.join(targetSource, "icon-48.png"), path.join(staging, "icon-48.png"));
fs.copyFileSync(path.join(targetSource, "icon-96.png"), path.join(staging, "icon-96.png"));

const distFiles = walkFiles(dist);
for (const source of distFiles) {
  const relative = path.relative(dist, source);
  const staged = path.join(staging, relative);
  if (!fs.existsSync(staged)) fail(`staged app file missing: ${relative}`);
  if (sha256(source) !== sha256(staged)) fail(`staged app file changed: ${relative}`);
}

console.log(
  `firefox stage: PASS — ${distFiles.length} Timeless app files copied byte-for-byte to release/firefox`,
);

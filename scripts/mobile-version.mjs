import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = {
  app: path.join(root, "apps/mobile/app.json"),
  mobilePackage: path.join(root, "apps/mobile/package.json"),
  lock: path.join(root, "package-lock.json"),
};
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function nextVersion(current, release) {
  const match = current.match(semverPattern);
  if (!match) throw new Error(`Invalid current app version: ${current}`);
  const [, majorText, minorText, patchText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);
  const patch = Number(patchText);

  if (release === "major") return `${major + 1}.0.0`;
  if (release === "minor") return `${major}.${minor + 1}.0`;
  if (release === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error(`Unknown release type: ${release}`);
}

const [command = "check", requestedVersion] = process.argv.slice(2);
const [appJson, mobilePackage, lock] = await Promise.all([
  readJson(files.app),
  readJson(files.mobilePackage),
  readJson(files.lock),
]);
const current = appJson.expo?.version;
if (typeof current !== "string") throw new Error("expo.version is missing from app.json");

if (command === "check") {
  const lockVersion = lock.packages?.["apps/mobile"]?.version;
  const mismatches = [
    mobilePackage.version !== current
      ? `apps/mobile/package.json is ${mobilePackage.version}`
      : null,
    lockVersion !== current ? `package-lock.json is ${lockVersion}` : null,
  ].filter(Boolean);

  if (mismatches.length) {
    throw new Error(`Mobile version mismatch: app.json is ${current}; ${mismatches.join("; ")}`);
  }
  console.log(`FindEat mobile version ${current} is synchronized.`);
  process.exit(0);
}

const next = command === "set" ? requestedVersion : nextVersion(current, command);
if (!next || !semverPattern.test(next)) {
  throw new Error("Provide a version in major.minor.patch format, for example 1.2.0");
}
if (next === current) throw new Error(`FindEat is already at version ${current}`);

appJson.expo.version = next;
mobilePackage.version = next;
if (!lock.packages?.["apps/mobile"]) {
  throw new Error("apps/mobile is missing from package-lock.json");
}
lock.packages["apps/mobile"].version = next;

await Promise.all([
  writeFile(files.app, `${JSON.stringify(appJson, null, 2)}\n`),
  writeFile(files.mobilePackage, `${JSON.stringify(mobilePackage, null, 2)}\n`),
  writeFile(files.lock, `${JSON.stringify(lock, null, 2)}\n`),
]);

console.log(`FindEat mobile version updated: ${current} → ${next}`);

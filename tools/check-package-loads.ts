/* eslint-disable no-console */
// Installs the packed package in a temporary directory and checks that Node can load it through both
// the "import" and the "require" conditions. Run after `npm run dist`.
import { execFileSync, execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-check-package-"));

// execSync goes through a shell, which is needed to start npm(.cmd) on Windows
let npm = (args: string, cwd: string) => execSync(`npm ${args}`, { cwd, encoding: "utf8" });

try {
  let tarball = npm(`pack --silent --pack-destination "${tempDir}"`, root).trim().split("\n").pop();
  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify({ name: "check-package", private: true })
  );
  npm(`install --silent --no-audit --no-fund "./${tarball}"`, tempDir);

  let assertions = [
    'if (typeof createProjector !== "function") throw new Error("createProjector is missing");',
    'if (typeof dom.create !== "function") throw new Error("dom is missing");',
    'if (h("div", ["x"]).vnodeSelector !== "div") throw new Error("h() did not produce a VNode");',
  ];
  let checks: Record<string, string> = {
    "check.mjs": 'import { h, createProjector, dom } from "maquette";',
    "check.cjs": 'const { h, createProjector, dom } = require("maquette");',
  };
  for (let [file, importStatement] of Object.entries(checks)) {
    fs.writeFileSync(path.join(tempDir, file), [importStatement, ...assertions].join("\n"));
    execFileSync(process.execPath, [file], { cwd: tempDir, stdio: "inherit" });
    console.log(`${file}: OK`);
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

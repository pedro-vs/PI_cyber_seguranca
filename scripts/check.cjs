"use strict";
const fs = require("node:fs"), path = require("node:path"), {spawnSync} = require("node:child_process");
const root = path.resolve(__dirname, ".."), extension = path.join(root, "extension");
const manifest = JSON.parse(fs.readFileSync(path.join(extension, "manifest.json")));
const refs = [...manifest.background.scripts, ...manifest.content_scripts.flatMap(c => c.js), manifest.browser_action.default_popup];
for (const file of refs) if (!fs.existsSync(path.join(extension, file))) throw Error(`Arquivo ausente: ${file}`);
function scan(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(?:c?js)$/.test(entry.name)) {
      const result = spawnSync(process.execPath, ["--check", file], {encoding: "utf8"});
      if (result.status) throw Error(result.stderr);
    }
  }
}
for (const folder of ["extension", "scripts", "tests"]) scan(path.join(root, folder));
console.log("Manifest JSON, arquivos referenciados e sintaxe JavaScript: OK. Não substitui o carregamento no Firefox.");

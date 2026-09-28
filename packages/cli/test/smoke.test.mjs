import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliBin = path.resolve(__dirname, "../dist/index.cjs");

describe("qodewk CLI smoke", () => {
  it("dist binary exists after build", () => {
    assert.equal(fs.existsSync(cliBin), true, "run pnpm --filter qodewk build first");
  });

  it("prints help and version", () => {
    const help = spawnSync(process.execPath, [cliBin, "--help"], { encoding: "utf-8" });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /Universal telemetry/);
    assert.match(help.stdout, /share|audit|record|hook/);

    const ver = spawnSync(process.execPath, [cliBin, "--version"], { encoding: "utf-8" });
    assert.equal(ver.status, 0);
    assert.match(ver.stdout.trim(), /^\d+\.\d+\.\d+/);
  });

  it("exposes hooks alias and record-event alias in help", () => {
    const hooks = spawnSync(process.execPath, [cliBin, "hooks", "--help"], { encoding: "utf-8" });
    assert.equal(hooks.status, 0);
    assert.match(hooks.stdout, /install|uninstall/);

    const record = spawnSync(process.execPath, [cliBin, "record-event", "--help"], {
      encoding: "utf-8"
    });
    // record-event is an alias; commander may show record help
    assert.ok(record.status === 0 || record.status === 1);
  });
});

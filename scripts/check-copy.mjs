// Enforces the machine-checkable writing rules in CLAUDE.md: no em dash and no emoji in any
// text file git tracks or would track. Run from the repo root: npm run check:copy
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const TEXT_FILE = /\.(ts|tsx|js|mjs|cjs|css|md|json|yml|yaml|rules|html)$/;
const SKIPPED = new Set(["package-lock.json"]);
// Vendored third-party text: not our writing, and editing it would break the next update.
const VENDORED = [".claude/skills/impeccable/"];

// These suites test how the code handles emoji in user text, so they need real ones.
const EMOJI_ALLOWED = new Set([
  "apps/web/src/lib/upload/normalize.test.ts",
  "apps/web/src/utils/icsGenerator.test.ts",
]);

const EM_DASH = /\u2014/;
// Extended_Pictographic also covers the copyright, registered and trademark signs, which are
// ordinary typography (the landing footer's copyright line).
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;

// Tracked files plus new ones not yet added, so a file is checked before its first commit.
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(
    (file) =>
      TEXT_FILE.test(file) &&
      !SKIPPED.has(file.split("/").pop()) &&
      !VENDORED.some((dir) => file.startsWith(dir)) &&
      existsSync(file),
  );

const problems = [];
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (EM_DASH.test(line)) problems.push(`${file}:${index + 1}: em dash`);
    if (!EMOJI_ALLOWED.has(file) && EMOJI.test(line)) {
      problems.push(`${file}:${index + 1}: emoji`);
    }
  });
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s). The writing rules are in CLAUDE.md.`);
  process.exit(1);
}
console.log(`check:copy: ${files.length} files, no em dash or emoji.`);

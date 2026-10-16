import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors `paths` in tsconfig.json
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // The rules suite needs the Firestore emulator: `npm run test:rules` (vitest.rules.config.ts)
    exclude: [...configDefaults.exclude, "src/rules/**"],
    // Every suite runs once per zone, so a date test can't pass by matching the host's clock.
    // Toronto has DST (the Mar 8 and Nov 1, 2026 switches); Kolkata is UTC+5:30 with none.
    // Node applies TZ when it is assigned at runtime, which is how `env` reaches each worker;
    // the zone checks at the top of utils/dateUtils.test.ts prove it took effect.
    projects: [
      { extends: true, test: { name: "toronto", env: { TZ: "America/Toronto" } } },
      { extends: true, test: { name: "kolkata", env: { TZ: "Asia/Kolkata" } } },
    ],
  },
});

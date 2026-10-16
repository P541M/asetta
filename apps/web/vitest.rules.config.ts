import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The Firestore rules suite (`npm run test:rules`): it needs the Firestore emulator, so `npm test`
// leaves it out. One run, no zones: the rules don't read the clock beyond request.time.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/rules/**/*.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});

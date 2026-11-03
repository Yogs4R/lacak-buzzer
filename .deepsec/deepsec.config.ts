import { defineConfig } from "deepsec/config";
import { generatedMatchersPlugin } from "./generated-matchers.js";

export default defineConfig({
  ai: {"mode":"local","provider":"local"}, // <deepsec:model-route>
  projects: [
    { id: "lacak-buzzer", root: ".." },
    // <deepsec:projects-insert-above>
  ],
  plugins: [generatedMatchersPlugin],
});

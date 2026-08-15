import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

const icons = { 16: "icon/16.png", 32: "icon/32.png", 48: "icon/48.png" };
const useExistingBrowser = process.env.LEVY_MANUAL_BROWSER === "true";
// Keep WXT's development browser state between runs without touching the
// user's regular Chrome profile.
const chromeProfile = resolve(".output/levy-chrome-profile");
mkdirSync(chromeProfile, { recursive: true });

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  webExt: {
    disabled: useExistingBrowser,
    chromiumProfile: chromeProfile,
    keepProfileChanges: true,
  },
  manifest: ({ browser }) => ({
    name: "Levy",
    description:
      "A focused, cross-browser reading experience in your side-panel.",
    permissions: ["storage", "tabs"],
    ...(browser === "firefox"
      ? {
          browser_action: {
            default_icon: icons,
            default_title: "Toggle Levy",
          },
        }
      : {
          action: {
            default_icon: icons,
            default_title: "Toggle Levy",
          },
        }),
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});

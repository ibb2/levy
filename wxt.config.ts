import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

const icons = { 16: "icon/16.png", 32: "icon/32.png", 48: "icon/48.png" };
const useExistingBrowser = process.env.LEVY_MANUAL_BROWSER === "true";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  webExt: {
    disabled: useExistingBrowser,
  },
  manifest: ({ browser }) => ({
    name: "Levy",
    description:
      "A focused, cross-browser reading experience in your side-panel.",
    permissions: ["storage", "tabs", "tts"],
    host_permissions: [
      "http://localhost:8080/*",
      "http://127.0.0.1:8080/*",
    ],
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

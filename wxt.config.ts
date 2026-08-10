import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

const icons = { 16: "icon/16.png", 32: "icon/32.png", 48: "icon/48.png" };

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
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

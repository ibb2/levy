import { browser } from "wxt/browser";
import type { ArticleDocument, PlayerMessage } from "@/shared/types";

// interface BrowserWithSidebar {
//   sidebarAction?: {
//     toggle(): Promise<void>;
//   };
// }

export default defineBackground(() => {
  // if (false) {
  //   browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  // } else {
  //   const { sidebarAction } = browser as typeof browser & BrowserWithSidebar;
  //   if (sidebarAction) {
  //     browser.browserAction.onClicked.addListener(() => sidebarAction.toggle());
  //   }
  // }

  let articleCache: ArticleDocument | null = null;

  const extensionAction = browser.action ?? browser.browserAction;

  extensionAction.onClicked.addListener((tab) => {
    if (tab.id === undefined) return;

    const message: PlayerMessage = { type: "TOGGLE_PLAYER" };
    browser.tabs.sendMessage(tab.id, message).catch((err) =>
      console.log("Player is not available on this page:", err),
    );
  });

  browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.type === "ARTICLE_LOADED") {
        articleCache =
          articleCache !== message.article
            ? ((message.article as ArticleDocument | null) ?? null)
            : articleCache;
      }

      if (articleCache !== null && articleCache !== undefined) {
        console.log("article, ", articleCache);

        if (message.command === "Play") {
          browser.tts.stop();
          browser.tts.speak(
            articleCache?.textContent,
            { lang: "en-US" },
            () => {
              if (browser.runtime.lastError) {
                console.error("Error: ", browser.runtime.lastError.message);
              }
            },
          );
        }

        if (message.command === "Pause" && (await browser.tts.isSpeaking())) {
          console.log("Pause message received");
          browser.tts.pause();
        }
      }
  });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab.id === undefined) return;

    browser.tabs
      .sendMessage(tab.id, { type: "TAB_CHANGED" })
      .catch(() => {
        // Browser-internal pages do not run Levy's content script.
      });
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
      browser.tabs
        .sendMessage(tabId, { type: "TAB_UPDATED", url: tab.url })
        .catch((err) =>
          console.log("Content script not ready yet or injected:", err),
        );
    }
  });
});

import { browser } from "wxt/browser";
import type { ArticleDocument, PlayerMessage } from "@/shared/types";
import { generateSpeech } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const orpheus = createOpenAI({
  name: "orpheus-fastapi",
  baseURL: "http://localhost:5005/v1",
  apiKey: "not-empty",
});

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
          const tabId = sender.tab?.id;
          if (tabId === undefined) return;

          try {
            const speech = await generateSpeech({
              model: orpheus.speech("orpheus"),
              text: articleCache.textContent.slice(0, 999),
              voice: "jess",
              outputFormat: "wav",
            });

            const playbackMessage: PlayerMessage = {
              type: "PLAY_AUDIO",
              audio: speech.audio.base64,
              contentType: speech.audio.mediaType || "audio/mpeg",
            };
            await browser.tabs.sendMessage(tabId, playbackMessage);
          } catch (error) {
            console.error("Unable to generate or play speech:", error);
          }
        }

        if (message.command === "Pause") {
          const tabId = sender.tab?.id;
          if (tabId === undefined) return;

          const pauseMessage: PlayerMessage = { type: "PAUSE_AUDIO" };
          await browser.tabs.sendMessage(tabId, pauseMessage);
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

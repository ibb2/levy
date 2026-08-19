import { browser } from "wxt/browser";
import type { PlayerMessage } from "@/shared/types";

const localAiModel =
  import.meta.env.VITE_LOCALAI_TTS_MODEL || "mlx-community/Kokoro-82M-bf16";
const localAiTtsUrl = "http://localhost:8000/v1/audio/speech";

const encodeBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const step = 32_768;
  for (let offset = 0; offset < bytes.length; offset += step) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + step));
  }
  return btoa(binary);
};

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

  const extensionAction = browser.action ?? browser.browserAction;

  extensionAction.onClicked.addListener((tab) => {
    if (tab.id === undefined) return;

    const message: PlayerMessage = { type: "TOGGLE_PLAYER" };
    browser.tabs.sendMessage(tab.id, message).catch((err) =>
      console.log("Player is not available on this page:", err),
    );
  });

  browser.runtime.onMessage.addListener(
    (message: PlayerMessage) => {
      if (message.type === "PLAY_FALLBACK_TTS") {
        browser.tts.stop();
        browser.tts.speak(message.text, { lang: "en-US" });
      }
      if (message.type === "PAUSE_FALLBACK_TTS") {
        browser.tts.pause();
      }
      if (message.type === "STOP_FALLBACK_TTS") {
        browser.tts.stop();
      }
    },
  );

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== "LOCALAI_TTS") return;

    const controller = new AbortController();
    port.onDisconnect.addListener(() => controller.abort());
    port.onMessage.addListener((message) => {
      if (message.type !== "START_STREAM") return;

      void (async () => {
        try {
          const requestSpeech = (stream: boolean) =>
            fetch(localAiTtsUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: message.text,
                model: localAiModel,
                response_format: "wav",
                stream: true,
                // voice: "cheerful_female",
              }),
              signal: controller.signal,
            });

          let response = await requestSpeech(true);
          if (response.status === 500) {
            const errorBody = await response.clone().text();
            if (errorBody.includes("Unimplemented")) {
              console.warn(
                `${localAiModel} does not support streaming; retrying with ordinary LocalAI TTS.`,
              );
              response = await requestSpeech(false);
            }
          }

          if (!response.ok) {
            throw new Error(
              `LocalAI returned ${response.status} ${response.statusText}.`,
            );
          }
          if (response.body === null) {
            throw new Error("LocalAI did not return a streaming response body.");
          }

          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            port.postMessage({
              type: "AUDIO_CHUNK",
              audio: encodeBase64(value),
            });
          }
          port.postMessage({ type: "STREAM_END" });
        } catch (error) {
          if (controller.signal.aborted) return;
          port.postMessage({
            type: "STREAM_ERROR",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })();
    });
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

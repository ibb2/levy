import { browser } from "wxt/browser";
import type { PlayerMessage } from "@/shared/types";

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

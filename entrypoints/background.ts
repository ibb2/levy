import { browser } from "wxt/browser";

interface BrowserWithSidebar {
  sidebarAction?: {
    toggle(): Promise<void>;
  };
}

export default defineBackground(() => {
  if (browser.sidePanel) {
    void browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) =>
        console.error("Unable to enable side panel action:", error),
      );
  } else {
    const { sidebarAction } = browser as typeof browser & BrowserWithSidebar;
    if (sidebarAction) {
      browser.browserAction.onClicked.addListener(() => {
        void sidebarAction
          .toggle()
          .catch((error) => console.error("Unable to toggle sidebar:", error));
      });
    }
  }

  browser.tabs.onActivated.addListener((activeInfo) => {
    void browser.tabs
      .sendMessage(activeInfo.tabId, { type: "TAB_CHANGED" })
      .catch((error) =>
        console.debug(
          "Content script is unavailable in the active tab:",
          error,
        ),
      );
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
      void browser.tabs
        .sendMessage(tabId, { type: "TAB_UPDATED", url: tab.url })
        .catch((error) =>
          console.debug(
            "Content script is unavailable in the updated tab:",
            error,
          ),
        );
    }
  });
});

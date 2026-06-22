const SAVE_MENU_ID = "save-selection-as-flashcard";

chrome.runtime.onInstalled.addListener(setupContextMenu);
chrome.runtime.onStartup.addListener(setupContextMenu);

function setupContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: SAVE_MENU_ID,
      title: 'Save "%s" as flashcard',
      contexts: ["selection"]
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== SAVE_MENU_ID || !tab?.id) {
    return;
  }

  const selectedText = normalizeSelection(info.selectionText);

  if (!selectedText) {
    return;
  }

  openEditorInTab(tab.id, selectedText);
});

function normalizeSelection(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 120) : "";
}

function openEditorInTab(tabId, word) {
  sendOpenEditorMessage(tabId, word, async (messageError) => {
    if (!messageError) {
      return;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["contentScript.js"]
      });

      sendOpenEditorMessage(tabId, word, (retryError) => {
        if (retryError) {
          console.info("Flashcard editor is unavailable on this page:", retryError.message);
        }
      });
    } catch (error) {
      console.info("Could not inject flashcard editor on this page:", error.message);
    }
  });
}

function sendOpenEditorMessage(tabId, word, callback) {
  chrome.tabs.sendMessage(
    tabId,
    {
      type: "FLASHCARD_OPEN_EDITOR",
      payload: { word }
    },
    () => {
      callback(chrome.runtime.lastError || null);
    }
  );
}

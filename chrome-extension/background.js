// Background script for AllMyTab Chrome Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("AllMyTab extension installed");

    // Set default settings
    chrome.storage.sync.set({
      allmytab_url: "https://allmytab.com",
      auto_focus_address_bar: true,
    });

    // Open welcome page
    chrome.tabs.create({
      url: "https://allmytab.com",
    });
  } else if (details.reason === "update") {
    console.log("AllMyTab extension updated");
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "focusAddressBar":
      focusAddressBar();
      break;
    case "getSettings":
      getSettings().then(sendResponse);
      return true; // Keep message channel open for async response
    case "saveSettings":
      saveSettings(request.settings).then(sendResponse);
      return true;
    case "openAllMyTab":
      openAllMyTab();
      break;
  }
});

// Focus the address bar in the current tab
async function focusAddressBar() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab && tab.url.startsWith("chrome://newtab/")) {
      // Send message to the newtab page to focus address bar
      chrome.tabs.sendMessage(tab.id, { action: "focusAddressBar" });
    }
  } catch (error) {
    console.error("Error focusing address bar:", error);
  }
}

// Get extension settings
async function getSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      "allmytab_url",
      "auto_focus_address_bar",
    ]);
    return settings;
  } catch (error) {
    console.error("Error getting settings:", error);
    return {};
  }
}

// Save extension settings
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set(settings);
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, error: error.message };
  }
}

// Open AllMyTab in a new tab
function openAllMyTab() {
  chrome.tabs.create({
    url: "https://allmytab.com",
  });
}

// Handle tab updates to auto-focus address bar on new tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url.startsWith("chrome://newtab/")
  ) {
    // Get settings to check if auto-focus is enabled
    chrome.storage.sync.get(["auto_focus_address_bar"]).then((settings) => {
      if (settings.auto_focus_address_bar !== false) {
        setTimeout(() => {
          focusAddressBar();
        }, 500);
      }
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "focus-address-bar":
      focusAddressBar();
      break;
    case "open-allmytab":
      openAllMyTab();
      break;
  }
});

// Handle context menu (if needed in future)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-allmytab") {
    openAllMyTab();
  }
});

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-allmytab",
    title: "Open AllMyTab",
    contexts: ["page"],
  });
});

// Handle alarms (for periodic tasks if needed)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "update-check") {
    // Check for updates or perform maintenance tasks
    console.log("Performing periodic update check");
  }
});

// Create alarm for periodic tasks
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("update-check", {
    delayInMinutes: 60,
    periodInMinutes: 1440, // 24 hours
  });
});

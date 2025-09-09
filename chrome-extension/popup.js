// Popup script for AllMyTab Chrome Extension

document.addEventListener("DOMContentLoaded", function () {
  // Initialize popup
  loadSettings();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(["auto_focus_address_bar"]);

    // Set toggle states
    const autoFocusToggle = document.getElementById("autoFocusToggle");

    autoFocusToggle.classList.toggle(
      "active",
      settings.auto_focus_address_bar !== false
    );
  } catch (error) {
    console.error("Error loading settings:", error);
    showStatus("Error loading settings", "error");
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toggle switches
  document
    .getElementById("autoFocusToggle")
    .addEventListener("click", function () {
      toggleSetting("auto_focus_address_bar", this);
    });

  // Action buttons
  document
    .getElementById("openAllMyTab")
    .addEventListener("click", openAllMyTab);
  document
    .getElementById("focusAddressBar")
    .addEventListener("click", focusAddressBar);
  document
    .getElementById("reloadExtension")
    .addEventListener("click", reloadExtension);
}

// Toggle a setting
async function toggleSetting(settingName, toggleElement) {
  try {
    const isActive = toggleElement.classList.contains("active");
    const newValue = !isActive;

    await chrome.storage.sync.set({ [settingName]: newValue });
    toggleElement.classList.toggle("active", newValue);

    showStatus("Setting saved", "success");

    // Send message to background script if needed
    chrome.runtime.sendMessage({
      action: "settingChanged",
      setting: settingName,
      value: newValue,
    });
  } catch (error) {
    console.error("Error saving setting:", error);
    showStatus("Error saving setting", "error");
  }
}

// Open AllMyTab website
function openAllMyTab() {
  chrome.tabs.create({
    url: "https://allmytab.com",
  });
  window.close();
}

// Focus address bar
async function focusAddressBar() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab) {
      await chrome.runtime.sendMessage({ action: "focusAddressBar" });
      showStatus("Address bar focused", "success");
    }
  } catch (error) {
    console.error("Error focusing address bar:", error);
    showStatus("Error focusing address bar", "error");
  }
}

// Reload extension
function reloadExtension() {
  chrome.runtime.reload();
  window.close();
}

// Show status message
function showStatus(message, type = "") {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;

  // Clear status after 3 seconds
  setTimeout(() => {
    statusElement.textContent = "";
    statusElement.className = "status";
  }, 3000);
}

// Handle keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Escape to close popup
  if (e.key === "Escape") {
    window.close();
  }

  // Enter to open AllMyTab
  if (e.key === "Enter" && e.ctrlKey) {
    openAllMyTab();
  }
});

// Check if extension is working properly
async function checkExtensionStatus() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab && tab.url.startsWith("chrome://newtab/")) {
      showStatus("Extension is active on new tab", "success");
    } else {
      showStatus("Open a new tab to see AllMyTab", "");
    }
  } catch (error) {
    console.error("Error checking extension status:", error);
  }
}

// Check status when popup opens
checkExtensionStatus();

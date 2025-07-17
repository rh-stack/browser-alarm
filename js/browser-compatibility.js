/**
 * Universal browser compatibility layer
 * Detects browser and provides unified API access for Chrome and Firefox
 */

// Detect browser environment
// Check for Firefox-specific APIs to distinguish from Chrome
const isFirefox = typeof browser !== 'undefined' && typeof InstallTrigger !== 'undefined';
const isChrome = typeof chrome !== 'undefined' && typeof browser === 'undefined';

// Create unified API object
let extensionAPI;

if (isFirefox) {
  // Firefox uses browser API with native promises
  extensionAPI = {
    ...browser,
    // Ensure storage methods are properly wrapped for Firefox
    storage: {
      local: {
        get: async (keys) => {
          try {
            const result = await browser.storage.local.get(keys);
            return result;
          } catch (error) {
            console.error('Firefox storage.get error:', error);
            throw error;
          }
        },
        set: async (items) => {
          try {
            const result = await browser.storage.local.set(items);
            return result;
          } catch (error) {
            console.error('Firefox storage.set error:', error);
            throw error;
          }
        },
        remove: (keys) => browser.storage.local.remove(keys),
        clear: () => browser.storage.local.clear()
      }
    }
  };
} else if (isChrome) {
  // Chrome uses chrome API, ensure promise compatibility
  extensionAPI = {
    ...chrome,
    storage: {
      local: {
        get: (keys) => chrome.storage.local.get(keys),
        set: (items) => chrome.storage.local.set(items),
        remove: (keys) => chrome.storage.local.remove(keys),
        clear: () => chrome.storage.local.clear()
      }
    },
    alarms: {
      create: (name, alarmInfo) => chrome.alarms.create(name, alarmInfo),
      clear: (name) => chrome.alarms.clear(name),
      clearAll: () => chrome.alarms.clearAll(),
      get: (name) => chrome.alarms.get(name),
      getAll: () => chrome.alarms.getAll(),
      onAlarm: chrome.alarms.onAlarm
    },
    runtime: {
      ...chrome.runtime,
      getURL: (path) => chrome.runtime.getURL(path),
      sendMessage: (message) => chrome.runtime.sendMessage(message),
      onMessage: chrome.runtime.onMessage,
      onInstalled: chrome.runtime.onInstalled,
      onStartup: chrome.runtime.onStartup
    },
    tabs: {
      create: (createProperties) => chrome.tabs.create(createProperties),
      query: (queryInfo) => chrome.tabs.query(queryInfo),
      update: (tabId, updateProperties) => chrome.tabs.update(tabId, updateProperties),
      getCurrent: () => chrome.tabs.getCurrent(),
      remove: (tabId) => chrome.tabs.remove(tabId)
    }
  };
} else {
  console.error('Unsupported browser environment');
  extensionAPI = {};
}

// Export for use in other modules (if in module context)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extensionAPI, isFirefox, isChrome };
}

// Global assignment for regular script context (HTML pages)
if (typeof window !== 'undefined') {
  window.extensionAPI = extensionAPI;
  window.isFirefox = isFirefox;
  window.isChrome = isChrome;
}

// For service worker context (Chrome MV3) - use globalThis instead of self
if (typeof globalThis !== 'undefined' && typeof window === 'undefined') {
  globalThis.extensionAPI = extensionAPI;
  globalThis.isFirefox = isFirefox;
  globalThis.isChrome = isChrome;
}

console.log(`Browser compatibility layer loaded for: ${isFirefox ? 'Firefox' : 'Chrome'}`);

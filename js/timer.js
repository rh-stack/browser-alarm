// Browser compatibility layer is loaded via HTML script tag

window.addEventListener('DOMContentLoaded', async () => {
  const { theme } = await loadSettings();
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.add('theme-loaded');
  initializeTimerNotification();
});

/**
 * Loads the saved theme from storage
 */
async function loadSettings() {
  try {
    const result = await extensionAPI.storage.local.get([window.STORAGE_KEYS.THEME]);
    return { theme: result[window.STORAGE_KEYS.THEME] || 'green' };
  } catch (error) {
    console.error('Error loading theme:', error);
    return { theme: 'green' };
  }
}

/**
 * Initialize timer notification
 */
function initializeTimerNotification() {
  const params = new URLSearchParams(window.location.search);
  const duration = params.get('duration') || '';
  const label = params.get('label') || '';
  
  const durationElement = document.getElementById('timer-duration');
  const labelElement = document.getElementById('timer-label');
  
  if (durationElement) durationElement.textContent = duration;
  if (labelElement) labelElement.textContent = label;
  
  const closeButton = document.getElementById('thanks-btn');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.closeTab();
    });
  }
}
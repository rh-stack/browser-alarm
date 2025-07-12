// Shared notification functionality loaded via script tags
// Initialize timer notification page
window.addEventListener('DOMContentLoaded', async () => {
  // Load and apply theme as quickly as possible
  const theme = await loadTheme();
  document.documentElement.setAttribute('data-theme', theme);
  
  // Show page after theme is applied
  document.body.classList.add('theme-loaded');
  
  // Initialize notification (timer duration doesn't need format conversion)
  initializeTimerNotification();
});

/**
 * Loads the saved theme from storage
 */
async function loadTheme() {
  try {
    const result = await chrome.storage.local.get([window.STORAGE_KEYS.THEME]);
    return result[window.STORAGE_KEYS.THEME] || 'green';
  } catch (error) {
    console.error('Error loading theme:', error);
    return 'green';
  }
}

/**
 * Initialize timer notification
 */
function initializeTimerNotification() {
  const params = new URLSearchParams(window.location.search);
  const duration = params.get('duration') || '';
  const label = params.get('label') || '';
  
  // Update display elements (duration doesn't need clock format conversion)
  const durationElement = document.getElementById('timer-duration');
  const labelElement = document.getElementById('timer-label');
  
  if (durationElement) durationElement.textContent = duration;
  if (labelElement) labelElement.textContent = label;
  
  // Setup close button
  const closeButton = document.getElementById('thanks-btn');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.closeTab();
    });
  }
}
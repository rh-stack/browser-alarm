window.addEventListener('DOMContentLoaded', async () => {
  const { theme, clockFormat } = await loadSettings();
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.add('theme-loaded');
  initializeAlarmNotification(clockFormat);
});

/**
 * Loads the saved theme and clock format from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get([
      window.STORAGE_KEYS.THEME,
      window.STORAGE_KEYS.CLOCK_FORMAT
    ]);
    return {
      theme: result[window.STORAGE_KEYS.THEME] || 'green',
      clockFormat: result[window.STORAGE_KEYS.CLOCK_FORMAT] || '24'
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      theme: 'green',
      clockFormat: '24'
    };
  }
}

/**
 * Initialize alarm notification with clock format support
 */
function initializeAlarmNotification(clockFormat) {
  const params = new URLSearchParams(window.location.search);
  const time = params.get('time') || '';
  const label = params.get('label') || '';
  
  let displayTime = time;
  if (clockFormat === '12' && time) {
    displayTime = window.format24to12Hour(time);
  }
  
  const timeElement = document.getElementById('alarm-time');
  const labelElement = document.getElementById('alarm-label');
  
  if (timeElement) timeElement.textContent = displayTime;
  if (labelElement) labelElement.textContent = label;
  
  const closeButton = document.getElementById('thanks-btn');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.closeTab();
    });
  }
}

/**
 * Shared notification handler for alarm and timer notifications
 * Provides common functionality for closing notification tabs
 */

/**
 * Initializes notification page with common functionality
 * @param {Object} config - Configuration object
 * @param {string} config.timeElementId - ID of element to display time/duration
 * @param {string} config.labelElementId - ID of element to display label
 * @param {string} config.buttonId - ID of the close/thanks button
 * @param {string} config.timeParam - URL parameter name for time value
 * @param {string} config.labelParam - URL parameter name for label value
 */
window.initializeNotification = function(config) {
  const params = new URLSearchParams(window.location.search);
  const time = params.get(config.timeParam) || '';
  const label = params.get(config.labelParam) || '';
  
  // Update display elements
  const timeElement = document.getElementById(config.timeElementId);
  const labelElement = document.getElementById(config.labelElementId);
  
  if (timeElement) timeElement.textContent = time;
  if (labelElement) labelElement.textContent = label;
  
  // Setup close button
  const closeButton = document.getElementById(config.buttonId);
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.closeTab();
    });
  }
}

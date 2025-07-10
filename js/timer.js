// Shared notification functionality loaded via script tags
// Initialize timer notification page
window.addEventListener('DOMContentLoaded', () => {
  window.initializeNotification({
    timeElementId: 'timer-duration',
    labelElementId: 'timer-label',
    buttonId: 'thanks-btn',
    timeParam: 'duration',
    labelParam: 'label'
  });
});
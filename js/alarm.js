// Shared notification functionality loaded via script tags
// Initialize alarm notification page
window.addEventListener('DOMContentLoaded', () => {
  window.initializeNotification({
    timeElementId: 'alarm-time',
    labelElementId: 'alarm-label',
    buttonId: 'thanks-btn',
    timeParam: 'time',
    labelParam: 'label'
  });
});

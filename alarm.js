// alarm.js
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const time = params.get('time') || '';
  const label = params.get('label') || '';
  document.getElementById('alarm-time').textContent = time;
  document.getElementById('alarm-label').textContent = label;

  document.getElementById('thanks-btn').addEventListener('click', async () => {
    // Close this tab
    if (chrome.tabs) {
      const tab = await chrome.tabs.getCurrent();
      if (tab && tab.id) {
        chrome.tabs.remove(tab.id);
      } else {
        window.close();
      }
    } else {
      window.close();
    }
  });
});

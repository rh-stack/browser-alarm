window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const duration = params.get('duration') || '';
  const label = params.get('label') || '';
  document.getElementById('timer-duration').textContent = duration;
  document.getElementById('timer-label').textContent = label;
  document.getElementById('thanks-btn').addEventListener('click', async () => {

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
// Storage keys
const STORAGE_KEYS = {
  ALARMS: 'alarms',
  TIMERS: 'timers'
};

// DOM elements
let currentTimeEl, systemUptimeEl, activeCountEl;
let alarmsCountEl, timersCountEl, alarmsListEl, timersListEl;
let newAlarmTimeEl, newAlarmLabelEl, addAlarmBtnEl;
let newTimerMinutesEl, newTimerLabelEl, addTimerBtnEl;

// State
let alarms = [];
let timers = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  setupEventListeners();
  await loadData();
  updateUI();
  startTimeUpdates();
  setDefaultAlarmTime();
});

function initializeElements() {
  currentTimeEl = document.getElementById('current-time');
  activeCountEl = document.getElementById('active-count');

  alarmsCountEl = document.getElementById('alarms-count');
  timersCountEl = document.getElementById('timers-count');
  alarmsListEl = document.getElementById('alarms-list');
  timersListEl = document.getElementById('timers-list');

  newAlarmTimeEl = document.getElementById('new-alarm-time');
  newAlarmLabelEl = document.getElementById('new-alarm-label');
  addAlarmBtnEl = document.getElementById('add-alarm-btn');

  newTimerMinutesEl = document.getElementById('new-timer-minutes');
  newTimerLabelEl = document.getElementById('new-timer-label');
  addTimerBtnEl = document.getElementById('add-timer-btn');

  // Initialize ASCII art dynamic elements
  initializeAsciiElements();
}

function initializeAsciiElements() {
  // Start dynamic ASCII animations
  startSystemIndicatorRotation();
  startProgressBarAnimation();
  startActivityScan();
  startSidePanelAnimations();
  updateStatusMessage('System ready');
}

function setupEventListeners() {
  addAlarmBtnEl.addEventListener('click', addAlarm);
  addTimerBtnEl.addEventListener('click', addTimer);

  // Time input mask for alarm time
  newAlarmTimeEl.addEventListener('input', handleTimeInputMask);
  newAlarmTimeEl.addEventListener('keydown', handleTimeInputKeydown);

  // Numbers only mask for timer minutes
  newTimerMinutesEl.addEventListener('input', handleTimerInputMask);
  newTimerMinutesEl.addEventListener('keydown', handleTimerInputKeydown);

  // Enter key support
  newAlarmLabelEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAlarm();
  });

  newTimerLabelEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTimer();
  });
}

async function loadData() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.ALARMS, STORAGE_KEYS.TIMERS]);
    alarms = result[STORAGE_KEYS.ALARMS] || [];
    timers = result[STORAGE_KEYS.TIMERS] || [];
  } catch (error) {
    console.error('Error loading data:', error);
    alarms = [];
    timers = [];
  }
}

function setDefaultAlarmTime() {
  const now = new Date();
  now.setHours(now.getHours() + 1);

  if (now.getHours() >= 24) {
    now.setHours(23);
    now.setMinutes(59);
  }

  const timeString = now.toTimeString().slice(0, 5);
  newAlarmTimeEl.value = timeString;
}

// Time input mask functions
function handleTimeInputMask(e) {
  let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-digits
  
  // Limit to 4 digits maximum
  if (value.length > 4) {
    value = value.slice(0, 4);
  }
  
  // Format as HH:MM and validate
  if (value.length >= 3) {
    let hours = value.slice(0, 2);
    let minutes = value.slice(2);
    
    // Auto-correct hours (max 23)
    if (parseInt(hours) > 23) {
      hours = '23';
    }
    
    // Auto-correct minutes (max 59)
    if (parseInt(minutes) > 59) {
      minutes = '59';
    }
    
    value = hours + ':' + minutes;
  }
  
  e.target.value = value;
}

function handleTimeInputKeydown(e) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ];
  
  // Allow navigation keys and numbers 0-9
  if (allowedKeys.includes(e.key) || 
      (e.key >= '0' && e.key <= '9')) {
    return;
  }
  
  // Prevent all other keys
  e.preventDefault();
}

// Timer input mask functions
function handleTimerInputMask(e) {
  let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-digits
  
  // Limit to reasonable timer values (999 minutes max)
  if (parseInt(value) > 999) {
    value = '999';
  }
  
  e.target.value = value;
}

function handleTimerInputKeydown(e) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ];
  
  // Allow navigation keys and numbers 0-9
  if (allowedKeys.includes(e.key) || 
      (e.key >= '0' && e.key <= '9')) {
    return;
  }
  
  // Prevent all other keys
  e.preventDefault();
}

function startTimeUpdates() {
  updateTime();
  updateUI(); // Ensure UI updates immediately
  setInterval(() => {
    updateTime();
    updateUI(); // Update UI every second for real-time countdowns
  }, 1000);
}

function updateTime() {
  const now = new Date();
  // Format: DD/MM/YYYY HH:MM:SS
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  currentTimeEl.textContent = `${dateStr} ${timeStr}`;
}

function updateUI() {
  updateCounts();
  renderAlarms();
  renderTimers();
}

function updateCounts() {
  alarmsCountEl.textContent = alarms.length;
  timersCountEl.textContent = timers.length;
  const totalActive = alarms.length + timers.length;
  activeCountEl.textContent = totalActive.toString().padStart(2, '0');
  
  // Update ASCII art based on active count
  updateAsciiArt(totalActive);
}

function updateAsciiArt(activeCount) {
  const systemStatus = document.getElementById('system-status');
  const statusMessage = document.getElementById('status-message');
  const progressBar = document.getElementById('progress-bar');
  const activityIndicator = document.getElementById('activity-indicator');
  
  if (activeCount === 0) {
    systemStatus.style.color = 'hsl(var(--muted-foreground))';
    activeCountEl.classList.remove('has-active');
    updateStatusMessage('System idle');
    updateProgressBar(0);
    updateActivityIndicator(false);
  } else {
    systemStatus.style.color = 'hsl(var(--accent))';
    activeCountEl.classList.add('has-active');
    updateStatusMessage(`${activeCount} active task${activeCount > 1 ? 's' : ''}`);
    updateProgressBar(Math.min(activeCount / 10, 1)); // Max progress at 10 items
    updateActivityIndicator(true);
  }
}

function renderAlarms() {
  if (alarms.length === 0) {
    alarmsListEl.innerHTML = '<div class="empty-state">No alarms configured</div>';
    return;
  }
  alarmsListEl.innerHTML = alarms.map(alarm => createAlarmHTML(alarm)).join('');
  // Add delete listeners after rendering
  document.querySelectorAll('.delete-alarm').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      deleteAlarm(id);
    });
  });
}

function renderTimers() {
  if (timers.length === 0) {
    timersListEl.innerHTML = '<div class="empty-state">No timers running</div>';
    return;
  }
  // Remove finished timers (remaining <= 0)
  const activeTimers = timers.filter(timer => timer.endTime > Date.now());
  if (activeTimers.length === 0) {
    timersListEl.innerHTML = '<div class="empty-state">No timers running</div>';
    return;
  }
  timersListEl.innerHTML = activeTimers.map(timer => createTimerHTML(timer)).join('');
  // Add delete listeners after rendering
  document.querySelectorAll('.delete-timer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      deleteTimer(id);
    });
  });
}

function createAlarmHTML(alarm) {
  const timeLeft = getTimeUntilAlarm(alarm.time, true);
  return `
    <div class="list-item">
      <div class="item-content">
        <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
          <path d="M22 8c0-2.3-.8-4.3-2-6"/>
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
          <path d="M4 2C2.8 3.7 2 5.7 2 8"/>
        </svg>
        <span class="item-time">${alarm.time}</span>
        <span class="item-label">— ${alarm.label}</span>
        ${timeLeft ? `<span class="item-label">(${timeLeft})</span>` : ''}
        ${timeLeft ? `<div class="status-indicator"></div>` : ''}
      </div>
      <button class="button-ghost delete-alarm" data-id="${alarm.id}">×</button>
    </div>
  `;
}

function createTimerHTML(timer) {
  const remaining = Math.max(0, timer.endTime - Date.now());
  const remainingFormatted = formatDuration(remaining, true);
  return `
    <div class="list-item">
      <div class="item-content">
        <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 6v6l4 2"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span class="item-time">${remainingFormatted}</span>
        <span class="item-label">— ${timer.label}</span>
        <div class="status-indicator"></div>
      </div>
      <button class="button-ghost delete-timer" data-id="${timer.id}">×</button>
    </div>
  `;
}



function showError(msg) {
  const el = document.getElementById('error-message');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
    el.textContent = '';
  }, 2500);
}

async function addAlarm() {
  const time = newAlarmTimeEl.value;
  const label = newAlarmLabelEl.value.trim() || 'alarm'; // Default label
  if (!time) {
    showError('Please enter time');
    return;
  }
  if (label.length > 25) {
    showError('Label must be 25 characters or less.');
    return;
  }
  const alarm = {
    id: Date.now().toString(),
    time: time,
    label: label
  };
  alarms.push(alarm);
  await saveAlarms();
  // Schedule alarm
  chrome.runtime.sendMessage({
    type: 'scheduleAlarm',
    alarm: alarm
  });
  newAlarmTimeEl.value = '';
  newAlarmLabelEl.value = '';
  setDefaultAlarmTime();
  updateUI();
}

async function addTimer() {
  const minutes = parseInt(newTimerMinutesEl.value) || 0;
  const label = newTimerLabelEl.value.trim() || 'timer'; // Default label
  if (minutes === 0) {
    showError('Please enter duration');
    return;
  }
  if (label.length > 25) {
    showError('Label must be 25 characters or less.');
    return;
  }
  const durationMs = minutes * 60 * 1000;
  if (durationMs < 30000) {
    showError('Minimum timer duration is 30 seconds.');
    return;
  }
  const timer = {
    id: Date.now().toString(),
    durationMs: durationMs,
    endTime: Date.now() + durationMs,
    label: label
  };
  timers.push(timer);
  await saveTimers();
  // Schedule timer
  chrome.runtime.sendMessage({
    type: 'scheduleTimer',
    timer: timer
  });
  newTimerMinutesEl.value = '';
  newTimerLabelEl.value = '';
  updateUI();
}

async function deleteAlarm(id) {
  alarms = alarms.filter(alarm => alarm.id !== id);
  await saveAlarms();

  chrome.runtime.sendMessage({
    type: 'clearAlarm',
    id: id
  });

  updateUI();
}

async function deleteTimer(id) {
  timers = timers.filter(timer => timer.id !== id);
  await saveTimers();

  chrome.runtime.sendMessage({
    type: 'clearTimer',
    id: id
  });

  updateUI();
}

async function saveAlarms() {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.ALARMS]: alarms });
  } catch (error) {
    console.error('Error saving alarms:', error);
  }
}

async function saveTimers() {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.TIMERS]: timers });
  } catch (error) {
    console.error('Error saving timers:', error);
  }
}

function getTimeUntilAlarm(timeString, showSeconds = false) {
  const now = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  if (alarmTime <= now) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }
  const diff = alarmTime - now;
  const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
  if (showSeconds) {
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
    } else if (minutesLeft > 0) {
      return `${minutesLeft}m ${secondsLeft}s`;
    } else {
      return `${secondsLeft}s`;
    }
  } else {
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    } else {
      return `${minutesLeft}m`;
    }
  }
}

function formatDuration(ms, showSeconds = false) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (showSeconds) {
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  } else {
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}

// ASCII Art Animation Functions
function startSystemIndicatorRotation() {
  const indicators = ['◐', '◑', '◒', '◓'];
  let currentIndex = 0;
  
  setInterval(() => {
    const indicatorEl = document.getElementById('system-indicator');
    if (indicatorEl) {
      indicatorEl.textContent = indicators[currentIndex];
      currentIndex = (currentIndex + 1) % indicators.length;
    }
  }, 500);
}

function startProgressBarAnimation() {
  const chars = ['▓', '▒', '░'];
  let shimmerPosition = 0;
  
  setInterval(() => {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      const totalChars = 38; // Back to main panel size
      let bar = '';
      
      for (let i = 0; i < totalChars; i++) {
        const distanceFromShimmer = Math.abs(i - shimmerPosition);
        if (distanceFromShimmer === 0) {
          bar += '█';
        } else if (distanceFromShimmer <= 2) {
          bar += chars[distanceFromShimmer - 1];
        } else {
          bar += '▓';
        }
      }
      
      progressBar.textContent = bar;
      shimmerPosition = (shimmerPosition + 1) % totalChars;
    }
  }, 100);
}

function startActivityScan() {
  const patterns = [
    '░░░░░░░░░░░░░░░░░░░░░░░░░░', // 26 chars for main panel
    '█░░░░░░░░░░░░░░░░░░░░░░░░░',
    '██░░░░░░░░░░░░░░░░░░░░░░░░',
    '███░░░░░░░░░░░░░░░░░░░░░░░',
    '████░░░░░░░░░░░░░░░░░░░░░░',
    '░████░░░░░░░░░░░░░░░░░░░░░',
    '░░████░░░░░░░░░░░░░░░░░░░░',
    '░░░████░░░░░░░░░░░░░░░░░░░',
    '░░░░████░░░░░░░░░░░░░░░░░░',
    '░░░░░████░░░░░░░░░░░░░░░░░',
    '░░░░░░████░░░░░░░░░░░░░░░░',
    '░░░░░░░████░░░░░░░░░░░░░░░',
    '░░░░░░░░████░░░░░░░░░░░░░░',
    '░░░░░░░░░████░░░░░░░░░░░░░',
    '░░░░░░░░░░████░░░░░░░░░░░░',
    '░░░░░░░░░░░████░░░░░░░░░░░',
    '░░░░░░░░░░░░████░░░░░░░░░░',
    '░░░░░░░░░░░░░████░░░░░░░░░',
    '░░░░░░░░░░░░░░████░░░░░░░░',
    '░░░░░░░░░░░░░░░████░░░░░░░',
    '░░░░░░░░░░░░░░░░████░░░░░░',
    '░░░░░░░░░░░░░░░░░████░░░░░',
    '░░░░░░░░░░░░░░░░░░████░░░░',
    '░░░░░░░░░░░░░░░░░░░████░░',
    '░░░░░░░░░░░░░░░░░░░░████',
    '░░░░░░░░░░░░░░░░░░░░░███',
    '░░░░░░░░░░░░░░░░░░░░░██',
    '░░░░░░░░░░░░░░░░░░░░░░█',
    '░░░░░░░░░░░░░░░░░░░░░░░'
  ];
  
  let currentPattern = 0;
  
  setInterval(() => {
    const activityIndicator = document.getElementById('activity-indicator');
    if (activityIndicator) {
      activityIndicator.textContent = patterns[currentPattern];
      currentPattern = (currentPattern + 1) % patterns.length;
    }
  }, 150);
}

function startSidePanelAnimations() {
  // Left panel - system monitoring
  startUptimeAnimation();
  startResourceMonitoring();
  
  // Right panel - activity log
  startActivityLog();
}

function startUptimeAnimation() {
  const uptimePatterns = ['████', '███░', '██░░', '█░░░', '░░░░', '█░░░', '██░░', '███░'];
  let currentUptime = 0;
  
  setInterval(() => {
    const uptimeBar = document.getElementById('uptime-bar');
    if (uptimeBar) {
      uptimeBar.textContent = uptimePatterns[currentUptime];
      currentUptime = (currentUptime + 1) % uptimePatterns.length;
    }
  }, 800);
}

function startResourceMonitoring() {
  const cpuPatterns = ['█░░░', '██░░', '███░', '████', '███░', '██░░'];
  const memPatterns = ['██░░', '███░', '████', '███░', '██░░', '█░░░'];
  let cpuIndex = 0;
  let memIndex = 0;
  
  setInterval(() => {
    const cpuIndicator = document.getElementById('cpu-indicator');
    const memIndicator = document.getElementById('mem-indicator');
    
    if (cpuIndicator) {
      cpuIndicator.textContent = cpuPatterns[cpuIndex];
      cpuIndex = (cpuIndex + 1) % cpuPatterns.length;
    }
    
    if (memIndicator) {
      memIndicator.textContent = memPatterns[memIndex];
      memIndex = (memIndex + 1) % memPatterns.length;
    }
  }, 1200);
}

function startActivityLog() {
  const logPatterns = [
    ['█████', '███░░', '░░░░░'],
    ['░███░', '█████', '██░░░'],
    ['░░░░░', '░███░', '█████'],
    ['██░░░', '░░░░░', '░███░'],
    ['█████', '██░░░', '░░░░░'],
    ['░███░', '█████', '██░░░']
  ];
  
  let logIndex = 0;
  
  setInterval(() => {
    const logLine1 = document.getElementById('log-line-1');
    const logLine2 = document.getElementById('log-line-2');
    const logLine3 = document.getElementById('log-line-3');
    
    if (logLine1 && logLine2 && logLine3) {
      const currentLog = logPatterns[logIndex];
      logLine1.textContent = currentLog[0];
      logLine2.textContent = currentLog[1];
      logLine3.textContent = currentLog[2];
      logIndex = (logIndex + 1) % logPatterns.length;
    }
  }, 2000);
}

function updateStatusMessage(message) {
  const statusMessageEl = document.getElementById('status-message');
  if (statusMessageEl) {
    statusMessageEl.textContent = message;
  }
}

function updateProgressBar(progress) {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const totalChars = 38; // Back to original main panel size
    const filledChars = Math.floor(progress * totalChars);
    const bar = '█'.repeat(filledChars) + '▓'.repeat(totalChars - filledChars);
    progressBar.textContent = bar;
  }
}

function updateActivityIndicator(active) {
  const activityIndicator = document.getElementById('activity-indicator');
  if (activityIndicator) {
    if (active) {
      activityIndicator.style.animation = 'activityScan 1.5s ease-in-out infinite';
    } else {
      activityIndicator.style.animation = 'none';
      activityIndicator.textContent = '░░░░░░░░░░░░░░░░░░░░░░░░░░'; // 26 characters for main panel
    }
  }
}

// Make functions global for onclick handlers
window.deleteAlarm = deleteAlarm;
window.deleteTimer = deleteTimer;

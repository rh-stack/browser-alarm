// Shared constants and utilities are loaded via script tags
// STORAGE_KEYS, MESSAGE_TYPES, UI_CONSTANTS, ANIMATION_INTERVALS, ASCII_DIMENSIONS available from constants.js
// formatDuration, getTimeUntilAlarm, formatCurrentTime, isValidTime, generateId, getDefaultAlarmTime, isValidLabel available from utils.js

// DOM elements
let currentTimeEl, systemUptimeEl, activeCountEl;
let alarmsCountEl, timersCountEl, alarmsListEl, timersListEl;
let newAlarmTimeEl, newAlarmLabelEl, addAlarmBtnEl;
let newTimerMinutesEl, newTimerLabelEl, addTimerBtnEl;
let settingsBtnEl, backBtnEl, mainScreenEl, settingsScreenEl;
let headerPromptEl;

// State
let alarms = [];
let timers = [];
let currentTheme = 'green';

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

  // Navigation elements
  settingsBtnEl = document.getElementById('settings-btn');
  backBtnEl = document.getElementById('back-btn');
  mainScreenEl = document.getElementById('main-screen');
  settingsScreenEl = document.getElementById('settings-screen');
  headerPromptEl = document.getElementById('header-prompt');

  // Initialize ASCII art dynamic elements
  initializeAsciiElements();
}

function initializeAsciiElements() {
  // Start dynamic ASCII animations
  startSystemIndicatorRotation();
  startProgressBarAnimation();
  startActivityScan();
  startSidePanelAnimations();
  startMatrixRainAnimation();
  updateStatusMessage('System ready');
}

function setupEventListeners() {
  addAlarmBtnEl.addEventListener('click', addAlarm);
  addTimerBtnEl.addEventListener('click', addTimer);

  // Navigation listeners
  settingsBtnEl.addEventListener('click', showSettings);
  backBtnEl.addEventListener('click', showMain);

  // Color theme listeners
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const theme = option.dataset.theme;
      changeTheme(theme);
    });
  });

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
    const result = await chrome.storage.local.get([
      window.STORAGE_KEYS.ALARMS, 
      window.STORAGE_KEYS.TIMERS,
      window.STORAGE_KEYS.THEME
    ]);
    alarms = result[window.STORAGE_KEYS.ALARMS] || [];
    timers = result[window.STORAGE_KEYS.TIMERS] || [];
    currentTheme = result[window.STORAGE_KEYS.THEME] || 'green';
    
    // Apply saved theme
    applyTheme(currentTheme);
  } catch (error) {
    console.error('Error loading data:', error);
    alarms = [];
    timers = [];
    currentTheme = 'green';
  }
}

/**
 * Sets the default alarm time to current time + 1 hour
 */
function setDefaultAlarmTime() {
  newAlarmTimeEl.value = window.getDefaultAlarmTime();
}

/**
 * Handles time input formatting and validation
 * @param {Event} e - Input event
 */
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

/**
 * Handles keydown events for time input to allow only valid keys
 * @param {KeyboardEvent} e - Keydown event
 */
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

/**
 * Handles timer input formatting to allow only numbers
 * @param {Event} e - Input event
 */
function handleTimerInputMask(e) {
  let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-digits
  
  // Limit to reasonable timer values (999 minutes max)
  if (parseInt(value) > window.UI_CONSTANTS.MAX_TIMER_MINUTES) {
    value = window.UI_CONSTANTS.MAX_TIMER_MINUTES.toString();
  }
  
  e.target.value = value;
}

/**
 * Handles keydown events for timer input to allow only valid keys
 * @param {KeyboardEvent} e - Keydown event
 */
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

/**
 * Starts time and UI updates with consistent intervals
 */
function startTimeUpdates() {
  updateTime();
  updateUI(); // Ensure UI updates immediately
  setInterval(() => {
    updateTime();
    updateUI(); // Update UI every second for real-time countdowns
  }, window.window.ANIMATION_INTERVALS.TIME_UPDATE);
}

/**
 * Updates the current time display
 */
function updateTime() {
  currentTimeEl.textContent = window.formatCurrentTime();
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
  const timeLeft = window.getTimeUntilAlarm(alarm.time, true);
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
  const remainingFormatted = window.formatDuration(remaining, true);
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



/**
 * Shows an error message to the user
 * @param {string} msg - Error message to display
 */
function showError(msg) {
  const el = document.getElementById('error-message');
  if (!el) {
    console.error('Error element not found:', msg);
    return;
  }
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
    el.textContent = '';
  }, 2500);
}

/**
 * Adds a new alarm with validation
 */
async function addAlarm() {
  const time = newAlarmTimeEl.value;
  const label = newAlarmLabelEl.value.trim() || 'alarm'; // Default label
  
  // Validation
  if (!time || !window.isValidTime(time)) {
    showError('Please enter a valid time (HH:MM)');
    return;
  }
  
  if (!window.isValidLabel(label, window.UI_CONSTANTS.MAX_LABEL_LENGTH)) {
    showError(`Label must be ${window.UI_CONSTANTS.MAX_LABEL_LENGTH} characters or less.`);
    return;
  }
  
  const alarm = {
    id: window.generateId(),
    time: time,
    label: label
  };
  
  alarms.push(alarm);
  await saveAlarms();
  
  // Schedule alarm
  chrome.runtime.sendMessage({
    type: window.MESSAGE_TYPES.SCHEDULE_ALARM,
    alarm: alarm
  });
  
  // Reset form
  newAlarmTimeEl.value = '';
  newAlarmLabelEl.value = '';
  setDefaultAlarmTime();
  updateUI();
}

/**
 * Adds a new timer with validation
 */
async function addTimer() {
  const minutes = parseInt(newTimerMinutesEl.value) || 0;
  const label = newTimerLabelEl.value.trim() || 'timer'; // Default label
  
  // Validation
  if (minutes === 0) {
    showError('Please enter duration');
    return;
  }
  
  if (!window.isValidLabel(label, window.UI_CONSTANTS.MAX_LABEL_LENGTH)) {
    showError(`Label must be ${window.UI_CONSTANTS.MAX_LABEL_LENGTH} characters or less.`);
    return;
  }
  
  const durationMs = minutes * 60 * 1000;
  if (durationMs < window.UI_CONSTANTS.MIN_TIMER_DURATION_MS) {
    showError('Minimum timer duration is 30 seconds.');
    return;
  }
  
  const timer = {
    id: window.generateId(),
    durationMs: durationMs,
    endTime: Date.now() + durationMs,
    label: label
  };
  
  timers.push(timer);
  await saveTimers();
  
  // Schedule timer
  chrome.runtime.sendMessage({
    type: window.MESSAGE_TYPES.SCHEDULE_TIMER,
    timer: timer
  });
  
  // Reset form
  newTimerMinutesEl.value = '';
  newTimerLabelEl.value = '';
  updateUI();
}

/**
 * Deletes an alarm by ID
 * @param {string} id - Alarm ID to delete
 */
async function deleteAlarm(id) {
  alarms = alarms.filter(alarm => alarm.id !== id);
  await saveAlarms();

  chrome.runtime.sendMessage({
    type: window.MESSAGE_TYPES.CLEAR_ALARM,
    id: id
  });

  updateUI();
}

/**
 * Deletes a timer by ID
 * @param {string} id - Timer ID to delete
 */
async function deleteTimer(id) {
  timers = timers.filter(timer => timer.id !== id);
  await saveTimers();

  chrome.runtime.sendMessage({
    type: window.MESSAGE_TYPES.CLEAR_TIMER,
    id: id
  });

  updateUI();
}

/**
 * Saves alarms to Chrome storage with error handling
 */
async function saveAlarms() {
  try {
    await chrome.storage.local.set({ [window.STORAGE_KEYS.ALARMS]: alarms });
  } catch (error) {
    console.error('Error saving alarms:', error);
    showError('Failed to save alarm. Please try again.');
  }
}

/**
 * Saves timers to Chrome storage with error handling
 */
async function saveTimers() {
  try {
    await chrome.storage.local.set({ [window.STORAGE_KEYS.TIMERS]: timers });
  } catch (error) {
    console.error('Error saving timers:', error);
    showError('Failed to save timer. Please try again.');
  }
}

// Removed duplicate getTimeUntilAlarm function - now imported from utils.js

// Removed duplicate formatDuration function - now imported from utils.js

// ASCII Art Animation Functions
/**
 * Starts the rotating system indicator animation
 */
function startSystemIndicatorRotation() {
  const indicators = ['◐', '◑', '◒', '◓'];
  let currentIndex = 0;
  
  setInterval(() => {
    const indicatorEl = document.getElementById('system-indicator');
    if (indicatorEl) {
      indicatorEl.textContent = indicators[currentIndex];
      currentIndex = (currentIndex + 1) % indicators.length;
    }
  }, window.ANIMATION_INTERVALS.SYSTEM_INDICATOR);
}

/**
 * Starts the progress bar shimmer animation
 */
function startProgressBarAnimation() {
  const chars = ['▓', '▒', '░'];
  let shimmerPosition = 0;
  
  setInterval(() => {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      const totalChars = window.ASCII_DIMENSIONS.MAIN_PANEL_CHARS;
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
  }, window.ANIMATION_INTERVALS.PROGRESS_BAR);
}

/**
 * Starts the activity scanning animation
 */
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
  }, window.ANIMATION_INTERVALS.ACTIVITY_SCAN);
}

function startSidePanelAnimations() {
  // Left panel - system monitoring
  startUptimeAnimation();
  startResourceMonitoring();
  
  // Right panel - activity log
  startActivityLog();
}

/**
 * Starts the uptime bar animation
 */
function startUptimeAnimation() {
  const uptimePatterns = ['████', '███░', '██░░', '█░░░', '░░░░', '█░░░', '██░░', '███░'];
  let currentUptime = 0;
  
  setInterval(() => {
    const uptimeBar = document.getElementById('uptime-bar');
    if (uptimeBar) {
      uptimeBar.textContent = uptimePatterns[currentUptime];
      currentUptime = (currentUptime + 1) % uptimePatterns.length;
    }
  }, window.ANIMATION_INTERVALS.UPTIME);
}

/**
 * Starts the resource monitoring animation
 */
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
  }, window.ANIMATION_INTERVALS.RESOURCE_MONITOR);
}

/**
 * Starts the activity log animation
 */
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
  }, window.ANIMATION_INTERVALS.ACTIVITY_LOG);
}

function updateStatusMessage(message) {
  const statusMessageEl = document.getElementById('status-message');
  if (statusMessageEl) {
    statusMessageEl.textContent = message;
  }
}

/**
 * Updates the progress bar display
 * @param {number} progress - Progress value between 0 and 1
 */
function updateProgressBar(progress) {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const totalChars = window.ASCII_DIMENSIONS.MAIN_PANEL_CHARS;
    const filledChars = Math.floor(progress * totalChars);
    const bar = '█'.repeat(filledChars) + '▓'.repeat(totalChars - filledChars);
    progressBar.textContent = bar;
  }
}

/**
 * Updates the activity indicator animation state
 * @param {boolean} active - Whether to show active animation
 */
function updateActivityIndicator(active) {
  const activityIndicator = document.getElementById('activity-indicator');
  if (activityIndicator) {
    if (active) {
      activityIndicator.style.animation = 'activityScan 1.5s ease-in-out infinite';
    } else {
      activityIndicator.style.animation = 'none';
      activityIndicator.textContent = '░'.repeat(window.ASCII_DIMENSIONS.ACTIVITY_INDICATOR_CHARS);
    }
  }
}

// Navigation Functions
/**
 * Shows the settings screen
 */
function showSettings() {
  mainScreenEl.style.display = 'none';
  settingsScreenEl.style.display = 'block';
  
  // Update header for settings
  headerPromptEl.textContent = '┌─[settings@config]─[~]';
  backBtnEl.style.display = 'flex';
  settingsBtnEl.style.display = 'none';
  
  updateActiveThemeIndicator();
}

/**
 * Shows the main screen
 */
function showMain() {
  settingsScreenEl.style.display = 'none';
  mainScreenEl.style.display = 'block';
  
  // Update header for main screen
  headerPromptEl.textContent = '┌─[alarm@timer]─[~]';
  backBtnEl.style.display = 'none';
  settingsBtnEl.style.display = 'flex';
}

// Theme Functions
/**
 * Changes the app theme
 * @param {string} theme - Theme name ('green', 'blue', 'amber', 'purple', 'red')
 */
async function changeTheme(theme) {
  currentTheme = theme;
  applyTheme(theme);
  updateActiveThemeIndicator();
  
  // Save theme to storage
  try {
    await chrome.storage.local.set({ [window.STORAGE_KEYS.THEME]: theme });
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

/**
 * Applies the theme to the document
 * @param {string} theme - Theme name
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Updates the active theme indicator in settings
 */
function updateActiveThemeIndicator() {
  document.querySelectorAll('.color-option').forEach(option => {
    if (option.dataset.theme === currentTheme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

// Matrix Rain Animation
/**
 * Starts the matrix-style falling characters animation
 */
function startMatrixRainAnimation() {
  const matrixChars = ['0', '1', '█', '▓', '▒', '░', '◆', '◇', '▲', '▼', '◀', '▶'];
  const rainElements = [
    document.getElementById('matrix-rain'),
    document.getElementById('matrix-rain-2'),
    document.getElementById('matrix-rain-3'),
    document.getElementById('matrix-rain-4')
  ];
  
  // Generate different patterns for each line
  const patterns = rainElements.map(() => generateMatrixPattern());
  
  function updateMatrixRain() {
    rainElements.forEach((element, index) => {
      if (element) {
        // Shift pattern and add new character at the beginning
        patterns[index] = [getRandomMatrixChar()].concat(patterns[index].slice(0, -1));
        element.textContent = patterns[index].join('');
      }
    });
  }
  
  function generateMatrixPattern() {
    const patternLength = 55;
    return Array(patternLength).fill().map(() => getRandomMatrixChar());
  }
  
  function getRandomMatrixChar() {
    return matrixChars[Math.floor(Math.random() * matrixChars.length)];
  }
  
  // Start the animation
  setInterval(updateMatrixRain, window.ANIMATION_INTERVALS.MATRIX_RAIN);
}

// Make functions global for onclick handlers
window.deleteAlarm = deleteAlarm;
window.deleteTimer = deleteTimer;

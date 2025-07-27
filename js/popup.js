// Browser compatibility layer is loaded via HTML script tag

let currentTimeEl, activeCountEl;
let alarmsCountEl, timersCountEl, alarmsListEl, timersListEl;
let newAlarmTimeEl, newAlarmLabelEl, addAlarmBtnEl;
let newTimerMinutesEl, newTimerLabelEl, addTimerBtnEl;
let settingsBtnEl, backBtnEl, mainScreenEl, settingsScreenEl;
let headerPromptEl;

let alarms = [];
let timers = [];
let currentTheme = 'green';
let clockFormat = '24';

document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  setupEventListeners();
  await loadData();
  updateUI();
  startTimeUpdates();
  setDefaultAlarmTime();
  updateAlarmInputFormat();
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

  settingsBtnEl = document.getElementById('settings-btn');
  backBtnEl = document.getElementById('back-btn');
  mainScreenEl = document.getElementById('main-screen');
  settingsScreenEl = document.getElementById('settings-screen');
  headerPromptEl = document.getElementById('header-prompt');

  initializeAsciiElements();
}

function initializeAsciiElements() {
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

  // Pomodoro button event listener
  const pomodoroBtnEl = document.getElementById('pomodoro-btn');
  if (pomodoroBtnEl) {
    pomodoroBtnEl.addEventListener('click', startPomodoro);
  }

  settingsBtnEl.addEventListener('click', showSettings);
  backBtnEl.addEventListener('click', showMain);

  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const theme = option.dataset.theme;
      changeTheme(theme);
    });
  });

  newAlarmTimeEl.addEventListener('input', handleTimeInputMask);
  newAlarmTimeEl.addEventListener('keydown', handleTimeInputKeydown);

  newTimerMinutesEl.addEventListener('input', handleTimerInputMask);
  newTimerMinutesEl.addEventListener('keydown', handleTimerInputKeydown);

  newAlarmLabelEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAlarm();
  });

  newTimerLabelEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTimer();
  });

  const donateButton = document.querySelector('.donate-button');
  if (donateButton) {
    donateButton.addEventListener('click', (e) => {
      e.preventDefault();
      // Use window.open instead of tabs API
      window.open(window.EXTERNAL_LINKS.DONATE_URL, '_blank');
    });
  }

  document.querySelectorAll('.clock-format-option').forEach(option => {
    option.addEventListener('click', () => {
      const format = option.dataset.format;
      changeClockFormat(format);
    });
  });
}

async function loadData() {
  try {
    const result = await extensionAPI.storage.local.get([
      window.STORAGE_KEYS.ALARMS, 
      window.STORAGE_KEYS.TIMERS,
      window.STORAGE_KEYS.THEME,
      window.STORAGE_KEYS.CLOCK_FORMAT
    ]);
    
    alarms = result[window.STORAGE_KEYS.ALARMS] || [];
    timers = result[window.STORAGE_KEYS.TIMERS] || [];
    currentTheme = result[window.STORAGE_KEYS.THEME] || 'green';
    clockFormat = result[window.STORAGE_KEYS.CLOCK_FORMAT] || '24';

    applyTheme(currentTheme);
    updateActiveThemeIndicator();
    updateActiveClockFormatIndicator();
    updateAlarmInputFormat();
  } catch (error) {
    console.error('Error loading data:', error);
    alarms = [];
    timers = [];
    currentTheme = 'green';
    clockFormat = '24';

    applyTheme(currentTheme);
    updateActiveThemeIndicator();
    updateActiveClockFormatIndicator();
    updateAlarmInputFormat();
  }
}

/**
 * Sets the default alarm time to current time + 1 hour
 */
function setDefaultAlarmTime() {
  newAlarmTimeEl.value = window.getDefaultAlarmTime(clockFormat);
}

/**
 * Parses time input and returns formatted 12-hour time components
 * @param {string} input - Raw input string
 * @returns {object} Parsed time components
 */
function parseTimeInput12Hour(input) {
  const cleanInput = input.toUpperCase().replace(/[^0-9APM:\s]/g, '');
  
  let ampm = '';
  if (cleanInput.includes('AM')) ampm = 'AM';
  else if (cleanInput.includes('PM')) ampm = 'PM';
  else if (cleanInput.includes('A') && !cleanInput.includes('M')) ampm = 'AM';
  else if (cleanInput.includes('P') && !cleanInput.includes('M')) ampm = 'PM';

  const timeOnly = cleanInput.replace(/\s*(AM|PM|A|P)\s*/g, '');
  const allDigits = timeOnly.replace(/[^\d]/g, '');
  const hasColon = timeOnly.includes(':');
  
  return { timeOnly, allDigits, hasColon, ampm };
}

/**
 * Formats parsed time components into display format
 * @param {object} parsed - Parsed time components
 * @returns {string} Formatted time string
 */
function formatTime12Hour(parsed) {
  const { timeOnly, allDigits, hasColon, ampm } = parsed;
  
  if (allDigits.length === 0) {
    return '';
  }
  
  let formattedTime = '';

  if (allDigits.length === 1) {
    formattedTime = allDigits;
  } else if (allDigits.length === 2) {
    const num = parseInt(allDigits);
    if (num > 12 && !hasColon) {
      formattedTime = `${allDigits[0]}:${allDigits[1]}`;
    } else if (!hasColon) {
      formattedTime = `${allDigits}:`;
    } else {
      formattedTime = allDigits;
    }
  } else if (allDigits.length === 3) {
    if (ampm || hasColon) {
      const h = parseInt(allDigits[0]) || 12;
      const m = Math.min(parseInt(allDigits.slice(1)), 59);
      formattedTime = `${h}:${m.toString().padStart(2, '0')}`;
    } else {
      formattedTime = allDigits;
    }
  } else if (allDigits.length >= 4) {
    let hours, minutes;
    
    if (allDigits[0] === '0') {
      hours = parseInt(allDigits[1]) || 12;
      minutes = parseInt(allDigits.slice(2, 4));
    } else {
      const firstTwo = parseInt(allDigits.slice(0, 2));
      if (firstTwo > 12) {
        hours = parseInt(allDigits[0]);
        minutes = parseInt(allDigits.slice(1, 3));
      } else {
        hours = firstTwo;
        minutes = parseInt(allDigits.slice(2, 4));
      }
    }
    
    if (hours === 0) hours = 12;
    if (hours > 12) hours = 12;
    if (minutes > 59) minutes = 59;
    
    formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if (hasColon) {
    const parts = timeOnly.split(':');
    const hourPart = parts[0].replace(/[^\d]/g, '');
    const minutePart = parts[1] ? parts[1].replace(/[^\d]/g, '') : '';
    
    if (hourPart) {
      let h = parseInt(hourPart);
      if (h === 0) h = 12;
      if (h > 12) h = 12;
      
      formattedTime = h.toString();
      
      if (parts.length > 1) { 
        formattedTime += ':';
        if (minutePart) {
          const m = Math.min(parseInt(minutePart), 59);
          formattedTime += m.toString().padStart(2, '0');
        } else if (timeOnly.endsWith(':')) {
        }
      }
    }
  }
  
  if (formattedTime && ampm) {
    formattedTime += ` ${ampm}`;
  }
  
  return formattedTime;
}

/**
 * Handles time input formatting and validation
 * @param {Event} e - Input event
 */
function handleTimeInputMask(e) {
  if (clockFormat === '12') {
    const currentValue = e.target.value;
    const previousValue = e.target.getAttribute('data-prev-value') || '';
    const isDeleting = currentValue.length < previousValue.length;
    
    if (isDeleting) {
      const cleaned = currentValue.toUpperCase().replace(/[^0-9APM:\s]/g, '');
      e.target.value = cleaned;
      e.target.setAttribute('data-prev-value', cleaned);
      return;
    }
    
    const parsed = parseTimeInput12Hour(currentValue);
    const formatted = formatTime12Hour(parsed);
    
    e.target.value = formatted;
    e.target.setAttribute('data-prev-value', formatted);
  } else {
    const currentValue = e.target.value;
    const previousValue = e.target.getAttribute('data-prev-value') || '';
    const isDeleting = currentValue.length < previousValue.length;
    
    if (isDeleting && previousValue.includes(':') && currentValue.includes(':')) {
      e.target.setAttribute('data-prev-value', currentValue);
      return;
    }
    
    if (isDeleting && previousValue.includes(':') && !currentValue.includes(':')) {
      e.target.value = currentValue.replace(/[^\d]/g, '');
      e.target.setAttribute('data-prev-value', e.target.value);
      return;
    }
    
    let value = currentValue.replace(/[^\d]/g, '');
 
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    if (isDeleting && value.length === 2) {
      e.target.value = value;
    } else if (value.length === 2 && !isDeleting) {
      let hours = parseInt(value);
      if (hours > 23) {
        hours = 23;
        value = hours.toString().padStart(2, '0');
      }
      value = value + ':';
      e.target.value = value;
    } else if (value.length >= 3) {
      let hours = value.slice(0, 2);
      let minutes = value.slice(2);
      
      if (parseInt(hours) > 23) {
        hours = '23';
      }
      
      if (parseInt(minutes) > 59) {
        minutes = '59';
      }
      
      value = hours + ':' + minutes;
      e.target.value = value;
    } else {
      e.target.value = value;
    }
    
    e.target.setAttribute('data-prev-value', e.target.value);
  }
}

/**
 * Handles keydown events for time input to allow only valid keys
 * @param {KeyboardEvent} e - Keydown event
 */
function handleTimeInputKeydown(e) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'
  ];
  
  if (e.ctrlKey && e.key === 'a') {
    return;
  }
  
  if (e.key === 'Enter') {
    e.preventDefault();
    addAlarm();
    return;
  }
  
  // Simple fix: prevent default backspace behavior, let input handler manage it
  if (e.key === 'Backspace' && clockFormat === '24') {
    return;
  }
  
  if (clockFormat === '12' && (e.key === 'a' || e.key === 'A' || e.key === 'p' || e.key === 'P')) {
    e.preventDefault();
    toggleAmPm(e.target, e.key.toUpperCase());
    return;
  }
  
  if (allowedKeys.includes(e.key) || 
      (e.key >= '0' && e.key <= '9') ||
      e.key === ':') {
    return;
  }
  
  if (clockFormat === '12' && (e.key === 'm' || e.key === 'M')) {
    return;
  }
  
  e.preventDefault();
}

/**
 * Handles timer input formatting to allow only numbers
 * @param {Event} e - Input event
 */
function handleTimerInputMask(e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  
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
  if (e.key === 'Enter') {
    e.preventDefault();
    addTimer();
    return;
  }
  
  if (e.ctrlKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    e.target.select();
    return;
  }
  
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ];
  
  if (allowedKeys.includes(e.key) || 
      (e.key >= '0' && e.key <= '9')) {
    return;
  }
  
  e.preventDefault();
}

/**
 * Starts time and UI updates with consistent intervals
 */
function startTimeUpdates() {
  let lastTimeText = '';
  let lastUIUpdate = 0;
  
  function update() {
    const currentTimeText = window.formatCurrentTime(clockFormat);

    if (currentTimeText !== lastTimeText) {
      currentTimeEl.textContent = currentTimeText;
      lastTimeText = currentTimeText;
    }
    
    const now = Date.now();
    if (now - lastUIUpdate >= 1000) { // updating UI once a 1 second
      updateUI();
      lastUIUpdate = now;
    }
  }
  
  update();
  
  setInterval(update, window.ANIMATION_INTERVALS.TIME_UPDATE);
}

/**
 * Updates the current time display
 */
function updateTime() {
  currentTimeEl.textContent = window.formatCurrentTime(clockFormat);
}

function updateUI() {
  updateCounts();
  renderAlarms();
  renderTimers();
}

function updateCounts() {
  const activeTimers = timers.filter(timer => timer.endTime > Date.now());
  
  alarmsCountEl.textContent = alarms.length;
  timersCountEl.textContent = activeTimers.length;
  const totalActive = alarms.length + activeTimers.length;
  activeCountEl.textContent = totalActive.toString().padStart(2, '0');
  
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
    updateProgressBar(Math.min(activeCount / 10, 1));
    updateActivityIndicator(true);
  }
}

function renderAlarms() {
  if (alarms.length === 0) {
    alarmsListEl.textContent = 'No alarms configured';
    alarmsListEl.className = 'empty-state';
    return;
  }
  
  // Clear existing content safely
  alarmsListEl.innerHTML = '';
  alarmsListEl.className = '';
  
  const sortedAlarms = [...alarms].sort((a, b) => {
    const now = new Date();
    const [hoursA, minutesA] = a.time.split(':').map(Number);
    const [hoursB, minutesB] = b.time.split(':').map(Number);
    
    const alarmTimeA = new Date();
    alarmTimeA.setHours(hoursA, minutesA, 0, 0);
    if (alarmTimeA <= now) {
      alarmTimeA.setDate(alarmTimeA.getDate() + 1);
    }
    
    const alarmTimeB = new Date();
    alarmTimeB.setHours(hoursB, minutesB, 0, 0);
    if (alarmTimeB <= now) {
      alarmTimeB.setDate(alarmTimeB.getDate() + 1);
    }
    
    return alarmTimeA - alarmTimeB;
  });
  
  // Create elements safely using DOM methods
  sortedAlarms.forEach(alarm => {
    const alarmElement = createAlarmElement(alarm);
    alarmsListEl.appendChild(alarmElement);
  });
}

function renderTimers() {
  const now = Date.now();
  const activeTimers = timers.filter(timer => timer.endTime > now);

  if (activeTimers.length !== timers.length) {
    timers = activeTimers;
    saveTimers();
  }
  
  if (activeTimers.length === 0) {
    timersListEl.textContent = 'No timers running';
    timersListEl.className = 'empty-state';
    return;
  }
  
  // Clear existing content safely
  timersListEl.innerHTML = '';
  timersListEl.className = '';
  
  const sortedTimers = [...activeTimers].sort((a, b) => {
    return a.endTime - b.endTime;
  });

  // Create elements safely using DOM methods
  sortedTimers.forEach(timer => {
    const timerElement = createTimerElement(timer);
    timersListEl.appendChild(timerElement);
  });
}

/**
 * Creates a safe DOM element for an alarm
 * @param {object} alarm - Alarm object
 * @returns {HTMLElement} - Alarm list item element
 */
function createAlarmElement(alarm) {
  const timeLeft = window.getTimeUntilAlarm(alarm.time, true);
  
  let displayTime = alarm.time;
  if (clockFormat === '12') {
    displayTime = window.format24to12Hour(alarm.time);
  }
  
  // Create container
  const listItem = document.createElement('div');
  listItem.className = 'list-item';
  
  // Create content container
  const itemContent = document.createElement('div');
  itemContent.className = 'item-content';
  
  // Create SVG icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'section-icon');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.innerHTML = `
    <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
    <path d="M22 8c0-2.3-.8-4.3-2-6"/>
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
    <path d="M4 2C2.8 3.7 2 5.7 2 8"/>
  `;
  
  // Create time span
  const timeSpan = document.createElement('span');
  timeSpan.className = 'item-time';
  timeSpan.textContent = displayTime;
  
  // Create label span
  const labelSpan = document.createElement('span');
  labelSpan.className = 'item-label';
  labelSpan.textContent = '— ' + alarm.label;
  
  // Append basic elements
  itemContent.appendChild(svg);
  itemContent.appendChild(timeSpan);
  itemContent.appendChild(labelSpan);
  
  // Add time left if available
  if (timeLeft) {
    const timeLeftSpan = document.createElement('span');
    timeLeftSpan.className = 'item-label';
    timeLeftSpan.textContent = '(' + timeLeft + ')';
    itemContent.appendChild(timeLeftSpan);
    
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';
    itemContent.appendChild(statusIndicator);
  }
  
  // Create delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'button-ghost delete-alarm';
  deleteBtn.setAttribute('data-id', alarm.id);
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', () => deleteAlarm(alarm.id));
  
  // Assemble final element
  listItem.appendChild(itemContent);
  listItem.appendChild(deleteBtn);
  
  return listItem;
}

/**
 * Creates a safe DOM element for a timer
 * @param {object} timer - Timer object
 * @returns {HTMLElement} - Timer list item element
 */
function createTimerElement(timer) {
  const remaining = Math.max(0, timer.endTime - Date.now());
  const remainingFormatted = window.formatDuration(remaining, true);
  
  // Create container
  const listItem = document.createElement('div');
  listItem.className = 'list-item';
  
  // Create content container
  const itemContent = document.createElement('div');
  itemContent.className = 'item-content';
  
  // Create SVG icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'item-icon');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.innerHTML = `
    <path d="M12 6v6l4 2"/>
    <circle cx="12" cy="12" r="10"/>
  `;
  
  // Create time span
  const timeSpan = document.createElement('span');
  timeSpan.className = 'item-time';
  timeSpan.textContent = remainingFormatted;
  
  // Create label span
  const labelSpan = document.createElement('span');
  labelSpan.className = 'item-label';
  labelSpan.textContent = '— ' + timer.label;
  
  // Create status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'status-indicator';
  
  // Append elements
  itemContent.appendChild(svg);
  itemContent.appendChild(timeSpan);
  itemContent.appendChild(labelSpan);
  itemContent.appendChild(statusIndicator);
  
  // Create delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'button-ghost delete-timer';
  deleteBtn.setAttribute('data-id', timer.id);
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', () => deleteTimer(timer.id));
  
  // Assemble final element
  listItem.appendChild(itemContent);
  listItem.appendChild(deleteBtn);
  
  return listItem;
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
  const timeInput = newAlarmTimeEl.value;
  const label = newAlarmLabelEl.value.trim() || 'alarm';
  
  let time = timeInput;
  
  if (clockFormat === '12') {
    time = window.convert12to24Hour(timeInput);
    if (!time) {
      showError('Please enter a valid time (H:MM AM/PM)');
      return;
    }
  }
  
  // Validation for 24-hour format
  if (!window.isValidTime(time)) {
    const formatHint = clockFormat === '12' ? '(H:MM AM/PM)' : '(HH:MM)';
    showError(`Please enter a valid time ${formatHint}`);
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

  extensionAPI.runtime.sendMessage({
    type: window.MESSAGE_TYPES.SCHEDULE_ALARM,
    alarm: alarm
  });

  newAlarmTimeEl.value = '';
  newAlarmLabelEl.value = '';
  setDefaultAlarmTime();
  updateUI();
}

/**
 * Starts a 25-minute Pomodoro timer with one click
 */
async function startPomodoro() {
  const pomodoroMinutes = 25;
  const label = 'pomodoro time';
  
  const durationMs = pomodoroMinutes * 60 * 1000;
  const timer = {
    id: window.generateId(),
    durationMs: durationMs,
    endTime: Date.now() + durationMs,
    label: label
  };
  
  timers.push(timer);
  await saveTimers();

  extensionAPI.runtime.sendMessage({
    type: window.MESSAGE_TYPES.SCHEDULE_TIMER,
    timer: timer
  });
  
  updateUI();
}

/**
 * Adds a new timer with validation
 */
async function addTimer() {
  const minutes = parseInt(newTimerMinutesEl.value) || 0;
  const label = newTimerLabelEl.value.trim() || 'timer'; // Default label
  
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
  
  extensionAPI.runtime.sendMessage({
    type: window.MESSAGE_TYPES.SCHEDULE_TIMER,
    timer: timer
  });
  
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

  extensionAPI.runtime.sendMessage({
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

  extensionAPI.runtime.sendMessage({
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
    await extensionAPI.storage.local.set({ [window.STORAGE_KEYS.ALARMS]: alarms });
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
    await extensionAPI.storage.local.set({ [window.STORAGE_KEYS.TIMERS]: timers });
  } catch (error) {
    console.error('Error saving timers:', error);
    showError('Failed to save timer. Please try again.');
  }
}

/**
 * Starts the rotating system indicator animation
 */
function startSystemIndicatorRotation() {
  const indicators = ['◐', '◑', '◒', '◓'];
  let currentIndex = 0;
  
  // Use requestAnimationFrame for smoother animation
  function updateIndicator() {
    const indicatorEl = document.getElementById('system-indicator');
    if (indicatorEl) {
      indicatorEl.textContent = indicators[currentIndex];
      currentIndex = (currentIndex + 1) % indicators.length;
    }
  }

  setInterval(updateIndicator, 800);
}

/**
 * Starts the progress bar shimmer animation
 */
function startProgressBarAnimation() {
  const shimmerStates = [
    '████████████████████████████████████████',
    '███████████████████████████████████████▓',
    '██████████████████████████████████████▓▓',
    '█████████████████████████████████████▓▓▓',
    '████████████████████████████████████▓▓▓▓',
    '███████████████████████████████████▓▓▓▓▓',
    '██████████████████████████████████▓▓▓▓▓▓',
    '█████████████████████████████████▓▓▓▓▓▓▓',
    '████████████████████████████████▓▓▓▓▓▓▓▓',
    '███████████████████████████████▓▓▓▓▓▓▓▓▓',
    '██████████████████████████████▓▓▓▓▓▓▓▓▓▓',
    '█████████████████████████████▓▓▓▓▓▓▓▓▓▓▓'
  ];
  
  let currentState = 0;
  
  setInterval(() => {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      const totalChars = window.ASCII_DIMENSIONS.MAIN_PANEL_CHARS;
      const pattern = shimmerStates[currentState];
      progressBar.textContent = pattern.substring(0, totalChars);
      currentState = (currentState + 1) % shimmerStates.length;
    }
  }, 300);
}

/**
 * Starts the activity scanning animation
 */
function startActivityScan() {
  const patterns = [
    '░░░░░░░░░░░░░░░░░░░░░░░░░░',
    '█░░░░░░░░░░░░░░░░░░░░░░░░░',
    '██░░░░░░░░░░░░░░░░░░░░░░░░',
    '███░░░░░░░░░░░░░░░░░░░░░░░',
    '░███░░░░░░░░░░░░░░░░░░░░░░',
    '░░███░░░░░░░░░░░░░░░░░░░░░',
    '░░░███░░░░░░░░░░░░░░░░░░░░',
    '░░░░███░░░░░░░░░░░░░░░░░░░',
    '░░░░░███░░░░░░░░░░░░░░░░░░',
    '░░░░░░███░░░░░░░░░░░░░░░░░',
    '░░░░░░░███░░░░░░░░░░░░░░░░',
    '░░░░░░░░███░░░░░░░░░░░░░░░',
    '░░░░░░░░░███░░░░░░░░░░░░░░',
    '░░░░░░░░░░███░░░░░░░░░░░░░',
    '░░░░░░░░░░░███░░░░░░░░░░░░',
    '░░░░░░░░░░░░███░░░░░░░░░░░',
    '░░░░░░░░░░░░░███░░░░░░░░░░',
    '░░░░░░░░░░░░░░███░░░░░░░░░',
    '░░░░░░░░░░░░░░░███░░░░░░░░',
    '░░░░░░░░░░░░░░░░███░░░░░░░',
    '░░░░░░░░░░░░░░░░░███░░░░░░',
    '░░░░░░░░░░░░░░░░░░███░░░░░',
    '░░░░░░░░░░░░░░░░░░░███░░░░',
    '░░░░░░░░░░░░░░░░░░░░███░░',
    '░░░░░░░░░░░░░░░░░░░░░███░',
    '░░░░░░░░░░░░░░░░░░░░░░███',
    '░░░░░░░░░░░░░░░░░░░░░░░██',
    '░░░░░░░░░░░░░░░░░░░░░░░░█',
    '░░░░░░░░░░░░░░░░░░░░░░░░░'
  ];
  
  let currentPattern = 0;
  
  setInterval(() => {
    const activityIndicator = document.getElementById('activity-indicator');
    if (activityIndicator) {
      activityIndicator.textContent = patterns[currentPattern];
      currentPattern = (currentPattern + 1) % patterns.length;
    }
  }, 200);
}

function startSidePanelAnimations() {
  startUptimeAnimation();
  startResourceMonitoring();
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
 * @param {number} progress
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

/**
 * Shows the settings screen
 */
function showSettings() {
  mainScreenEl.style.display = 'none';
  settingsScreenEl.style.display = 'block';
  
  headerPromptEl.textContent = '┌─[settings@config]─[~]';
  backBtnEl.style.display = 'flex';
  settingsBtnEl.style.display = 'none';

  const donateButton = document.querySelector('.donate-button');
  if (donateButton) {
    donateButton.style.display = 'flex';
  }
  
  updateActiveThemeIndicator();
  updateActiveClockFormatIndicator();
}

/**
 * Shows the main screen
 */
function showMain() {
  settingsScreenEl.style.display = 'none';
  mainScreenEl.style.display = 'block';

  headerPromptEl.textContent = '┌─[alarm@timer]─[~]';
  backBtnEl.style.display = 'none';
  settingsBtnEl.style.display = 'flex';

  const donateButton = document.querySelector('.donate-button');
  if (donateButton) {
    donateButton.style.display = 'none';
  }
}

/**
 * Changes the app theme
 * @param {string} theme - Theme name ('green', 'blue', 'amber', 'pink', 'red')
 */
async function changeTheme(theme) {
  currentTheme = theme;
  applyTheme(theme);
  updateActiveThemeIndicator();

  try {
    await extensionAPI.storage.local.set({ [window.STORAGE_KEYS.THEME]: theme });
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

/**
 * Changes the app clock format
 * @param {string} format - Clock format ('12' or '24')
 */
async function changeClockFormat(format) {
  clockFormat = format;
  updateActiveClockFormatIndicator();
  setDefaultAlarmTime();
  updateTime();
  renderAlarms();
  
  const alarmTimeInput = document.getElementById('new-alarm-time');
  if (alarmTimeInput) {
    alarmTimeInput.value = '';
  }
  
  try {
    await extensionAPI.storage.local.set({ [window.STORAGE_KEYS.CLOCK_FORMAT]: format });
  } catch (error) {
    console.error('Error saving clock format:', error);
  }
}

/**
 * Updates the active clock format indicator in settings
 */
function updateActiveClockFormatIndicator() {
  const clockFormatOptions = document.querySelectorAll('.clock-format-option');
  
  clockFormatOptions.forEach(option => {
    option.classList.remove('active');
  });
  
  clockFormatOptions.forEach(option => {
    if (option.dataset.format === clockFormat) {
      option.classList.add('active');
    }
  });
  
  updateAlarmInputFormat();
}

/**
 * Updates the alarm input placeholder and format based on clock format
 */
function updateAlarmInputFormat() {
  const alarmTimeInput = document.getElementById('new-alarm-time');
  if (alarmTimeInput) {
    if (clockFormat === '12') {
      alarmTimeInput.placeholder = "H:MM AM/PM (12h format)";
    } else {
      alarmTimeInput.placeholder = "HH:MM (24h format)";
    }
    // Initialize previous value tracking for delete detection
    alarmTimeInput.setAttribute('data-prev-value', alarmTimeInput.value || '');
  }
}

/**
 * Starts the matrix-style left-to-right flowing animation
 */
function startMatrixRainAnimation() {
  const matrixChars = ['0', '1', '█', '▓', '▒', '░', ';', '/', '|', '-', '+', '#'];
  const rainElements = [
    document.getElementById('matrix-rain'),
    document.getElementById('matrix-rain-2'),
    document.getElementById('matrix-rain-3'),
    document.getElementById('matrix-rain-4')
  ];
  
  const patternLength = 67;
  let basePattern = Array(patternLength).fill().map(() => 
    matrixChars[Math.floor(Math.random() * matrixChars.length)]
  ).join('');
  
  let scrollPosition = 0;
  
  function updateMatrixRain() {
    rainElements.forEach((element, index) => {
      if (element) {
        const offset = (patternLength - scrollPosition - index * 15) % patternLength;
        const flowingPattern = basePattern.slice(offset) + basePattern.slice(0, offset);
        element.textContent = flowingPattern;
      }
    });
    
    scrollPosition = (scrollPosition + 2) % patternLength;
    
    if (scrollPosition % 30 === 0) {
      basePattern = Array(patternLength).fill().map(() => 
        matrixChars[Math.floor(Math.random() * matrixChars.length)]
      ).join('');
    }
  }
  
  setInterval(updateMatrixRain, 200);
}

window.deleteAlarm = deleteAlarm;
window.deleteTimer = deleteTimer;

/**
 * Toggles AM/PM in 12-hour format when A or P is pressed
 * @param {HTMLInputElement} input - The time input element
 * @param {string} key - The key pressed ('A' or 'P')
 */
function toggleAmPm(input, key) {
  let value = input.value.toUpperCase();
  
  value = value.replace(/\s*(AM|PM|A|P|M)\s*$/g, '').trim();
  
  if (value) {
    if (key === 'A') {
      value += ' AM';
    } else if (key === 'P') {
      value += ' PM';
    }
  }
  
  input.value = value;
  input.setAttribute('data-prev-value', value);
}

// Load compatibility layer for Chrome MV3 service worker context
if (typeof importScripts !== 'undefined') {
  importScripts('browser-compatibility.js');
}

const STORAGE_KEYS = {
  ALARMS: 'alarms',
  TIMERS: 'timers'
};

const MESSAGE_TYPES = {
  SCHEDULE_ALARM: 'scheduleAlarm',
  CLEAR_ALARM: 'clearAlarm',
  SCHEDULE_TIMER: 'scheduleTimer',
  CLEAR_TIMER: 'clearTimer'
};

const NAME_PREFIXES = {
  ALARM: 'alarm-',
  TIMER: 'timer-'
};

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Safely encodes a string for URL parameters
 * @param {string} str - String to encode
 * @returns {string} URL-encoded string
 */
function safeEncodeURIComponent(str) {
  if (!str || typeof str !== 'string') return '';
  return encodeURIComponent(str);
}

extensionAPI.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed');
  await rehydrateAlarms();
});

extensionAPI.runtime.onStartup.addListener(async () => {
  console.log('Browser started');
  await rehydrateAlarms();
});

extensionAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MESSAGE_TYPES.SCHEDULE_ALARM:
      scheduleAlarm(message.alarm);
      break;
    case MESSAGE_TYPES.CLEAR_ALARM:
      clearAlarm(message.id);
      break;
    case MESSAGE_TYPES.SCHEDULE_TIMER:
      scheduleTimer(message.timer);
      break;
    case MESSAGE_TYPES.CLEAR_TIMER:
      clearTimer(message.id);
      break;
    default:
      console.warn('Unknown message type:', message.type);
  }
});

extensionAPI.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm fired:', alarm.name);
  
  if (alarm.name.startsWith(NAME_PREFIXES.ALARM)) {
    await handleAlarmFired(alarm.name);
  } else if (alarm.name.startsWith(NAME_PREFIXES.TIMER)) {
    await handleTimerFired(alarm.name);
  }
});

/**
 * Schedules a Chrome alarm for the given alarm object
 * @param {Object} alarm - Alarm configuration object
 * @param {string} alarm.id - Unique alarm identifier
 * @param {string} alarm.time - Time in HH:MM format
 */
async function scheduleAlarm(alarm) {
  const alarmName = `${NAME_PREFIXES.ALARM}${alarm.id}`;
  const [hours, minutes] = alarm.time.split(':').map(Number);
  
  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (alarmTime <= now) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }
  
  try {
    await extensionAPI.alarms.create(alarmName, {
      when: alarmTime.getTime()
    });
    console.log(`Scheduled alarm ${alarmName} for ${alarmTime}`);
  } catch (error) {
    console.error('Error scheduling alarm:', error);
  }
}

/**
 * Schedules a Chrome alarm for the given timer object
 * @param {Object} timer - Timer configuration object
 * @param {string} timer.id - Unique timer identifier
 * @param {number} timer.endTime - End time as timestamp
 */
async function scheduleTimer(timer) {
  const timerName = `${NAME_PREFIXES.TIMER}${timer.id}`;
  
  try {
    await extensionAPI.alarms.create(timerName, {
      when: timer.endTime
    });
    console.log(`Scheduled timer ${timerName} for ${new Date(timer.endTime)}`);
  } catch (error) {
    console.error('Error scheduling timer:', error);
  }
}

/**
 * Clears a Chrome alarm by ID
 * @param {string} id - Alarm identifier
 */
async function clearAlarm(id) {
  const alarmName = `${NAME_PREFIXES.ALARM}${id}`;
  try {
    await extensionAPI.alarms.clear(alarmName);
    console.log(`Cleared alarm ${alarmName}`);
  } catch (error) {
    console.error('Error clearing alarm:', error);
  }
}

/**
 * Clears a Chrome timer by ID
 * @param {string} id - Timer identifier
 */
async function clearTimer(id) {
  const timerName = `${NAME_PREFIXES.TIMER}${id}`;
  try {
    await extensionAPI.alarms.clear(timerName);
    console.log(`Cleared timer ${timerName}`);
  } catch (error) {
    console.error('Error clearing timer:', error);
  }
}

/**
 * Handles alarm fired event and opens notification tab
 * @param {string} alarmName - Name of the fired alarm
 */
async function handleAlarmFired(alarmName) {
  const id = alarmName.replace(NAME_PREFIXES.ALARM, '');
  const result = await extensionAPI.storage.local.get([STORAGE_KEYS.ALARMS]);
  const alarms = result[STORAGE_KEYS.ALARMS] || [];
  const alarm = alarms.find(a => a.id === id);
  
  if (alarm) {
    const url = extensionAPI.runtime.getURL(`alarm.html?id=${id}&time=${alarm.time}&label=${safeEncodeURIComponent(alarm.label)}`);
    await extensionAPI.tabs.create({ url });
    const updatedAlarms = alarms.filter(a => a.id !== id);
    await extensionAPI.storage.local.set({ [STORAGE_KEYS.ALARMS]: updatedAlarms });
  }
}

/**
 * Handles timer fired event and opens notification tab
 * @param {string} timerName - Name of the fired timer
 */
async function handleTimerFired(timerName) {
  const id = timerName.replace(NAME_PREFIXES.TIMER, '');
  const result = await extensionAPI.storage.local.get([STORAGE_KEYS.TIMERS]);
  const timers = result[STORAGE_KEYS.TIMERS] || [];
  const timer = timers.find(t => t.id === id);
  
  if (timer) {
    const duration = formatDuration(timer.durationMs);
    const url = extensionAPI.runtime.getURL(`timer.html?id=${id}&duration=${safeEncodeURIComponent(duration)}&label=${safeEncodeURIComponent(timer.label)}`);
    await extensionAPI.tabs.create({ url });
    const updatedTimers = timers.filter(t => t.id !== id);
    await extensionAPI.storage.local.set({ [STORAGE_KEYS.TIMERS]: updatedTimers });
  }
}

/**
 * Re-schedules all active alarms and timers after browser restart
 */
async function rehydrateAlarms() {
  try {
    const result = await extensionAPI.storage.local.get([STORAGE_KEYS.ALARMS, STORAGE_KEYS.TIMERS]);
    const alarms = result[STORAGE_KEYS.ALARMS] || [];
    const timers = result[STORAGE_KEYS.TIMERS] || [];
    for (const alarm of alarms) {
      if (alarm.enabled !== false) {
        await scheduleAlarm(alarm);
      }
    }

    const now = Date.now();
    for (const timer of timers) {
      if (timer.enabled !== false && timer.endTime > now) { 
        await scheduleTimer(timer);
      }
    }
    
    console.log('Rehydrated alarms and timers');
  } catch (error) {
    console.error('Error rehydrating alarms:', error);
  }
}
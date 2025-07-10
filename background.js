// Storage keys
const STORAGE_KEYS = {
  ALARMS: 'alarms',
  TIMERS: 'timers'
};

// Initialize service worker
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed');
  await rehydrateAlarms();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started');
  await rehydrateAlarms();
});

// Message handling from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'scheduleAlarm':
      scheduleAlarm(message.alarm);
      break;
    case 'clearAlarm':
      clearAlarm(message.id);
      break;
    case 'scheduleTimer':
      scheduleTimer(message.timer);
      break;
    case 'clearTimer':
      clearTimer(message.id);
      break;
  }
});

// Alarm fired handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm fired:', alarm.name);
  
  if (alarm.name.startsWith('alarm-')) {
    await handleAlarmFired(alarm.name);
  } else if (alarm.name.startsWith('timer-')) {
    await handleTimerFired(alarm.name);
  }
});

async function scheduleAlarm(alarm) {
  const alarmName = `alarm-${alarm.id}`;
  const [hours, minutes] = alarm.time.split(':').map(Number);
  
  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (alarmTime <= now) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }
  
  try {
    await chrome.alarms.create(alarmName, {
      when: alarmTime.getTime()
    });
    console.log(`Scheduled alarm ${alarmName} for ${alarmTime}`);
  } catch (error) {
    console.error('Error scheduling alarm:', error);
  }
}

async function scheduleTimer(timer) {
  const timerName = `timer-${timer.id}`;
  
  try {
    await chrome.alarms.create(timerName, {
      when: timer.endTime
    });
    console.log(`Scheduled timer ${timerName} for ${new Date(timer.endTime)}`);
  } catch (error) {
    console.error('Error scheduling timer:', error);
  }
}

async function clearAlarm(id) {
  const alarmName = `alarm-${id}`;
  try {
    await chrome.alarms.clear(alarmName);
    console.log(`Cleared alarm ${alarmName}`);
  } catch (error) {
    console.error('Error clearing alarm:', error);
  }
}

async function clearTimer(id) {
  const timerName = `timer-${id}`;
  try {
    await chrome.alarms.clear(timerName);
    console.log(`Cleared timer ${timerName}`);
  } catch (error) {
    console.error('Error clearing timer:', error);
  }
}

async function handleAlarmFired(alarmName) {
  const id = alarmName.replace('alarm-', '');
  
  // Get alarm details from storage
  const result = await chrome.storage.local.get([STORAGE_KEYS.ALARMS]);
  const alarms = result[STORAGE_KEYS.ALARMS] || [];
  const alarm = alarms.find(a => a.id === id);
  
  if (alarm) {
    // Open notification tab
    const url = chrome.runtime.getURL(`alarm.html?id=${id}&time=${alarm.time}&label=${encodeURIComponent(alarm.label)}`);
    await chrome.tabs.create({ url });
    // Remove alarm from storage
    const updatedAlarms = alarms.filter(a => a.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.ALARMS]: updatedAlarms });
  }
}

async function handleTimerFired(timerName) {
  const id = timerName.replace('timer-', '');
  
  // Get timer details from storage
  const result = await chrome.storage.local.get([STORAGE_KEYS.TIMERS]);
  const timers = result[STORAGE_KEYS.TIMERS] || [];
  const timer = timers.find(t => t.id === id);
  
  if (timer) {
    const duration = formatDuration(timer.durationMs);
    // Open notification tab
    const url = chrome.runtime.getURL(`timer.html?id=${id}&duration=${encodeURIComponent(duration)}&label=${encodeURIComponent(timer.label)}`);
    await chrome.tabs.create({ url });
    // Remove timer from storage
    const updatedTimers = timers.filter(t => t.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.TIMERS]: updatedTimers });
  }
}

async function rehydrateAlarms() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.ALARMS, STORAGE_KEYS.TIMERS]);
    const alarms = result[STORAGE_KEYS.ALARMS] || [];
    const timers = result[STORAGE_KEYS.TIMERS] || [];
    
    // Re-schedule all active alarms
    for (const alarm of alarms) {
      if (alarm.enabled) {
        await scheduleAlarm(alarm);
      }
    }
    
    // Re-schedule all active timers that haven't expired
    const now = Date.now();
    for (const timer of timers) {
      if (timer.enabled && timer.endTime > now) {
        await scheduleTimer(timer);
      }
    }
    
    console.log('Rehydrated alarms and timers');
  } catch (error) {
    console.error('Error rehydrating alarms:', error);
  }
}

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

/**
 * Shared utility functions for the ASCII Clock extension
 */

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @param {boolean} showSeconds - Whether to show seconds in the output
 * @returns {string} Formatted duration string
 */
window.formatDuration = function(ms, showSeconds = false) {
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
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

/**
 * Calculates time remaining until a specific alarm time
 * @param {string} timeString - Time in HH:MM format
 * @param {boolean} showSeconds - Whether to include seconds in output
 * @returns {string|null} Formatted time remaining or null if invalid
 */
window.getTimeUntilAlarm = function(timeString, showSeconds = false) {
  const now = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
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

/**
 * Formats current time for display
 * @returns {string} Formatted time string (DD/MM/YYYY HH:MM:SS)
 */
window.formatCurrentTime = function() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  return `${dateStr} ${timeStr}`;
}

/**
 * Validates time input in HH:MM format
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if valid time format
 */
window.isValidTime = function(timeString) {
  if (!timeString || typeof timeString !== 'string') return false;
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Generates a unique ID based on timestamp
 * @returns {string} Unique ID string
 */
window.generateId = function() {
  return Date.now().toString();
}

/**
 * Safely closes a browser tab
 * @param {Function} fallbackFunction - Function to call if tab closing fails
 */
window.closeTab = async function(fallbackFunction = () => window.close()) {
  try {
    if (chrome.tabs) {
      const tab = await chrome.tabs.getCurrent();
      if (tab && tab.id) {
        await chrome.tabs.remove(tab.id);
      } else {
        fallbackFunction();
      }
    } else {
      fallbackFunction();
    }
  } catch (error) {
    console.error('Error closing tab:', error);
    fallbackFunction();
  }
}

/**
 * Safely encodes a string for URL parameters
 * @param {string} str - String to encode
 * @returns {string} URL-encoded string
 */
window.safeEncodeURIComponent = function(str) {
  if (!str || typeof str !== 'string') return '';
  return encodeURIComponent(str);
}

/**
 * Creates a default alarm time (current time + 1 hour)
 * @returns {string} Time string in HH:MM format
 */
window.getDefaultAlarmTime = function() {
  const now = new Date();
  now.setHours(now.getHours() + 1);

  if (now.getHours() >= 24) {
    now.setHours(23);
    now.setMinutes(59);
  }

  return now.toTimeString().slice(0, 5);
}

/**
 * Validates label length
 * @param {string} label - Label to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if label is valid length
 */
window.isValidLabel = function(label, maxLength = 25) {
  return typeof label === 'string' && label.length <= maxLength;
}

/**
 * Shared utility functions for the ASCII Clock extension
 */

/**
 * Formats the current time and date for display
 * @param {string} format - Clock format ('12' or '24')
 * @returns {string} Formatted time string (DD/MM/YYYY HH:MM:SS)
 */
window.formatCurrentTime = function(format = '24') {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  
  let timeStr;
  if (format === '12') {
    timeStr = now.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } else {
    timeStr = now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  return `${dateStr} ${timeStr}`;
}

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
 * @param {string} format - Clock format ('12' or '24')
 * @returns {string} Time string in appropriate format
 */
window.getDefaultAlarmTime = function(format = '24') {
  const now = new Date();
  now.setHours(now.getHours() + 1);

  if (now.getHours() >= 24) {
    now.setHours(23);
    now.setMinutes(59);
  }

  if (format === '12') {
    return now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  } else {
    return now.toTimeString().slice(0, 5);
  }
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

/**
 * Converts 12-hour time format to 24-hour format
 * @param {string} timeString - Time in 12-hour format (e.g., "2:30 PM")
 * @returns {string|null} Time in 24-hour format (HH:MM) or null if invalid
 */
window.convert12to24Hour = function(timeString) {
  const time12hRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = timeString.trim().match(time12hRegex);
  
  if (!match) return null;
  
  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts 24-hour time format to 12-hour format for display
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format (H:MM AM/PM)
 */
window.format24to12Hour = function(time24) {
  if (!time24 || !time24.includes(':')) return time24;
  
  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours);
  
  if (hour24 === 0) {
    return `12:${minutes} AM`;
  } else if (hour24 < 12) {
    return `${hour24}:${minutes} AM`;
  } else if (hour24 === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour24 - 12}:${minutes} PM`;
  }
}

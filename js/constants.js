/**
 * Shared constants for the ASCII Clock extension
 */

// Storage keys for Chrome storage API
window.STORAGE_KEYS = {
  ALARMS: 'alarms',
  TIMERS: 'timers',
  THEME: 'theme'
};

// UI Constants
window.UI_CONSTANTS = {
  MAX_LABEL_LENGTH: 25,
  MIN_TIMER_DURATION_MS: 30000, // 30 seconds
  MAX_TIMER_MINUTES: 999,
  DEFAULT_ALARM_OFFSET_HOURS: 1
};

// Message types for Chrome runtime messaging
window.MESSAGE_TYPES = {
  SCHEDULE_ALARM: 'scheduleAlarm',
  CLEAR_ALARM: 'clearAlarm',
  SCHEDULE_TIMER: 'scheduleTimer',
  CLEAR_TIMER: 'clearTimer'
};

// Alarm/Timer name prefixes
window.NAME_PREFIXES = {
  ALARM: 'alarm-',
  TIMER: 'timer-'
};

// Animation timing constants
window.ANIMATION_INTERVALS = {
  SYSTEM_INDICATOR: 500,
  PROGRESS_BAR: 100,
  ACTIVITY_SCAN: 150,
  UPTIME: 800,
  RESOURCE_MONITOR: 1200,
  ACTIVITY_LOG: 2000,
  TIME_UPDATE: 1000,
  MATRIX_RAIN: 200
};

// ASCII art dimensions
window.ASCII_DIMENSIONS = {
  MAIN_PANEL_CHARS: 38,
  ACTIVITY_INDICATOR_CHARS: 26,
  SIDE_PANEL_CHARS: 4
};

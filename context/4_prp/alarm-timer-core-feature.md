# Metarules. Core Principles
1. Follow all the rules in [ai agent rules](../1_ai_agent_rules.md)
2. Follow UI from the files in the [UI reference](../1_ui_reference) folder
3. Use patterns and keywords from the codebase

## Name: 
Alarm & Timer Core Feature

## Description
A fully-MV3 Chrome Extension popup that lets users create, view, toggle, and delete Alarms and Timers in a terminal-style UI. When an alarm or timer fires, a new tab opens showing only a "Hey, it's …" message and a "Thanks" button that closes the tab and cleans up state.

## Goal
End-to-end implementation of Alarm and Timer functionality:
- Persistent storage of user-configured alarms/timers
- Scheduling via `chrome.alarms`
- Popup UI matching the TerminalApp design exactly
- Notification pages on alarm/timer firing
- Robust handling of edge cases (sleep, browser restart, MV3 service worker unload)

## Why
- Business value: lightweight time-management tool right in user's browser toolbar
- Integration: builds on the existing TerminalApp UI reference to provide consistent experience
- Problems this feature solves: common pitfalls around MV3 alarms persistence, device sleep handling, and state rehydration for users who need simple time management

## What
User-visible behavior:
- Popup with two main sections (default: Alarms; alternative: Timers)
- Forms for adding new Alarm (HH:MM + label) or Timer (hours:minutes + label)
- Lists showing time left until each Alarm/Timer fires
- Toggle on/off per item
- Delete per item
- When an item fires → open dedicated tab with message and "Thanks" button

Technical requirements:
- Manifest V3: background service worker
- Permissions: `alarms`, `storage`, `tabs`, `activeTab`
- State in `chrome.storage.local`
- Scheduling via `chrome.alarms.create({ name, when })`
- On startup/installation, rehydrate storage and re-schedule missing alarms
- Handle `chrome.alarms.onAlarm` in service worker
- Dedicated HTML/JS notification pages for Alarm and Timer

## Success Criteria
- [ ] Users can add, toggle, delete Alarms and Timers in popup
- [ ] State persists across popup open/close, browser restart
- [ ] Alarms fire at the correct time (taking device sleep into account)
- [ ] Timer counts down correctly even if popup is closed
- [ ] Notification tab shows correct message and cleans up on "Thanks"
- [ ] UI matches `TerminalApp.tsx` exactly (fonts, colors, grid, animations)
- [ ] No console errors, no uncaught exceptions, respects MV3 service-worker lifecycle

## All Needed Context

### Documentation & References (list all context needed to implement the feature)
```yaml
# MUST READ - Include these in your context window
- docfile: context/2_feature_briefs/1_foundation_prompt.md
  why: user stories for alarm-timer behavior and complete feature specification

- file: context/1_ui_reference/index.css
  why: Terminal color scheme (HSL-based green), animations, and design system

- file: context/1_ui_reference/tailwind.config.ts
  why: design tokens, animation keyframes (blink, terminal-glow, scan-line), and font definitions

- file: context/1_ui_reference/TerminalApp.tsx
  why: exact layout structure, component hierarchy, and markup to replicate

- file: context/1_ui_reference/index.html
  why: font imports (JetBrains Mono, Source Code Pro) and HTML structure

- url: https://developer.chrome.com/docs/extensions/reference/alarms/
  why: chrome.alarms API behavior, persistence patterns, device sleep handling, 30s minimum interval

- url: https://developer.chrome.com/docs/extensions/reference/storage/
  why: chrome.storage.local persistence patterns and best practices

- url: https://developer.chrome.com/docs/extensions/mv3/service_workers/
  why: MV3 service worker lifecycle, event handling, and startup patterns

- docfile: context/1_ai_agent_rules.md
  why: code style conventions, MV3 best practices, and Chrome extension development guidelines
```

### Current Codebase tree to get an overview of the codebase
```
browser_alarm_v2/
└── context/
    ├── 1_ui_reference/
    │   ├── index.css
    │   ├── index.html
    │   ├── tailwind.config.ts
    │   └── TerminalApp.tsx
    ├── 2_feature_briefs/
    │   └── 1_foundation_prompt.md
    ├── 3_base_prompts/
    │   └── 1_generate_prp.md
    └── 4_prp/
        └── prp_template.md
```

### Desired Codebase tree with files to be added and responsibility of file
```
browser_alarm_v2/
├── manifest.json                # MV3 manifest with permissions and service worker config
├── background.js                # Service worker: alarm scheduling, event handling, storage rehydration
├── popup.html                   # Main UI popup with terminal styling
├── popup.js                     # Popup logic: CRUD operations, UI updates, storage interaction
├── alarm.html                   # Notification page for fired alarms
├── alarm.js                     # Alarm notification logic and cleanup
├── timer.html                   # Notification page for fired timers
├── timer.js                     # Timer notification logic and cleanup
├── styles/
│   └── index.css                # Terminal color scheme and animations (copied from UI reference)
├── icons/
│   ├── icon16.png               # Extension toolbar icons
│   ├── icon48.png
│   └── icon128.png
└── context/                     # Existing context files (unchanged)
```

### Known Issues of our codebase & Library Quirks
- MV3 service worker can unload; must re-schedule alarms on each startup via `chrome.runtime.onStartup`
- Minimum alarm interval is 30 seconds; shorter timers must be clamped with user warning
- `chrome.alarms` may silently fail when >500 alarms exist: handle `chrome.runtime.lastError`
- Device sleep: missed alarms fire once upon wake; avoid double-firing with proper state management
- Chrome extension popup closes when user clicks outside; state must persist in storage
- Time format must be 24-hour (HH:MM) not AM/PM as specified in requirements

## Implementation Blueprint

### Data models and structure
```javascript
// Alarm data structure
type Alarm = {
  id: string,           // UUID or timestamp-based ID
  time: string,         // "HH:MM" in 24-hour format
  label: string,        // User-provided description
  enabled: boolean      // Whether alarm is active
}

// Timer data structure  
type Timer = {
  id: string,           // UUID or timestamp-based ID
  durationMs: number,   // Original duration in milliseconds
  endTime: number,      // Date.now() + durationMs when timer was started
  label: string,        // User-provided description
  enabled: boolean      // Whether timer is active
}

// Storage structure
const STORAGE_KEYS = {
  ALARMS: 'alarms',
  TIMERS: 'timers'
}
```

### list of tasks to be completed to fullfill the PRP in the order they should be completed

```yaml
Task 1: Create manifest.json
  - MV3 manifest version
  - Permissions: "alarms", "storage", "tabs", "activeTab"
  - Background service worker: "background.js"
  - Action popup: "popup.html"
  - Icons configuration

Task 2: Copy and adapt styles from UI reference
  - Copy index.css with terminal color scheme
  - Ensure HSL color variables are properly defined
  - Include terminal fonts (JetBrains Mono, Source Code Pro)
  - Add animation keyframes (blink, scan-line, terminal-glow)

Task 3: Create popup.html structure
  - Replicate TerminalApp.tsx layout exactly
  - Include ASCII art header and system uptime
  - Two-column grid for Alarms and Timers sections
  - Forms for adding new items
  - Lists for displaying existing items

Task 4: Implement popup.js functionality
  - DOM manipulation for terminal-style UI
  - Load alarms/timers from chrome.storage.local on popup open
  - Add alarm: validate HH:MM format, create storage entry
  - Add timer: validate hours/minutes, calculate duration
  - Toggle enabled/disabled state
  - Delete items from storage
  - Send messages to service worker for scheduling

Task 5: Create background.js service worker
  - Handle chrome.runtime.onInstalled and onStartup events
  - Rehydrate storage and re-schedule missing alarms
  - Listen for messages from popup for schedule/clear operations
  - Handle chrome.alarms.onAlarm events
  - Open notification tabs when alarms/timers fire
  - Clean up storage after notifications

Task 6: Build alarm notification system
  - Create alarm.html with terminal styling
  - Implement alarm.js to parse URL params and display message
  - "Hey, it's [time] - [label]" message format
  - "Thanks" button that closes tab and cleans up

Task 7: Build timer notification system
  - Create timer.html with terminal styling
  - Implement timer.js similar to alarm.js
  - "Hey, it's time - [duration] has past" message format
  - "Thanks" button functionality

Task 8: Add storage helper functions
  - getAlarms(), setAlarms(), getTimers(), setTimers()
  - Error handling for chrome.runtime.lastError
  - Data validation and sanitization

Task 9: Implement edge case handling
  - Time format validation (HH:MM)
  - Duration clamping (minimum 30 seconds)
  - Duplicate ID prevention
  - Browser restart alarm rehydration
  - Device sleep/wake handling

Task 10: Testing and validation
  - Load unpacked extension in Chrome
  - Test alarm firing accuracy
  - Verify timer countdown persistence
  - Test browser restart behavior
  - Validate device sleep scenarios
```

### Integration Points
```yaml
Popup to Service Worker Communication:
  - chrome.runtime.sendMessage for schedule/clear operations
  - Message types: "scheduleAlarm", "clearAlarm", "scheduleTimer", "clearTimer"

Service Worker to Storage:
  - chrome.storage.local for persistent state
  - Rehydration on startup/installation

Service Worker to Notification Pages:
  - URL parameters to pass alarm/timer data
  - chrome.tabs.create to open notification tabs

Notification Pages to Service Worker:
  - chrome.runtime.sendMessage for cleanup operations
  - chrome.tabs.getCurrent and chrome.tabs.remove for tab closure
```

## Validation Loop

### Level 1: Syntax & Style
Expected: No errors. If errors, READ the error and fix
- Manifest.json validates against Chrome extension schema
- No console errors in popup, service worker, or notification pages
- CSS loads correctly and matches UI reference exactly
- JavaScript follows ES6+ standards with proper error handling

---

## Anti-Patterns to Avoid
- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"
- ❌ Don't use sync functions in async context
- ❌ Don't hardcode values that should be config
- ❌ Don't catch all exceptions - be specific
- ❌ Don't reinvent scheduling logic—use `chrome.alarms` API
- ❌ Don't rely on global variables in service worker (it unloads)
- ❌ Don't store large binary blobs in `storage.local`—only small JSON
- ❌ Don't open desktop notifications—spec calls for tab notification pages
- ❌ Don't over-request permissions beyond what's needed

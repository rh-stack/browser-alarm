## PROJECT BRIEF:

I want to build a simple chrome extension that will do 2 things only, but will do them ideally.
First thing - Alarm.
Second thing - Timer.

## FEATURES:

There won't be any authentication and there will be only one role - a user.
Below is the initial list of user stories.

1. As a user I'm able to click an extension button on my browser and see the tab opened with UI
2. There's two main sections in the menu: Alarm and Timer. Alarm is a default section
3. Alarm section. I'm able to:
    3.1 Create a new Alarm. Several Alarms can be created. All time is in 24-hour format (important: not in AM/PM!).
    3.2 Delete an existing Alarm
    3.3 Turn on or turn off existing Alarm
    3.4 See the list of all existing Alarms
    3.5 In the existing alarm i should see time when it's active and how much time is left to Alarm event.
    3.6 When I create a new Alarm:
        3.6.1 I can pick time. Date is always today. I can't pick the date.
        3.6.2 Default time is 1 hour more than current time. Max default time is 23:59
        3.6.3 I can add a label in 1-line text input
        3.6.4 I can save or go back without saving
    3.7. When Alarm went off:
        3.7.1 It's automatically deleted from the list
        3.7.2 The Alarm notification appears in the exact same tab with the text "Hey, it's [Alarm time]"
        3.7.3 There's one button "Thanks" that closes the tab and deletes the alarm
        3.7.4 There's no Alarm sounds, nothing is blinking. Just a message that it's the time.
        3.7.5 The Alarm notification doesn't close automatically, it's visible until I click the button
4. Timer section. I'm able to:
    4.1 Pick hours (00-23) and minutes (00-59), without seconds
    4.2 Click start and timer starts
    4.3 I can see how time goes off
    4.4 Even if I close the tab, the time continues going. I can open tab anytime and see the correct time that is left.
    4.5 I can click "That will do" and Timer stops and resets automatically. There's no pause button
    4.6 When Timer went off:
        4.6.1 The Timer notification appears in the exact same tab with the text "Hey, it's time - [time] has past"
        4.6.2 There's one button "Thanks" that closes the tab.
        4.6.3 There's no Alarm sounds, nothing is blinking. Just a message that it's the time.
        4.6.4 The Alarm notification doesn't close automatically, it's visible until I click the button.

https://www.ascii-code.com/
https://theasciicode.com.ar/
https://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Alarms%20and%20Timers
/* @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Source+Code+Pro:wght@400;500;600&display=swap'); */


Matrix Digital Rain Animation
Option 1: Classic Matrix-style with Japanese katakana and numbers
  const matrixChars = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
Option 2: Simpler ASCII-based Matrix look
  const matrixChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'Z', 'X', 'Y', ':', '.', '"', '=', '*', '+', '-', '|', '<', '>'];
  
Option 3: Cyberpunk/Terminal style
  const matrixChars = ['0', '1', '█', '▓', '▒', '░', ':', ';', '.', ',', '/', '\\', '|', '-', '_', '+', '=', '*', '#', '@', '%', '&'];
  
Option 4: Pure binary Matrix style
  const matrixChars = ['0', '1', '0', '1', '0', '1', '0', '1', ':', '.', ' ', '█', '▓', '▒'];


## UI:
Please use the files in the [UI reference](../1_ui_reference) folder as the complete UI specification for this Chrome extension. These files contain:

**Design System & Styling:**
- Follow the exact terminal color scheme (green-on-black) from `index.css`
- Use the custom Tailwind configuration from `tailwind.config.ts` including terminal fonts, colors, and animations
- Import the terminal fonts (JetBrains Mono, Source Code Pro) as shown in `index.html`

**Layout & Components:**
- Replicate the exact layout structure from `TerminalApp.tsx`
- Maintain the ASCII art header, system uptime display, and terminal-style borders
- Keep the two-column grid layout for Alarms and Timers sections
- Preserve all animations: blinking indicators, scan-line effect, and terminal glow

Key Details:
- Max width: 500px (for Chrome extension popup)
- Font: monospace terminal fonts throughout
- Color scheme: HSL-based green terminal theme
- All interactive elements should match the terminal aesthetic

Do not deviate from this visual design - it should look exactly like the reference UI.

## Critical Context to Include
- Documentation: URLs with specific sections - irrelevant for this document.
- Code Examples: Real snippets from codebase - irrelevant for this document.
- Known issues: Library quirks, version issues - irrelevant for this document.
- Patterns: Existing approaches to follow - irrelevant for this document.

## 📝 Chrome Web Store Listing:

### Title:
ASCII Clock - Terminal Style Alarms & Timers

### Short Description (132 chars max):
Retro terminal-style alarm and timer extension with animated ASCII art interface. Perfect for developers and terminal enthusiasts.

### Detailed Description:
ASCII Clock brings the nostalgic charm of terminal computing to your browser with a simple but functional alarm and timer system.

🖥️ FEATURES:
- Terminal-inspired ASCII art interface
- Multiple alarms and timers limited to today
- Retro green-on-black terminal theme
- Five color themes
- Lightweight and fast
- Works offline

✔️ PERFECT FOR:
- Pomodoro technique practitioners
- Study sessions and work breaks
- Developers who love terminal aesthetics
- Retro computing enthusiasts
- Anyone who wants a unique, distraction-free timer

Transform your productivity with the nostalgic power of terminal-style time management. Simple pure retro functionality without bloat.

Keywords:
alarm, timer, clock, terminal, ASCII, retro, developer, productivity, pomodoro, vintage, monospace, synthwave, retrowave, matrix, cyberpunk, cyberdeck, arch, ricing

### Privacy policy page in Chrome Web Store

Single Purpose
ASCII Clock - Terminal Style Alarms & Timers has a single, focused purpose: to provide users with retro terminal-style alarm and timer functionality. The extension creates and manages time-based alerts with an animated ASCII art interface, designed specifically for developers and terminal enthusiasts who want a nostalgic, text-based timing solution.

Alarms justification
The alarms permission is essential for the core functionality of this extension. It allows the extension to:
- Schedule and trigger alarm notifications at user-specified times
- Create countdown timers that alert users when time expires
- Provide reliable time-based notifications even when the browser is minimized

Storage justification
The storage permission is used to:
- Save user's alarm and timer configurations locally
- Remember user preferences for ASCII art styles and terminal themes
- Maintain extension settings between browser sessions without requiring re-configuration

Tabs justification
The tabs permission enables the extension to:
- Open a dedicated alarm/timer tab when alarms trigger
- Provide better alarm visibility by bringing the browser window to focus

Privacy Note: This extension operates entirely locally on your device. No personal data, browsing history, or usage patterns are collected, transmitted, or stored remotely. All alarm and timer data remains on your local machine.
# Metarules. Core Principles
1. Follow all the rules in [ai agent rules](../1_ai_agent_rules.md)
2. Follow UI from the files in the [UI reference](../1_ui_reference) folder
3. Use patterns and keywords from the codebase

## Name: 
12-Hour Time Input Enhancement for Alarm Creation

## Description
Enhance the 12-hour time input for alarm creation to provide intuitive, consistent, and reliable user experience with smart parsing and automatic formatting.

## Goal
Refine the existing 12-hour time input functionality in `popup.js` to achieve seamless UX where users can type times naturally and get predictable, consistent results. The system should intelligently parse various time input patterns and format them correctly while maintaining bulletproof validation.

## Why
- **User Experience**: Current 12-hour format works but needs fine-tuning for great UX as specified in AC6
- **Input Consistency**: Users expect to type times naturally without fighting the interface  
- **Reduced Friction**: Smart parsing reduces cognitive load and typing effort
- **Feature Completeness**: 24-hour format works perfectly; 12-hour format needs to match that quality

## What
**User-visible behavior:**
- Time displays consistently as `10:27 AM` / `12:59 PM` format (AC1)
- Input accepts only valid characters: 0-9, :, A, P, M (AC2)  
- Ctrl+A selects all text in time input (AC3)
- Auto-colon insertion after typing 2 digits (AC4)
- Flexible deletion/editing at any cursor position (AC5)
- Smart parsing for natural typing patterns (AC6):
  - `1010a` → `10:10 AM`
  - `110a` → `1:10 AM`  
  - `110p` → `1:10 PM`
  - `1:10p` → `1:10 PM`
  - `0110p` → `1:10 PM`
  - `1:01p` → `1:01 PM`
  - `1:1p` → `1:01 PM`
  - `01:1p` → `1:01 PM`

**Technical requirements:**
- Enhance existing `handleTimeInputMask()` function in `popup.js`
- Maintain existing 24-hour storage format (alarms stored as HH:MM)
- Preserve existing AM/PM toggle functionality (A/P keys)
- Keep existing validation and conversion functions intact
- Ensure no breaking changes to 24-hour format functionality

## Success Criteria
- [ ] Time displays in correct format: `10:27 AM` / `12:59 PM`
- [ ] Only valid characters (0-9, :, A, P, M) can be typed
- [ ] Ctrl+A selects entire time input
- [ ] Auto-colon insertion works after 2 digits
- [ ] Users can delete/edit at any cursor position
- [ ] All AC6 smart parsing examples work correctly
- [ ] No regression in 24-hour format functionality  
- [ ] Existing alarm creation/scheduling still works
- [ ] Input validation prevents invalid times
- [ ] Clean, bulletproof logic without overengineering

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: context/2_feature_briefs/2_features.md
  why: Contains exact acceptance criteria and examples to implement

- file: js/popup.js
  why: Contains existing handleTimeInputMask function and all time input logic

- file: js/utils.js  
  why: Contains time conversion and validation functions

- file: js/constants.js
  why: Contains UI constants and validation limits

- file: popup.html
  why: Contains time input element structure and attributes

- url: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time
  why: Understanding native time input behavior and constraints
  critical: Native inputs always store as 24-hour HH:MM format internally

- file: context/1_ai_agent_rules.md
  why: Code style and architectural constraints
```

### Current Codebase tree 
```
E:.
│   alarm.html
│   manifest.json  
│   popup.html
│   timer.html
├───js
│       alarm.js
│       background.js
│       constants.js
│       notification.js
│       popup.js              # MAIN FILE TO MODIFY
│       timer.js
│       utils.js              # TIME CONVERSION FUNCTIONS
└───styles
        index.css
```

### Desired Codebase tree with files to be modified
```
E:.
├───js
│       popup.js              # Enhanced handleTimeInputMask function
│       utils.js              # Potentially add helper functions if needed
└───(no new files needed)
```

### Known Issues of our codebase & Library Quirks
- Current 12-hour input handling in `handleTimeInputMask()` has complex logic that sometimes conflicts with user expectations
- Delete/backspace behavior can be inconsistent when auto-formatting kicks in
- AM/PM detection logic needs to be more robust for partial inputs
- Leading zero handling inconsistent between different input patterns
- Manual colon input vs auto-colon insertion can create conflicts
- Time conversion functions exist but edge cases in input parsing need refinement

## Implementation Blueprint

### Data models and structure
```javascript
// No changes to data models - alarms still stored as:
{
  id: string,
  time: string,  // Always 24-hour format "HH:MM"
  label: string
}

// Input parsing should handle these patterns:
const INPUT_PATTERNS = [
  { input: "1010a", expected: "10:10 AM" },
  { input: "110a", expected: "1:10 AM" },
  { input: "110p", expected: "1:10 PM" },
  { input: "1:10p", expected: "1:10 PM" },
  { input: "0110p", expected: "1:10 PM" },
  { input: "1:01p", expected: "1:01 PM" },
  { input: "1:1p", expected: "1:01 PM" },
  { input: "01:1p", expected: "1:01 PM" }
];
```

### List of tasks to be completed to fulfill the PRP in order

```yaml
Task 1: Analyze and refactor handleTimeInputMask function logic
  - Review current implementation in popup.js lines 165-328
  - Identify specific UX issues with current parsing logic
  - Plan new parsing approach that handles all AC6 examples

Task 2: Implement smart time parsing algorithm
  - Create robust digit sequence parsing (handle 1-4 digits)
  - Implement intelligent hour/minute separation logic
  - Add leading zero normalization for minutes
  - Handle AM/PM detection and attachment

Task 3: Enhance auto-colon insertion behavior
  - Improve logic for when to auto-add colon vs when to wait
  - Handle edge cases with deletion and re-typing
  - Ensure colon insertion doesn't interfere with manual colon input

Task 4: Fix deletion and editing behavior
  - Preserve cursor position during auto-formatting
  - Handle backspace/delete at any position correctly
  - Prevent auto-formatting from disrupting user editing intent

Task 5: Implement comprehensive input validation
  - Restrict to only valid characters (0-9, :, A, P, M)
  - Validate hour ranges (1-12 for 12-hour format)
  - Validate minute ranges (00-59)
  - Handle edge cases like "12:XX AM/PM"

Task 6: Add Ctrl+A select all functionality
  - Ensure keyboard shortcut works in time input field
  - Test interaction with existing event handlers

Task 7: Test all acceptance criteria examples
  - Verify each AC6 example produces expected output
  - Test edge cases and error conditions
  - Validate integration with alarm creation flow

Task 8: Regression testing
  - Ensure 24-hour format still works perfectly
  - Verify alarm scheduling and storage unchanged
  - Test clock format switching functionality
```

### Integration Points
```yaml
Input Event Handler:
  - popup.js handleTimeInputMask() function (lines ~165-328)
  - Must preserve existing event binding and not break other inputs

Time Conversion:
  - utils.js convert12to24Hour() function
  - Ensure enhanced parsing feeds correctly into existing conversion

Validation Integration:
  - utils.js isValidTime() function for final validation
  - Existing addAlarm() function validation chain

Settings Integration:
  - Clock format switching functionality
  - updateAlarmInputFormat() placeholder updates
  - setDefaultAlarmTime() format handling

Storage Integration:
  - Maintain existing 24-hour storage format in chrome.storage.local
  - No changes to alarm scheduling or background.js logic
```

## Validation Loop

### Level 1: Syntax & Style
Expected: No console errors. All AC6 examples work correctly. Clean, readable code following project conventions.

### Level 2: Functional Testing
Expected: 
- Type each AC6 example → verify correct output
- Test deletion/editing at various cursor positions
- Verify Ctrl+A selection works
- Test auto-colon insertion timing
- Verify character restriction (only 0-9, :, A, P, M)
- Test integration with alarm creation and scheduling

### Level 3: Edge Case Testing
Expected:
- Test invalid times (13:XX, XX:60+)
- Test incomplete inputs during typing
- Test rapid typing vs slow typing
- Test paste operations
- Test browser auto-complete interactions

---

## Anti-Patterns to Avoid
- ❌ Don't overcomplicate the parsing logic - keep it readable and maintainable
- ❌ Don't break the existing 24-hour format functionality
- ❌ Don't change the underlying data storage format (24-hour HH:MM)
- ❌ Don't add unnecessary dependencies or external libraries
- ❌ Don't remove existing time conversion/validation functions
- ❌ Don't create timing conflicts between auto-formatting and user input
- ❌ Don't implement features beyond the specified acceptance criteria
- ❌ Don't make the input behavior unpredictable or inconsistent

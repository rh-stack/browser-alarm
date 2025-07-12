## FEATURES:

### feature 1

As a user I'm able to add new alarm.
I can do this in 24-hour or 12-hour format. The format is set in settings screen and is a matter of another feature.

Currently adding new alarm in 24-hour format works perfectly well.
Currently adding new alarm in 12-hour format is working as well, but it needs to be fine-tuned so we achieve great UX.

Acceptance criteria

[ ] AC1. The time should be displayed in format:
`10:27 AM`
`12:59 PM`

[ ] AC2. I should be able to type only the followint characters: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, :, A, P, M

[ ] AC3. I should be able to select the time with hotkey ctrl+a

[ ] AC4. When I type e.g. `1212` I expect that colon `:` will be added automatically while i'm typing e.g. after i type `12` i see `12:`

[ ] AC5. I should be able to delete any character in any cursor place in the input

[ ] AC6. The most important one for great UX. I should be able to type the time in a consistent, convenient and reliable way. Here are some examples.
- when i type `1010a` i'm expecting to see `10:10 AM`
- when i type `110a` i'm expecting to see `1:10 AM`
- when i type `110p` i'm expecting to see `1:10 PM`
- when i type `1:10p` i'm expecting to see `1:10 PM`
- when i type `0110p` i'm expecting to see `1:10 PM`
- when i type `1:01p` i'm expecting to see `1:01 PM`
- when i type `1:1p` i'm expecting to see `1:01 PM`
- when i type `01:1p` i'm expecting to see `1:01 PM`

The code should be clean, the logic should be bulletproof. Do not overengineer. Create working solution
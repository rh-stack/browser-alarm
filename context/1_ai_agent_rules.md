## Project Awareness & Context
- Use consistent naming conventions, UI, file structure, and architecture patterns.

## Code Structure & Modularity
- Never create a file longer than 500 lines of code. If a file approaches this limit, refactor by splitting it into modules or helper files.
- Organize code into clearly separated modules, grouped by feature or responsibility.
- Use clear, consistent imports (prefer relative imports within packages).

## Style & Conventions

### Code Style

- Use plain JavaScript - No TypeScript, frameworks, or build tools unless explicitly requested
- Consistent naming: camelCase for variables/functions, kebab-case for CSS classes, PascalCase for constructors
- Clear variable names: wordCountDiv not div1, countBtn not btn
- Add comments only for complex logic and Chrome API usage
- Use const/let appropriately - prefer const when value won't change

### File Structure

- Manifest first - Always provide complete manifest.json with proper permissions
- Complete files - Provide full, working file contents rather than snippets
- Consistent file naming: popup.html, popup.js, background.js, content.js
- Logical organization - Group related functionality together

### Chrome Extension Best Practices

- Manifest v3 only - Use modern Chrome extension APIs
- Minimal permissions - Only request permissions actually needed
- Error handling - Always check for chrome.runtime.lastError
- Proper API usage - Use chrome.scripting.executeScript() not deprecated methods
- Target specification - Always specify target: {tabId: tabs[0].id}

### Error Handling

- Graceful degradation - Show meaningful error messages to users
- Console logging - Use console.error() for debugging information
- Null checks - Verify DOM elements exist before using them
- API validation - Check if Chrome APIs are available before calling

### User Experience

- Loading states - Show "Counting..." or similar feedback during operations
- Clear messaging - Use descriptive button text and result displays
- Responsive design - Ensure popup works at different sizes
- Accessible markup - Use semantic HTML elements

### Development Workflow

- Incremental fixes - Address one issue at a time with complete file updates
- Version control ready - Code should be ready for git without additional setup
- No external dependencies - Keep extensions self-contained

### Communication Style

- Skip pleasantries - Get straight to the solution
- Explain key concepts - Briefly explain why specific approaches are used
- Provide context - Mention when something is Manifest v3 specific
- Complete solutions - Give working code, not just explanations

### Debugging Approach

- Identify root cause - Explain what's causing the error, not just how to fix it
- Common pitfalls - Mention typical Chrome extension gotchas

## AI Behavior Rules
- Never assume missing context. Ask questions if uncertain.
# Metarules. Core Principles
1. Follow all the rules in [ai agent rules](../1_ai_agent_rules.md)
2. Follow UI from the files in the [UI reference](../1_ui_reference) folder
3. Use patterns and keywords from the codebase

## Name: 
[Name of the feature]

## Description
[Short description of the feature]

## Goal
[What needs to be built - be specific about the end state and desires]

## Why
- [Business value and user impact]
- [Integration with existing features]
- [Problems this feature solves and for whom]

## What
[User-visible behavior and technical requirements]

## Success Criteria
- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)
```yaml
# MUST READ - Include these in your context window
- docfile: [prp/file.md]
  why: [docs that the user has pasted in to the project]

- url: [official API docs URL]
  why: [specific sections/methods I'll need]
  
- file: [relative file path]
  why: [pattern to follow, issues to avoid]
  
- doc: [library documentation URL] 
  section: [specific section about common pitfalls]
  critical: [key insight that prevents common errors]

```

### Current Codebase tree to get an overview of the codebase
[Run "tree" in the root of the project and provide the current codebase ASCII tree]

### Desired Codebase tree with files to be added and responsibility of file
[Suggest the desired codebase tree]

### Known Issues of our codebase & Library Quirks
[List the issues]

## Implementation Blueprint

### Data models and structure
[List data models and structure if applicable]

### list of tasks to be completed to fullfill the PRP in the order they should be completed

```yaml
[Task 1:]
[Task 2:]
[Task N:]

```

### Integration Points
```yaml
[If applicable include integration point 1:]
[Integration point 2:]
[Integration point N:]
```

## Validation Loop

### Level 1: Syntax & Style
[Expected: No errors. If errors, READ the error and fix]

---

## Anti-Patterns to Avoid
- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"
- ❌ Don't use sync functions in async context
- ❌ Don't hardcode values that should be config
- ❌ Don't catch all exceptions - be specific
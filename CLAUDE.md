# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript game project. Since the project is just starting, the following conventions should be established as development begins:

## Common Commands

### Development
- If using npm: `npm start` or `npm run dev` to run the development server
- If using vanilla JS: Open `index.html` in a browser or use a local server like `python -m http.server` or `npx http-server`

### Build & Production
- If using a bundler: `npm run build` to create production build
- For vanilla JS: Files can be served directly

### Testing
- If tests are added: `npm test` to run all tests
- `npm test -- --watch` for test watching mode

## Architecture Guidelines

### File Structure
When building the game, consider organizing files as:
- `index.html` - Main HTML file
- `src/` - JavaScript source files
  - `game.js` - Main game loop and initialization
  - `entities/` - Game objects (player, enemies, etc.)
  - `systems/` - Game systems (physics, collision, rendering)
  - `utils/` - Helper functions
- `assets/` - Images, sounds, and other game assets
- `styles/` - CSS files

### Key Patterns
- Use ES6 modules for code organization
- Implement a game loop with update and render phases
- Consider using Canvas API or WebGL for rendering
- Keep game state separate from rendering logic
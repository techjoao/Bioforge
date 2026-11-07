# BioForge

**A privacy-first, open-source visual editor for personal pages.**

BioForge is a browser-based canvas editor inspired by visual design tools. Build a personal page by placing and styling elements directly on an artboard, then export it as a standalone HTML file.

## Current editor

- Free-position canvas with selectable text and shape layers.
- Drag to move and corner handles to resize elements.
- Layer list, selection inspector, and direct double-click text editing.
- Editable X/Y position, width, height, typography, color, fill, opacity, radius, and rotation.
- Configurable artboard width and background.
- Optional grid, 4/8/16/24 px grid spacing, and snap-to-grid.
- Canvas zoom, fit-to-screen, and hand/pan tool.
- Add headings, paragraphs, and shapes; duplicate and delete layers.
- Undo/redo keyboard shortcuts (Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z).
- Local document saving in the current browser.
- Standalone HTML export; no runtime library or remote dependency required.

## Privacy by design

- No accounts, user database, analytics, telemetry, advertising trackers, or tracking pixels.
- Document content is processed in the browser and is not uploaded to BioForge.
- No third-party APIs, remote fonts, or externally hosted scripts are required.
- Saved documents stay in the browser's local storage on the current device.
- Exported pages are static files. If you publish them, your chosen hosting provider may independently process technical request data such as server logs.

## Run locally

1. Clone or download this repository.
2. Open `index.html` in a modern browser.

No build step, package installation, or backend is required.

## Project direction

The editor is evolving toward a Figma-like experience for personal websites. The current canvas uses free positioning with optional alignment grid and snapping. Responsive breakpoint editing, richer component types, smart guides, and a full multi-page document workflow are planned future improvements.

## License

MIT. See [LICENSE](LICENSE).

# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

<!-- <END NEW CHANGELOG ENTRY> -->

## [1.0.33] - 2026-10-14

### Added

- `bpmn-validate` command that reports malformed XML, DOCTYPE declarations, non-BPMN files, duplicate ids, broken references, a missing diagram, elements without a shape, unreachable or disconnected steps, missing start or end events, unnamed gateway conditions and gateways without a default flow; errors only for a broken file, everything else a warning; text or `--json` output
- Validate button in the diagram toolbar that checks the diagram as shown, unsaved edits included, and lists the issues in a dialog, through a new authenticated server endpoint
- Agent skill for AI coding agents, shipped in the wheel under `share/jupyter/agents/skills/`: mandatory validation after every agent edit, the colour picker palette and colour attributes, and modelling conventions for task types, gateway conditions, process annotations and the questions to ask before designing a process

### Fixed

- A coloured text annotation showed its colour only on the thin bracket line; it now shows the fill colour as its background at full strength
- Toolbar buttons stayed highlighted after a click

## [1.0.32] - 2026-10-14

### Added

- Document toolbar with reload from disk, zoom out, zoom in and fit the diagram to the view
- XML syntax highlighting, closing-tag completion and folding for `.bpmn` files opened in the text editor
- Galata integration suite (43 specs) and Jest tests for the Realign Connectors geometry
- Acceptance criteria (`docs/acc-crit.md`) and defect register (`docs/defects.md`)

### Changed

- Project template updated to copier 4.6.5: `@jupyter/builder` (rspack), ESLint 9 flat config, Playwright CI job, `setup.py` removed
- Dependencies upgraded within their major versions: JupyterLab 4.6, bpmn-js 18.31, camunda-bpmn-moddle 8; CI runs Python 3.13
- Makefile replaced by the shared canonical Makefile 1.45
- README no longer claims server-side diagram processing

### Fixed

- Ctrl+S on JupyterLab 4.6 wrote nothing and closing the tab dropped the edits
- Reload from Disk was ignored after the first edit
- A label still open in the label editor was lost on close without a prompt
- An edit made while a save was in flight was marked as saved
- Ctrl+S did nothing while the label editor was open, including with CapsLock or a non-Latin keyboard layout
- The tab stayed marked unsaved after a confirmed Reload from Disk
- Reload from Disk on an empty `.bpmn` file kept the discarded edits
- One Realign Connectors run took 12 undo steps to reverse; it is now one step
- The canvas was clipped in panels shorter than 400 px
- Galata tests adopted any server on port 8888 and wrote the developer's JupyterLab settings

# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

<!-- <END NEW CHANGELOG ENTRY> -->

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

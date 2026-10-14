# Defects - jupyterlab_camunda_modeller_extension

Observed wrong behaviour of the BPMN modeller extension, its build and its test suite, with the trail of each fix.

## Authors

- `@kj` Konrad Jelen

## Packaging `PACK`

Build, install and dependency resolution

- [x] `DEF-PACK-1` **TypeScript build fails on lib0 typings** - MAJOR; build stopped with `TS2315: Type 'Uint8Array' is not generic` in lib0 typings; cause: lib0 typings need TypeScript 5.7, the project pins ~5.5.4; fix: `skipLibCheck: true`, lib0 later pinned to 0.2.111; `tsconfig.json`, `package.json`
  - evidence: make build exit 0, tsc clean with skipLibCheck and lib0 0.2.111, 2026-10-14
  - repro: remove `skipLibCheck` and the lib0 resolution, run `jlpm build:lib`
  - test-tags: FUNCTIONAL
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 3, fixed in v0.1.5
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v0.1.5, verified after the dependency upgrade

## Saving `SAVE`

Writing the diagram to the file and reloading it

- [x] `DEF-SAVE-2` **Ctrl+S saved the old diagram** - MAJOR; Ctrl+S wrote the diagram as opened, without the edits; cause: XML reached the model asynchronously on `saveState`, after the save had read the model; fix: model synced on every `commandStack.changed`; `src/widget.ts`
  - evidence: spec ACC-SAVE-11: new task in the saved file after Ctrl+S; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: add a task, press Ctrl+S at once, read the file
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 3, fixed in v0.1.5
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v0.1.5, verified
- [x] `DEF-SAVE-14` **Edits not saved on JupyterLab 4.6** - CRITICAL; on JupyterLab 4.6 an edit leaves the tab clean, Ctrl+S writes nothing and closing the tab drops the edits without a prompt; cause: `model.fromString` no longer marks the model dirty; fix: `_syncToModel` sets `model.dirty`; `src/widget.ts`
  - evidence: specs ACC-SAVE-11 to 14 and ACC-EDIT-9 failed on the old build (saved file without the task, no dirty mark), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: JupyterLab 4.6.4: open a .bpmn file, add a task, press Ctrl+S, read the file - no task
  - test-tags: E2E
  - root-cause: 2026-10-14T10:27:42Z @kj `@jupyter/ydoc` 4 `YFile.setSource` and JupyterLab 4.6 `DocumentModel.triggerContentChange` stopped setting `dirty`; the widget relied on that side effect
  - log: 2026-10-14T10:27:42Z @kj added
  - log: 2026-10-14T10:27:42Z @kj reported: Galata ACC-SAVE-11 found the saved file unchanged after a palette edit; model.dirty false while model text held the task
  - log: 2026-10-14T10:36:34Z @kj closed: fixed: _syncToModel sets model.dirty after fromString
- [x] `DEF-SAVE-15` **Reload from Disk ignored after an edit** - MAJOR; after the first edit "Reload from Disk" leaves the canvas unchanged, and the next edit writes the old diagram over the file; cause: `_onContentChanged` skips the reload while `_dirty`, which an edit sets and no save clears; fix: reload on every content change the widget did not raise; `src/widget.ts`
  - evidence: specs ACC-SAVE-15 and 16 failed on the old build (EndEvent_Reloaded not shown), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: open a .bpmn file, add a task, Ctrl+S, change the file on disk, File > Reload from Disk
  - test-tags: E2E
  - root-cause: 2026-10-14T10:27:42Z @kj `_dirty` is set on `commandStack.changed` and only reset by `save()`, which nothing calls
  - log: 2026-10-14T10:27:42Z @kj added
  - log: 2026-10-14T10:36:34Z @kj closed: fixed: _onContentChanged reloads on every change the widget did not raise; never-reset _dirty and the close dialog that read it removed
- [x] `DEF-SAVE-16` **Label typed in the label editor lost on close without a prompt** - MAJOR; Renaming an element and closing the tab while the label editor is open closes the tab without the save dialog and drops the typed label.
  - evidence: directEditing.activate marks the model dirty (src/widget.ts); spec DEF-SAVE-16: close asks, Save writes the new label; fails on the previous widget (logs/galata-mutant-r1.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open a diagram, double-click Task_1, type a new label, click the tab close icon: the tab closes without asking and the file keeps the old label
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T11:09:08Z @kj The label editor runs no command until it completes, so commandStack.changed never fires, the model stays clean, and DocumentWidgetManager closes the tab without asking. Present since HEAD 1937e28.
  - log: 2026-10-14T11:09:08Z @kj added
  - log: 2026-10-14T11:35:07Z @kj closed
- [x] `DEF-SAVE-17` **Edit made during a save left the model clean** - MAJOR; An edit made while a save request is in flight, or a label still open in the label editor when a save completes, leaves the tab clean, so closing the tab drops the edit without a prompt.
  - evidence: _onSaveState re-marks dirty on completed when the text changed or the label editor is open; specs DEF-SAVE-17 in-flight and autosave pass, both fail without the handler (logs/galata-mutant-r1.log, logs/galata-autosave-check.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Delay the contents PUT, press Ctrl+S, add an element before the PUT returns: the tab shows clean and closing it drops the element. Same when autosave runs while the label editor is open
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T11:09:08Z @kj JupyterLab Context._save sets model.dirty to false unconditionally after the PUT returns (docregistry 4.6.4 context.js:553), whatever changed during the request. The cause is upstream; the widget compensates on the saveState completed signal.
  - log: 2026-10-14T11:09:08Z @kj added
  - log: 2026-10-14T11:31:23Z @kj edited repro "Delay the contents PUT, press Ctrl+S, add a task before the PUT returns: the tab shows clean and closing it drops the task. Same after Ctrl+S pressed inside the label editor" -> "Delay the contents PUT, press Ctrl+S, add an element before the PUT returns: the tab shows clean and closing it drops the element. Same when autosave runs while the label editor is open"; reason: Ctrl+S never reaches JupyterLab from inside the label editor (DirectEditing._handleKey stops keydown propagation); autosave is the path that saves with the editor open
  - log: 2026-10-14T11:35:07Z @kj closed
- [x] `DEF-SAVE-18` **Ctrl+S does nothing while the label editor is open** - MAJOR; Pressing Ctrl+S while the label editor is open, also right after placing an element from the palette, saves nothing; the browser may run its own Save page instead.
  - evidence: capture-phase keydown on the widget node (keyCode 83, as Lumino reads S) completes the label, syncs and saves (src/widget.ts); specs DEF-SAVE-18 and DEF-SAVE-18 CapsLock fail on the previous builds (logs/galata-mutant-r2.log, logs/galata-mutant-r3.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open a diagram, add a task with the palette, type a label, press Ctrl+S without clicking elsewhere: the tab stays dirty and the file is unchanged
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T11:54:28Z @kj DirectEditing._handleKey calls stopPropagation on every keydown (diagram-js-direct-editing DirectEditing.js:213-229) and Lumino listens for keydown in the bubbling phase, so JupyterLab never sees the key. Present since HEAD 1937e28.
  - log: 2026-10-14T11:54:28Z @kj added
  - log: 2026-10-14T12:10:47Z @kj closed
  - log: 2026-10-14T12:26:53Z @kj edited evidence "capture-phase keydown on the widget node completes the label, syncs and saves (src/widget.ts); spec DEF-SAVE-18 fails on the previous build (logs/galata-mutant-r2.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14" -> "capture-phase keydown on the widget node (keyCode 83, as Lumino reads S) completes the label, syncs and saves (src/widget.ts); specs DEF-SAVE-18 and DEF-SAVE-18 CapsLock fail on the previous builds (logs/galata-mutant-r2.log, logs/galata-mutant-r3.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14"; reason: review round 3: CapsLock and non-Latin layouts; the earlier 38/38 count included a leftover screenshot spec, removed
- [x] `DEF-SAVE-21` **Tab stays marked unsaved after a confirmed Reload from Disk** - MINOR; After File > Reload from Disk is confirmed over unsaved edits, the canvas shows the disk content but the tab keeps its unsaved mark, so closing asks to save content that equals the file.
  - evidence: the widget wraps its context's revert(): once the model holds the disk text (an empty file is read separately, DEF-SAVE-22) the dirty mark is cleared; covers File > Reload from Disk and the toolbar refresh (src/widget.ts); spec DEF-SAVE-21 fails on the previous build (logs/galata-mutant-r5.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Add a task without saving, run File > Reload from Disk and confirm: the disk content shows, the tab is still marked unsaved
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T12:38:54Z @kj JupyterLab 4.6 Context._revert replaces the text with setSource and never clears dirty, and @jupyter/ydoc 4.1.1 setSource leaves the dirty state as it was. Upstream; affects every text document.
  - log: 2026-10-14T12:38:54Z @kj added
  - log: 2026-10-14T12:44:04Z @kj closed
  - log: 2026-10-14T13:05:24Z @kj edited evidence "the widget wraps its context's revert() to clear the dirty mark once the model holds the disk text, covering File > Reload from Disk, the File Changed dialog and the toolbar (src/widget.ts); spec DEF-SAVE-21 fails on the previous build (logs/galata-mutant-r5.log); ACC-VIEW-43 still green; Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14" -> "the widget wraps its context's revert(): once the model holds the disk text (an empty file is read separately, DEF-SAVE-22) the dirty mark is cleared; covers File > Reload from Disk and the toolbar refresh (src/widget.ts); spec DEF-SAVE-21 fails on the previous build (logs/galata-mutant-r5.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14"; reason: review round 5: the File Changed dialog path stays dirty through _onSaveState, and the empty-file case is DEF-SAVE-22
- [x] `DEF-SAVE-22` **Reload from Disk on an empty file keeps the discarded edits and marks the tab saved** - MAJOR; For a .bpmn file that is empty on disk, a confirmed Reload from Disk or toolbar refresh leaves the edited diagram on the canvas and clears the unsaved mark, so closing drops the edits without asking and the disk content is never shown.
  - evidence: the revert wrapper reads the file when the revert left the text unchanged and loads the empty diagram for an empty file before clearing the dirty mark (src/widget.ts, contents service passed in from src/index.ts); spec DEF-SAVE-22 fails on the previous build (logs/galata-mutant-r6.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open an empty .bpmn file, add a task, run File > Reload from Disk and confirm: the task stays on the canvas and the tab shows as saved
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T13:00:52Z @kj JupyterLab 4.6 Context._revert replaces the text only when the disk content is truthy (docregistry context.js:618), so an empty file leaves the model untouched; the DEF-SAVE-21 revert wrapper then cleared the dirty mark unconditionally. Found by review round 5.
  - log: 2026-10-14T13:00:52Z @kj added
  - log: 2026-10-14T13:05:24Z @kj closed

## File type `FILE`

Recognition and icon of `.bpmn` files

- [x] `DEF-FILE-3` **No BPMN icon in the file browser** - MINOR; `.bpmn` files showed the generic file icon; cause: no `schemaDir` in package.json and an SVG too complex for LabIcon; fix: `schema/plugin.json`, `schemaDir`, simplified SVG; `src/index.ts`
  - evidence: spec ACC-FILE-2: listing row svg data-icon bpmn:icon; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: build without `schemaDir`, list a `.bpmn` file in the file browser
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 4, fixed in v1.0.2
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.2, verified

## Styling `STYLE`

Canvas and bpmn-js controls inside JupyterLab themes

- [x] `DEF-STYLE-4` **Canvas unreadable in dark theme** - MINOR; diagram lines, palette and popups lost contrast under a dark theme; cause: canvas and controls used theme colour variables; fix: fixed white canvas and light controls; `style/base.css`
  - evidence: spec ACC-STYLE-28: canvas rgb(255, 255, 255) under JupyterLab Dark; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: switch to JupyterLab Dark, open a diagram
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 3, fixed in v0.1.5
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v0.1.5, verified
- [x] `DEF-STYLE-5` **Context pad and popup entries dim** - MINOR; context pad and popup icons rendered dim grey; cause: bpmn-js default entry opacity; fix: `opacity: 1` and `color: #333` overrides; `style/base.css`
  - evidence: spec ACC-STYLE-29: every context pad entry opacity 1; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: select an element, look at the context pad icons
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 6, fixed in v1.0.4
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.4, verified
- [x] `DEF-STYLE-6` **Label editing text dim grey** - MINOR; text typed into a label editor showed dim grey while saved labels are black; fix: `.djs-direct-editing-content` colour `#000`; `style/base.css`
  - evidence: spec ACC-STYLE-30: label editor colour rgb(0, 0, 0); Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: double-click a connector label, type
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 9, fixed in v1.0.21
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.21, verified
- [x] `DEF-STYLE-20` **Canvas clipped in panels shorter than 400 px** - MINOR; In a panel shorter than 400 px the canvas keeps a 400 px height, so its lower part and the fitted diagram are cut off.
  - evidence: min-height removed from .jp-BpmnWidget-container (style/base.css); spec DEF-STYLE-20 at a 480 px window: canvas inside the widget, fit scale finite and above 0; fails on the previous build (logs/galata-mutant-r5.log); Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Make the browser window about 500 px tall, open a diagram: the canvas is taller than the tab and the fitted diagram is cut off at the bottom
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T12:38:54Z @kj style/base.css gives .jp-BpmnWidget-container min-height: 400px; the widget clips overflow, and fit-viewport fits the diagram to the 400 px box. Present since HEAD 1937e28.
  - log: 2026-10-14T12:38:54Z @kj added
  - log: 2026-10-14T12:44:04Z @kj closed

## Colour `COLOR`

Element colouring through bpmn-js-color-picker

- [x] `DEF-COLOR-7` **Colour popup far from the cursor** - MEDIUM; the colour picker popup opened far from the clicked element; cause: `position: fixed` inside a JupyterLab container with a CSS transform is placed relative to that container; fix: MutationObserver moves `.djs-popup-parent` to `document.body`; `src/widget.ts`
  - evidence: spec ACC-COLOR-19: popup parent is body, popup within 100 px of the pad entry; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: select an element, click the colour entry of its context pad
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:01Z @kj backfilled from .claude/JOURNAL.md entry 7, fixed in v1.0.7
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.7, verified
- [x] `DEF-COLOR-8` **Group colour not shown** - MINOR; colouring a group showed no fill; cause: bpmn-js draws groups without fill, and the first fix read `element.businessObject.di`, which newer bpmn-js no longer sets; fix: `GroupColorModule` reads `element.di`, fills the group rect at 0.3 opacity; `src/widget.ts`
  - evidence: spec ACC-COLOR-20: group rect fill rgb(255, 204, 0), fill-opacity 0.3; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: add a group, pick a colour for it
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:01Z @kj backfilled from .claude/JOURNAL.md entry 10, fixed in v1.0.30
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.30, verified

## Realign connectors `ALIGN`

The Realign Connectors context menu command

- [x] `DEF-ALIGN-9` **Realign moved aligned connectors** - MINOR; Realign Connectors redrew associations that already ended on the annotation border; fix: an association whose end is within 5 px of the target border is skipped; `src/widget.ts`
  - evidence: jest isPointOnBoundary 5 px yes, 6 px no; spec ACC-ALIGN-27: aligned association keeps its waypoints; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: draw an association ending on an annotation border, run Realign Connectors
  - test-tags: UNIT, E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:01Z @kj backfilled from .claude/JOURNAL.md entry 9, fixed in v1.0.21
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.21, verified
- [x] `DEF-ALIGN-19` **One Realign run takes 12 undo steps to reverse** - MINOR; Realign Connectors records every annotation resize and association redraw as its own undo step, so one Ctrl+Z leaves a partly realigned diagram.
  - evidence: Realign runs as one registered bpmn-js command whose postExecute does the modeling calls, skipped when nothing needs changing (src/widget.ts); spec DEF-ALIGN-19 one undo fails on the previous build (logs/galata-mutant-r5.log), no-op spec guards the empty case; Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open a diagram with misaligned annotations, run Realign Connectors, undo once: only the last redraw is reverted
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T12:38:54Z @kj realignConnectors calls modeling.resizeShape and modeling.updateWaypoints directly, and each call is a separate command on the bpmn-js command stack. Present since HEAD 1937e28.
  - log: 2026-10-14T12:38:54Z @kj added
  - log: 2026-10-14T12:44:04Z @kj closed

## Test suite `TEST`

Jest, pytest and Galata test infrastructure

- [x] `DEF-TEST-10` **Galata adopts any server on port 8888** - MEDIUM; a local run with `reuseExistingServer: !process.env.CI` adopts whatever answers on the fixed port 8888 and creates and deletes test files there; a developer lab on 8888 blocks the suite; fix: `JUPYTER_TEST_PORT` setting, never reuse a server; `ui-tests/playwright.config.js`
  - evidence: suite ran on port 8890 beside the server on 8888; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: start any Jupyter server on 8888, run jlpm playwright test in ui-tests
  - test-tags: E2E
  - root-cause: 2026-10-14T10:12:11Z @kj Playwright config copied from the copier template, which assumes a free port 8888 and reuses a running server outside CI
  - log: 2026-10-14T10:12:11Z @kj added
  - log: 2026-10-14T10:36:34Z @kj closed: fixed: JUPYTER_TEST_PORT shared by playwright.config.js and the server config, reuseExistingServer false
- [x] `DEF-TEST-11` **Galata server writes the developer settings** - MEDIUM; the Galata test server reads and writes `~/.jupyter/lab/user-settings`, so a settings write in a test changes the developer lab; fix: `c.LabApp.user_settings_dir = mkdtemp(...)`; `ui-tests/jupyter_server_test_config.py`
  - evidence: test server used /tmp/galata-settings-*; ~/.jupyter/lab/user-settings themes file kept mtime 2026-10-13 after the dark-theme spec
  - repro: switch theme on the test server, check the mtime of ~/.jupyter/lab/user-settings/@jupyterlab/apputils-extension/themes.jupyterlab-settings
  - test-tags: E2E
  - root-cause: 2026-10-14T10:12:12Z @kj `configure_jupyter_server` moves workspaces and root to temporary folders but leaves the user settings folder at its default
  - log: 2026-10-14T10:12:12Z @kj added
  - log: 2026-10-14T10:36:35Z @kj closed: fixed: c.LabApp.user_settings_dir = mkdtemp(prefix=galata-settings-)
- [x] `DEF-TEST-12` **Save test passes without an edit** - MEDIUM; `should save BPMN diagram with Ctrl+S` skips the edit when the palette entry is not visible and asserts only `StartEvent_1`, which the file held before the save, so it stays green with saving broken; fix: unconditional edit, assert the new task in the saved XML; `ui-tests/tests/jupyterlab_camunda_modeller_extension.spec.ts`
  - evidence: spec ACC-SAVE-11 failed on the old build where saving was broken, green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: make Ctrl+S a no-op in src/widget.ts, run the Galata suite, the test still passes
  - test-tags: E2E
  - log: 2026-10-14T10:12:12Z @kj added
  - log: 2026-10-14T10:36:35Z @kj closed: fixed: weak test removed; ACC-SAVE-11 spec edits unconditionally and asserts the task in the saved file

## Documentation `DOCS`

README and other user-facing text

- [x] `DEF-DOCS-13` **README claims server-side diagram processing** - MINOR; README Features lists "Server-side processing - Backend support for diagram operations"; the server extension serves only the template `hello` endpoint; fix: list the shipped features instead; `README.md`
  - evidence: README.md Features checked against src/index.ts commands and routes.py, 2026-10-14
  - repro: read README Features, compare with jupyterlab_camunda_modeller_extension/routes.py
  - test-tags: MANUAL
  - log: 2026-10-14T10:12:12Z @kj added
  - log: 2026-10-14T10:36:35Z @kj closed: fixed: README Features lists colouring, Export as SVG and Realign Connectors

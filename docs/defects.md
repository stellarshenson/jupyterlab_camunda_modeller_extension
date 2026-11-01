# Defects - jupyterlab_camunda_modeller_extension

Observed wrong behaviour of the BPMN modeller extension, its build and its test suite, with the trail of each fix.

- log: 2026-10-31T16:02:03Z @kj coded 25 item(s) from def-codes.txt

## Authors

- `@kj` Konrad Jelen

## Packaging `PACK`

Build, install and dependency resolution

- [x] `DEF-PACK-1-LIB0-TYPINGS` **TypeScript build fails on lib0 typings** - MAJOR; build stopped with `TS2315: Type 'Uint8Array' is not generic` in lib0 typings; fix: `skipLibCheck: true`, lib0 later pinned to 0.2.111; `tsconfig.json`, `package.json`
  - root-cause: 2026-10-31T20:48:25Z @kj lib0 typings need TypeScript 5.7, the project then pinned ~5.5.4
  - evidence: make build exit 0, tsc clean with skipLibCheck and lib0 0.2.111, 2026-10-14
  - repro: remove `skipLibCheck` and the lib0 resolution, run `jlpm build:lib`
  - test-tags: FUNCTIONAL
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 3, fixed in v0.1.5
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v0.1.5, verified after the dependency upgrade
  - log: 2026-10-31T16:02:03Z @kj coded LIB0-TYPINGS
  - log: 2026-10-31T20:44:42Z @kj edited text "build stopped with `TS2315: Type 'Uint8Array' is not generic` in lib0 typings; cause: lib0 typings need TypeScript 5.7, the project pins ~5.5.4; fix: `skipLibCheck: true`, lib0 later pinned to 0.2.111; `tsconfig.json`, `package.json`" -> "build stopped with `TS2315: Type 'Uint8Array' is not generic` in lib0 typings; fix: `skipLibCheck: true`, lib0 later pinned to 0.2.111; `tsconfig.json`, `package.json`"
  - log: 2026-10-31T20:48:25Z @kj root-cause updated "2026-10-31T20:44:42Z @kj lib0 typings need TypeScript 5.7, the project pins ~5.5.4" -> "lib0 typings need TypeScript 5.7, the project then pinned ~5.5.4"

## Saving `SAVE`

Writing the diagram to the file and reloading it

- [x] `DEF-SAVE-2-OLD-DIAGRAM` **Ctrl+S saved the old diagram** - MAJOR; Ctrl+S wrote the diagram as opened, without the edits; fix: model synced on every `commandStack.changed`; `src/widget.ts`
  - root-cause: 2026-10-31T20:44:42Z @kj XML reached the model asynchronously on `saveState`, after the save had read the model
  - evidence: spec ACC-SAVE-11-CTRL-S: new task in the saved file after Ctrl+S; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: add a task, press Ctrl+S at once, read the file
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 3, fixed in v0.1.5
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v0.1.5, verified
  - log: 2026-10-31T16:02:03Z @kj coded OLD-DIAGRAM
  - log: 2026-10-31T16:03:49Z @kj edited evidence "spec ACC-SAVE-11: new task in the saved file after Ctrl+S; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-SAVE-11-CTRL-S: new task in the saved file after Ctrl+S; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:44:42Z @kj edited text "Ctrl+S wrote the diagram as opened, without the edits; cause: XML reached the model asynchronously on `saveState`, after the save had read the model; fix: model synced on every `commandStack.changed`; `src/widget.ts`" -> "Ctrl+S wrote the diagram as opened, without the edits; fix: model synced on every `commandStack.changed`; `src/widget.ts`"
- [x] `DEF-SAVE-14-EDITS-UNSAVED` **Edits not saved on JupyterLab 4.6** - CRITICAL; on JupyterLab 4.6 an edit leaves the tab clean, Ctrl+S writes nothing and closing the tab drops the edits without a prompt; fix: `_syncToModel` sets `model.dirty`; `src/widget.ts`
  - evidence: specs ACC-SAVE-11-CTRL-S to ACC-SAVE-14-CLOSE-PROMPT and ACC-EDIT-9-CAMUNDA-ATTRS failed on the old build (saved file without the task, no dirty mark), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: JupyterLab 4.6.4: open a .bpmn file, add a task, press Ctrl+S, read the file - no task
  - test-tags: E2E
  - root-cause: 2026-10-14T10:27:42Z @kj `@jupyter/ydoc` 4 `YFile.setSource` and JupyterLab 4.6 `DocumentModel.triggerContentChange` stopped setting `dirty`; the widget relied on that side effect
  - log: 2026-10-14T10:27:42Z @kj added
  - log: 2026-10-14T10:27:42Z @kj reported: Galata ACC-SAVE-11 found the saved file unchanged after a palette edit; model.dirty false while model text held the task
  - log: 2026-10-14T10:36:34Z @kj closed: fixed: _syncToModel sets model.dirty after fromString
  - log: 2026-10-31T16:02:03Z @kj coded EDITS-UNSAVED
  - log: 2026-10-31T16:03:49Z @kj edited evidence "specs ACC-SAVE-11 to 14 and ACC-EDIT-9 failed on the old build (saved file without the task, no dirty mark), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "specs ACC-SAVE-11-CTRL-S to ACC-SAVE-14-CLOSE-PROMPT and ACC-EDIT-9-CAMUNDA-ATTRS failed on the old build (saved file without the task, no dirty mark), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:48:25Z @kj edited text "on JupyterLab 4.6 an edit leaves the tab clean, Ctrl+S writes nothing and closing the tab drops the edits without a prompt; cause: `model.fromString` no longer marks the model dirty; fix: `_syncToModel` sets `model.dirty`; `src/widget.ts`" -> "on JupyterLab 4.6 an edit leaves the tab clean, Ctrl+S writes nothing and closing the tab drops the edits without a prompt; fix: `_syncToModel` sets `model.dirty`; `src/widget.ts`"
- [x] `DEF-SAVE-15-RELOAD-IGNORED` **Reload from Disk ignored after an edit** - MAJOR; after the first edit "Reload from Disk" leaves the canvas unchanged, and the next edit writes the old diagram over the file; cause: `_onContentChanged` skips the reload while `_dirty`, which an edit sets and no save clears; fix: reload on every content change the widget did not raise; `src/widget.ts`
  - evidence: specs ACC-SAVE-15-RELOAD and ACC-SAVE-16-RELOAD-UNSAVED failed on the old build (EndEvent_Reloaded not shown), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: open a .bpmn file, add a task, Ctrl+S, change the file on disk, File > Reload from Disk
  - test-tags: E2E
  - root-cause: 2026-10-14T10:27:42Z @kj `_dirty` is set on `commandStack.changed` and only reset by `save()`, which nothing calls
  - log: 2026-10-14T10:27:42Z @kj added
  - log: 2026-10-14T10:36:34Z @kj closed: fixed: _onContentChanged reloads on every change the widget did not raise; never-reset _dirty and the close dialog that read it removed
  - log: 2026-10-31T16:02:03Z @kj coded RELOAD-IGNORED
  - log: 2026-10-31T16:03:49Z @kj edited evidence "specs ACC-SAVE-15 and 16 failed on the old build (EndEvent_Reloaded not shown), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "specs ACC-SAVE-15-RELOAD and ACC-SAVE-16-RELOAD-UNSAVED failed on the old build (EndEvent_Reloaded not shown), green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
- [x] `DEF-SAVE-16-LABEL-LOST` **Label typed in the label editor lost on close without a prompt** - MAJOR; Renaming an element and closing the tab while the label editor is open closes the tab without the save dialog and drops the typed label.
  - evidence: directEditing.activate marks the model dirty (src/widget.ts); spec DEF-SAVE-16-LABEL-LOST: close asks, Save writes the new label; fails on the previous widget (logs/galata-mutant-r1.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open a diagram, double-click Task_1, type a new label, click the tab close icon: the tab closes without asking and the file keeps the old label
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T11:09:08Z @kj The label editor runs no command until it completes, so commandStack.changed never fires, the model stays clean, and DocumentWidgetManager closes the tab without asking. Present since HEAD 1937e28.
  - log: 2026-10-14T11:09:08Z @kj added
  - log: 2026-10-14T11:35:07Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded LABEL-LOST
  - log: 2026-10-31T16:03:49Z @kj edited evidence "directEditing.activate marks the model dirty (src/widget.ts); spec DEF-SAVE-16: close asks, Save writes the new label; fails on the previous widget (logs/galata-mutant-r1.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14" -> "directEditing.activate marks the model dirty (src/widget.ts); spec DEF-SAVE-16-LABEL-LOST: close asks, Save writes the new label; fails on the previous widget (logs/galata-mutant-r1.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
- [x] `DEF-SAVE-17-EDIT-MIDSAVE` **Edit made during a save left the model clean** - MAJOR; An edit made while a save request is in flight, or a label still open in the label editor when a save completes, leaves the tab clean, so closing the tab drops the edit without a prompt.
  - evidence: _onSaveState re-marks dirty on completed when the text changed or the label editor is open; specs DEF-SAVE-17-EDIT-MIDSAVE in-flight and autosave pass, both fail without the handler (logs/galata-mutant-r1.log, logs/galata-autosave-check.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Delay the contents PUT, press Ctrl+S, add an element before the PUT returns: the tab shows clean and closing it drops the element. Same when autosave runs while the label editor is open
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T11:09:08Z @kj JupyterLab Context._save sets model.dirty to false unconditionally after the PUT returns (docregistry 4.6.4 context.js:553), whatever changed during the request. The cause is upstream; the widget compensates on the saveState completed signal.
  - log: 2026-10-14T11:09:08Z @kj added
  - log: 2026-10-14T11:31:23Z @kj edited repro "Delay the contents PUT, press Ctrl+S, add a task before the PUT returns: the tab shows clean and closing it drops the task. Same after Ctrl+S pressed inside the label editor" -> "Delay the contents PUT, press Ctrl+S, add an element before the PUT returns: the tab shows clean and closing it drops the element. Same when autosave runs while the label editor is open"; reason: Ctrl+S never reaches JupyterLab from inside the label editor (DirectEditing._handleKey stops keydown propagation); autosave is the path that saves with the editor open
  - log: 2026-10-14T11:35:07Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded EDIT-MIDSAVE
  - log: 2026-10-31T16:03:49Z @kj edited evidence "_onSaveState re-marks dirty on completed when the text changed or the label editor is open; specs DEF-SAVE-17 in-flight and autosave pass, both fail without the handler (logs/galata-mutant-r1.log, logs/galata-autosave-check.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14" -> "_onSaveState re-marks dirty on completed when the text changed or the label editor is open; specs DEF-SAVE-17-EDIT-MIDSAVE in-flight and autosave pass, both fail without the handler (logs/galata-mutant-r1.log, logs/galata-autosave-check.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
- [x] `DEF-SAVE-18-LABEL-CTRLS` **Ctrl+S does nothing while the label editor is open** - MAJOR; Pressing Ctrl+S while the label editor is open, also right after placing an element from the palette, saves nothing; the browser may run its own Save page instead.
  - evidence: capture-phase keydown on the widget node (keyCode 83, as Lumino reads S) completes the label, syncs and saves (src/widget.ts); specs DEF-SAVE-18-LABEL-CTRLS and DEF-SAVE-18-LABEL-CTRLS CapsLock fail on the previous builds (logs/galata-mutant-r2.log, logs/galata-mutant-r3.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open a diagram, add a task with the palette, type a label, press Ctrl+S without clicking elsewhere: the tab stays dirty and the file is unchanged
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T11:54:28Z @kj DirectEditing._handleKey calls stopPropagation on every keydown (diagram-js-direct-editing DirectEditing.js:213-229) and Lumino listens for keydown in the bubbling phase, so JupyterLab never sees the key. Present since HEAD 1937e28.
  - log: 2026-10-14T11:54:28Z @kj added
  - log: 2026-10-14T12:10:47Z @kj closed
  - log: 2026-10-14T12:26:53Z @kj edited evidence "capture-phase keydown on the widget node completes the label, syncs and saves (src/widget.ts); spec DEF-SAVE-18 fails on the previous build (logs/galata-mutant-r2.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14" -> "capture-phase keydown on the widget node (keyCode 83, as Lumino reads S) completes the label, syncs and saves (src/widget.ts); specs DEF-SAVE-18 and DEF-SAVE-18 CapsLock fail on the previous builds (logs/galata-mutant-r2.log, logs/galata-mutant-r3.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14"; reason: review round 3: CapsLock and non-Latin layouts; the earlier 38/38 count included a leftover screenshot spec, removed
  - log: 2026-10-31T16:02:03Z @kj coded LABEL-CTRLS
  - log: 2026-10-31T16:03:49Z @kj edited evidence "capture-phase keydown on the widget node (keyCode 83, as Lumino reads S) completes the label, syncs and saves (src/widget.ts); specs DEF-SAVE-18 and DEF-SAVE-18 CapsLock fail on the previous builds (logs/galata-mutant-r2.log, logs/galata-mutant-r3.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14" -> "capture-phase keydown on the widget node (keyCode 83, as Lumino reads S) completes the label, syncs and saves (src/widget.ts); specs DEF-SAVE-18-LABEL-CTRLS and DEF-SAVE-18-LABEL-CTRLS CapsLock fail on the previous builds (logs/galata-mutant-r2.log, logs/galata-mutant-r3.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
- [x] `DEF-SAVE-21-RELOAD-DIRTY` **Tab stays marked unsaved after a confirmed Reload from Disk** - MINOR; After File > Reload from Disk is confirmed over unsaved edits, the canvas shows the disk content but the tab keeps its unsaved mark, so closing asks to save content that equals the file.
  - evidence: the widget wraps its context's revert(): once the model holds the disk text (an empty file is read separately, DEF-SAVE-22-RELOAD-EMPTY) the dirty mark is cleared; covers File > Reload from Disk and the toolbar refresh (src/widget.ts); spec DEF-SAVE-21-RELOAD-DIRTY fails on the previous build (logs/galata-mutant-r5.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Add a task without saving, run File > Reload from Disk and confirm: the disk content shows, the tab is still marked unsaved
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T12:38:54Z @kj JupyterLab 4.6 Context._revert replaces the text with setSource and never clears dirty, and @jupyter/ydoc 4.1.1 setSource leaves the dirty state as it was. Upstream; affects every text document.
  - log: 2026-10-14T12:38:54Z @kj added
  - log: 2026-10-14T12:44:04Z @kj closed
  - log: 2026-10-14T13:05:24Z @kj edited evidence "the widget wraps its context's revert() to clear the dirty mark once the model holds the disk text, covering File > Reload from Disk, the File Changed dialog and the toolbar (src/widget.ts); spec DEF-SAVE-21 fails on the previous build (logs/galata-mutant-r5.log); ACC-VIEW-43 still green; Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14" -> "the widget wraps its context's revert(): once the model holds the disk text (an empty file is read separately, DEF-SAVE-22) the dirty mark is cleared; covers File > Reload from Disk and the toolbar refresh (src/widget.ts); spec DEF-SAVE-21 fails on the previous build (logs/galata-mutant-r5.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14"; reason: review round 5: the File Changed dialog path stays dirty through _onSaveState, and the empty-file case is DEF-SAVE-22
  - log: 2026-10-31T16:02:03Z @kj coded RELOAD-DIRTY
  - log: 2026-10-31T16:03:51Z @kj edited evidence "the widget wraps its context's revert(): once the model holds the disk text (an empty file is read separately, DEF-SAVE-22) the dirty mark is cleared; covers File > Reload from Disk and the toolbar refresh (src/widget.ts); spec DEF-SAVE-21 fails on the previous build (logs/galata-mutant-r5.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14" -> "the widget wraps its context's revert(): once the model holds the disk text (an empty file is read separately, DEF-SAVE-22-RELOAD-EMPTY) the dirty mark is cleared; covers File > Reload from Disk and the toolbar refresh (src/widget.ts); spec DEF-SAVE-21-RELOAD-DIRTY fails on the previous build (logs/galata-mutant-r5.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
- [x] `DEF-SAVE-22-RELOAD-EMPTY` **Reload from Disk on an empty file keeps the discarded edits and marks the tab saved** - MAJOR; For a .bpmn file that is empty on disk, a confirmed Reload from Disk or toolbar refresh leaves the edited diagram on the canvas and clears the unsaved mark, so closing drops the edits without asking and the disk content is never shown.
  - evidence: the revert wrapper reads the file when the revert left the text unchanged and loads the empty diagram for an empty file before clearing the dirty mark (src/widget.ts, contents service passed in from src/index.ts); spec DEF-SAVE-22-RELOAD-EMPTY fails on the previous build (logs/galata-mutant-r6.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open an empty .bpmn file, add a task, run File > Reload from Disk and confirm: the task stays on the canvas and the tab shows as saved
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-31T16:03:50Z @kj JupyterLab 4.6 Context._revert replaces the text only when the disk content is truthy (docregistry context.js:618), so an empty file leaves the model untouched; the DEF-SAVE-21-RELOAD-DIRTY revert wrapper then cleared the dirty mark unconditionally. Found by review round 5.
  - log: 2026-10-14T13:00:52Z @kj added
  - log: 2026-10-14T13:05:24Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded RELOAD-EMPTY
  - log: 2026-10-31T16:03:49Z @kj edited evidence "the revert wrapper reads the file when the revert left the text unchanged and loads the empty diagram for an empty file before clearing the dirty mark (src/widget.ts, contents service passed in from src/index.ts); spec DEF-SAVE-22 fails on the previous build (logs/galata-mutant-r6.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14" -> "the revert wrapper reads the file when the revert left the text unchanged and loads the empty diagram for an empty file before clearing the dirty mark (src/widget.ts, contents service passed in from src/index.ts); spec DEF-SAVE-22-RELOAD-EMPTY fails on the previous build (logs/galata-mutant-r6.log); Galata 43/43 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T16:03:50Z @kj root-cause updated "2026-10-14T13:00:52Z @kj JupyterLab 4.6 Context._revert replaces the text only when the disk content is truthy (docregistry context.js:618), so an empty file leaves the model untouched; the DEF-SAVE-21 revert wrapper then cleared the dirty mark unconditionally. Found by review round 5." -> "JupyterLab 4.6 Context._revert replaces the text only when the disk content is truthy (docregistry context.js:618), so an empty file leaves the model untouched; the DEF-SAVE-21-RELOAD-DIRTY revert wrapper then cleared the dirty mark unconditionally. Found by review round 5."; reason: full id written; meaning unchanged

## File type `FILE`

Recognition and icon of `.bpmn` files

- [x] `DEF-FILE-3-ICON` **No BPMN icon in the file browser** - MINOR; `.bpmn` files showed the generic file icon; fix: `schema/plugin.json`, `schemaDir`, simplified SVG; `src/index.ts`
  - root-cause: 2026-10-31T20:44:42Z @kj no `schemaDir` in package.json and an SVG too complex for LabIcon
  - evidence: spec ACC-FILE-2-BROWSER-ICON: listing row svg data-icon bpmn:icon; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: build without `schemaDir`, list a `.bpmn` file in the file browser
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 4, fixed in v1.0.2
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.2, verified
  - log: 2026-10-31T16:02:03Z @kj coded ICON
  - log: 2026-10-31T16:03:50Z @kj edited evidence "spec ACC-FILE-2: listing row svg data-icon bpmn:icon; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-FILE-2-BROWSER-ICON: listing row svg data-icon bpmn:icon; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:44:42Z @kj edited text "`.bpmn` files showed the generic file icon; cause: no `schemaDir` in package.json and an SVG too complex for LabIcon; fix: `schema/plugin.json`, `schemaDir`, simplified SVG; `src/index.ts`" -> "`.bpmn` files showed the generic file icon; fix: `schema/plugin.json`, `schemaDir`, simplified SVG; `src/index.ts`"

## Styling `STYLE`

Canvas and bpmn-js controls inside JupyterLab themes

- [x] `DEF-STYLE-4-DARK-CANVAS` **Canvas unreadable in dark theme** - MINOR; diagram lines, palette and popups lost contrast under a dark theme; fix: fixed white canvas and light controls; `style/base.css`
  - root-cause: 2026-10-31T20:44:42Z @kj canvas and controls used theme colour variables
  - evidence: spec ACC-STYLE-28-WHITE-CANVAS: canvas rgb(255, 255, 255) under JupyterLab Dark; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: switch to JupyterLab Dark, open a diagram
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 3, fixed in v0.1.5
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v0.1.5, verified
  - log: 2026-10-31T16:02:03Z @kj coded DARK-CANVAS
  - log: 2026-10-31T16:03:50Z @kj edited evidence "spec ACC-STYLE-28: canvas rgb(255, 255, 255) under JupyterLab Dark; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-STYLE-28-WHITE-CANVAS: canvas rgb(255, 255, 255) under JupyterLab Dark; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:44:42Z @kj edited text "diagram lines, palette and popups lost contrast under a dark theme; cause: canvas and controls used theme colour variables; fix: fixed white canvas and light controls; `style/base.css`" -> "diagram lines, palette and popups lost contrast under a dark theme; fix: fixed white canvas and light controls; `style/base.css`"
- [x] `DEF-STYLE-5-DIM-ENTRIES` **Context pad and popup entries dim** - MINOR; context pad and popup icons rendered dim grey; fix: `opacity: 1` and `color: #333` overrides; `style/base.css`
  - root-cause: 2026-10-31T20:44:42Z @kj bpmn-js default entry opacity
  - evidence: spec ACC-STYLE-29-FULL-OPACITY: every context pad entry opacity 1; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: select an element, look at the context pad icons
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 6, fixed in v1.0.4
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.4, verified
  - log: 2026-10-31T16:02:03Z @kj coded DIM-ENTRIES
  - log: 2026-10-31T16:03:50Z @kj edited evidence "spec ACC-STYLE-29: every context pad entry opacity 1; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-STYLE-29-FULL-OPACITY: every context pad entry opacity 1; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:44:42Z @kj edited text "context pad and popup icons rendered dim grey; cause: bpmn-js default entry opacity; fix: `opacity: 1` and `color: #333` overrides; `style/base.css`" -> "context pad and popup icons rendered dim grey; fix: `opacity: 1` and `color: #333` overrides; `style/base.css`"
- [x] `DEF-STYLE-6-DIM-LABEL` **Label editing text dim grey** - MINOR; text typed into a label editor showed dim grey while saved labels are black; fix: `.djs-direct-editing-content` colour `#000`; `style/base.css`
  - root-cause: 2026-10-31T20:29:23Z @kj TextBox.js and diagram-js.css set no editor colour, so without the style/base.css rule typed text inherits var(--jp-ui-font-color1) from .jp-ThemedContainer: rgb(165,165,165) on the white canvas in Galaxa Dark Theme - Steel, measured on JupyterLab 4.6.5. Saved labels use SVG fill rgb(34,36,42) from bpmn-js getLabelColor. Report-date theme not recorded.
  - evidence: spec ACC-STYLE-30-LABEL-BLACK: label editor colour rgb(0, 0, 0); Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: double-click a connector label, type
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:00Z @kj backfilled from .claude/JOURNAL.md entry 9, fixed in v1.0.21
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.21, verified
  - log: 2026-10-31T16:02:03Z @kj coded DIM-LABEL
  - log: 2026-10-31T16:03:50Z @kj edited evidence "spec ACC-STYLE-30: label editor colour rgb(0, 0, 0); Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-STYLE-30-LABEL-BLACK: label editor colour rgb(0, 0, 0); Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
- [x] `DEF-STYLE-20-CLIPPED-CANVAS` **Canvas clipped in panels shorter than 400 px** - MINOR; In a panel shorter than 400 px the canvas keeps a 400 px height, so its lower part and the fitted diagram are cut off.
  - evidence: min-height removed from .jp-BpmnWidget-container (style/base.css); spec DEF-STYLE-20-CLIPPED-CANVAS at a 480 px window: canvas inside the widget, fit scale finite and above 0; fails on the previous build (logs/galata-mutant-r5.log); Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Make the browser window about 500 px tall, open a diagram: the canvas is taller than the tab and the fitted diagram is cut off at the bottom
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T12:38:54Z @kj style/base.css gives .jp-BpmnWidget-container min-height: 400px; the widget clips overflow, and fit-viewport fits the diagram to the 400 px box. Present since HEAD 1937e28.
  - log: 2026-10-14T12:38:54Z @kj added
  - log: 2026-10-14T12:44:04Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded CLIPPED-CANVAS
  - log: 2026-10-31T16:03:50Z @kj edited evidence "min-height removed from .jp-BpmnWidget-container (style/base.css); spec DEF-STYLE-20 at a 480 px window: canvas inside the widget, fit scale finite and above 0; fails on the previous build (logs/galata-mutant-r5.log); Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14" -> "min-height removed from .jp-BpmnWidget-container (style/base.css); spec DEF-STYLE-20-CLIPPED-CANVAS at a 480 px window: canvas inside the widget, fit scale finite and above 0; fails on the previous build (logs/galata-mutant-r5.log); Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged

## Colour `COLOR`

Element colouring through bpmn-js-color-picker

- [x] `DEF-COLOR-7-POPUP-POSITION` **Colour popup far from the cursor** - MEDIUM; the colour picker popup opened far from the clicked element; fix: MutationObserver moves `.djs-popup-parent` to `document.body`; `src/widget.ts`
  - root-cause: 2026-10-31T20:44:42Z @kj `position: fixed` inside a JupyterLab container with a CSS transform is placed relative to that container
  - evidence: spec ACC-COLOR-19-POPUP-POSITION: popup parent is body, popup within 100 px of the pad entry; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: select an element, click the colour entry of its context pad
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:01Z @kj backfilled from .claude/JOURNAL.md entry 7, fixed in v1.0.7
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.7, verified
  - log: 2026-10-31T16:02:03Z @kj coded POPUP-POSITION
  - log: 2026-10-31T16:03:50Z @kj edited evidence "spec ACC-COLOR-19: popup parent is body, popup within 100 px of the pad entry; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-COLOR-19-POPUP-POSITION: popup parent is body, popup within 100 px of the pad entry; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:44:43Z @kj edited text "the colour picker popup opened far from the clicked element; cause: `position: fixed` inside a JupyterLab container with a CSS transform is placed relative to that container; fix: MutationObserver moves `.djs-popup-parent` to `document.body`; `src/widget.ts`" -> "the colour picker popup opened far from the clicked element; fix: MutationObserver moves `.djs-popup-parent` to `document.body`; `src/widget.ts`"
- [x] `DEF-COLOR-8-GROUP-FILL` **Group colour not shown** - MINOR; colouring a group showed no fill; fix: `GroupColorModule` reads `element.di`, fills the group rect at 0.3 opacity; `src/widget.ts`
  - root-cause: 2026-10-31T20:44:43Z @kj bpmn-js draws groups without fill, and the first fix read `element.businessObject.di`, which newer bpmn-js no longer sets
  - evidence: spec ACC-COLOR-20-GROUP-FILL: group rect fill rgb(255, 204, 0), fill-opacity 0.3; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: add a group, pick a colour for it
  - test-tags: E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:01Z @kj backfilled from .claude/JOURNAL.md entry 10, fixed in v1.0.30
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.30, verified
  - log: 2026-10-31T16:02:03Z @kj coded GROUP-FILL
  - log: 2026-10-31T16:03:50Z @kj edited evidence "spec ACC-COLOR-20: group rect fill rgb(255, 204, 0), fill-opacity 0.3; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-COLOR-20-GROUP-FILL: group rect fill rgb(255, 204, 0), fill-opacity 0.3; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:44:43Z @kj edited text "colouring a group showed no fill; cause: bpmn-js draws groups without fill, and the first fix read `element.businessObject.di`, which newer bpmn-js no longer sets; fix: `GroupColorModule` reads `element.di`, fills the group rect at 0.3 opacity; `src/widget.ts`" -> "colouring a group showed no fill; fix: `GroupColorModule` reads `element.di`, fills the group rect at 0.3 opacity; `src/widget.ts`"
- [x] `DEF-COLOR-24-ANNOTATION-FILL` **Annotation colour fills its background** - MEDIUM; colouring a text annotation paints its background with the picker fill; expected: background stays empty, only bracket and text take the colour, at full strength
  - evidence: colour module fills only groups again (src/widget.ts GroupColorHandler); spec ACC-COLOR-65-ANNOTATION: saved and runtime-coloured annotations rect fill none, bracket stroke and text fill rgb(131, 19, 17), opacity 1; failed on the 1.0.33 build with rect rgb(255, 205, 210) (logs/galata-def-color-24-before.log); Colour block 5/5 green incl. ACC-COLOR-20-GROUP-FILL (logs/galata-def-color-24.log); make test green, 2026-10-14
  - related: ACC-COLOR-65-ANNOTATION
  - test-tags: FUNCTIONAL
  - repro: colour a text annotation Red; its background turns #ffcdd2
  - root-cause: 2026-10-31T16:03:50Z @kj ACC-COLOR-65-ANNOTATION asked for the fill on the annotation rect, so FillColorHandler paints the di fill there at opacity 1 (src/widget.ts FILL_OPACITY)
  - log: 2026-10-14T16:33:00Z @kj added
  - log: 2026-10-14T16:33:15Z @kj edited test-tags added "FUNCTIONAL"
  - log: 2026-10-14T16:35:49Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded ANNOTATION-FILL
  - log: 2026-10-31T16:03:50Z @kj edited evidence "colour module fills only groups again (src/widget.ts GroupColorHandler); spec ACC-COLOR-65: saved and runtime-coloured annotations rect fill none, bracket stroke and text fill rgb(131, 19, 17), opacity 1; failed on the 1.0.33 build with rect rgb(255, 205, 210) (logs/galata-def-color-24-before.log); Colour block 5/5 green incl. ACC-COLOR-20 (logs/galata-def-color-24.log); make test green, 2026-10-14" -> "colour module fills only groups again (src/widget.ts GroupColorHandler); spec ACC-COLOR-65-ANNOTATION: saved and runtime-coloured annotations rect fill none, bracket stroke and text fill rgb(131, 19, 17), opacity 1; failed on the 1.0.33 build with rect rgb(255, 205, 210) (logs/galata-def-color-24-before.log); Colour block 5/5 green incl. ACC-COLOR-20-GROUP-FILL (logs/galata-def-color-24.log); make test green, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T16:03:50Z @kj root-cause updated "2026-10-14T16:33:00Z @kj ACC-COLOR-65 asked for the fill on the annotation rect, so FillColorHandler paints the di fill there at opacity 1 (src/widget.ts FILL_OPACITY)" -> "ACC-COLOR-65-ANNOTATION asked for the fill on the annotation rect, so FillColorHandler paints the di fill there at opacity 1 (src/widget.ts FILL_OPACITY)"; reason: full id written; meaning unchanged
- [x] `DEF-COLOR-25-ANNOTATION-DULL` **Annotation colour dark and dull** - MEDIUM; a coloured text annotation draws its bracket and text in the picker stroke colour, a dark border shade (#831311 for Red); expected: a brighter, more saturated colour for all five picker colours
  - evidence: AnnotationColorHandler (src/widget.ts ANNOTATION_COLOR); spec ACC-COLOR-65-ANNOTATION: saved Red, runtime Red and saved Blue annotations rect fill none, bracket stroke and text fill rgb(211, 47, 47) and rgb(25, 118, 210), opacity 1; failed on the previous build with rgb(131, 19, 17) (logs/galata-def-color-25-before.log); Colour block 5/5 green (logs/galata-def-color-25.log); make test green, 2026-10-14
  - related: DEF-COLOR-24-ANNOTATION-FILL, ACC-COLOR-65-ANNOTATION
  - test-tags: FUNCTIONAL
  - repro: colour a text annotation Red; bracket and text are dark maroon #831311
  - root-cause: 2026-10-14T16:39:59Z @kj bpmn-js draws annotation bracket and text in the di stroke, and the picker strokes are dark shades meant for borders next to a pale fill
  - log: 2026-10-14T16:39:59Z @kj added
  - log: 2026-10-14T16:39:59Z @kj edited test-tags added "FUNCTIONAL"
  - log: 2026-10-14T16:40:00Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded ANNOTATION-DULL
  - log: 2026-10-31T16:03:50Z @kj edited evidence "AnnotationColorHandler (src/widget.ts ANNOTATION_COLOR); spec ACC-COLOR-65: saved Red, runtime Red and saved Blue annotations rect fill none, bracket stroke and text fill rgb(211, 47, 47) and rgb(25, 118, 210), opacity 1; failed on the previous build with rgb(131, 19, 17) (logs/galata-def-color-25-before.log); Colour block 5/5 green (logs/galata-def-color-25.log); make test green, 2026-10-14" -> "AnnotationColorHandler (src/widget.ts ANNOTATION_COLOR); spec ACC-COLOR-65-ANNOTATION: saved Red, runtime Red and saved Blue annotations rect fill none, bracket stroke and text fill rgb(211, 47, 47) and rgb(25, 118, 210), opacity 1; failed on the previous build with rgb(131, 19, 17) (logs/galata-def-color-25-before.log); Colour block 5/5 green (logs/galata-def-color-25.log); make test green, 2026-10-14"; reason: full id written; meaning unchanged

## Realign connectors `ALIGN`

The Realign Connectors context menu command

- [x] `DEF-ALIGN-9-ALIGNED-MOVED` **Realign moved aligned connectors** - MINOR; Realign Connectors redrew associations that already ended on the annotation border; fix: an association whose end is within 5 px of the target border is skipped; `src/widget.ts`
  - root-cause: 2026-10-31T20:29:23Z @kj Before v1.0.21 realignConnectors (src/widget.ts) ran modeling.updateWaypoints on each connected association with two getBorderIntersection points on the line between getShapeCenter centres and no test of the existing end, so a border end off that line moved; fixture Aligned_1 moves 21 px. Pre-fix source absent; .claude/JOURNAL.md entries 8, 9 describe it.
  - evidence: jest isPointOnBoundary 5 px yes, 6 px no; spec ACC-ALIGN-27-ALIGNED-KEPT: aligned association keeps its waypoints; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: draw an association ending on an annotation border, run Realign Connectors
  - test-tags: UNIT, E2E
  - log: 2026-10-14T10:12:00Z @kj added
  - log: 2026-10-14T10:12:01Z @kj backfilled from .claude/JOURNAL.md entry 9, fixed in v1.0.21
  - log: 2026-10-14T10:36:34Z @kj closed: fixed in v1.0.21, verified
  - log: 2026-10-31T16:02:03Z @kj coded ALIGNED-MOVED
  - log: 2026-10-31T16:03:50Z @kj edited evidence "jest isPointOnBoundary 5 px yes, 6 px no; spec ACC-ALIGN-27: aligned association keeps its waypoints; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "jest isPointOnBoundary 5 px yes, 6 px no; spec ACC-ALIGN-27-ALIGNED-KEPT: aligned association keeps its waypoints; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
- [x] `DEF-ALIGN-19-UNDO-STEPS` **One Realign run takes 12 undo steps to reverse** - MINOR; Realign Connectors records every annotation resize and association redraw as its own undo step, so one Ctrl+Z leaves a partly realigned diagram.
  - evidence: Realign runs as one registered bpmn-js command whose postExecute does the modeling calls, skipped when nothing needs changing (src/widget.ts); spec DEF-ALIGN-19-UNDO-STEPS one undo fails on the previous build (logs/galata-mutant-r5.log), no-op spec guards the empty case; Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14
  - repro: Open a diagram with misaligned annotations, run Realign Connectors, undo once: only the last redraw is reverted
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T12:38:54Z @kj realignConnectors calls modeling.resizeShape and modeling.updateWaypoints directly, and each call is a separate command on the bpmn-js command stack. Present since HEAD 1937e28.
  - log: 2026-10-14T12:38:54Z @kj added
  - log: 2026-10-14T12:44:04Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded UNDO-STEPS
  - log: 2026-10-31T16:03:50Z @kj edited evidence "Realign runs as one registered bpmn-js command whose postExecute does the modeling calls, skipped when nothing needs changing (src/widget.ts); spec DEF-ALIGN-19 one undo fails on the previous build (logs/galata-mutant-r5.log), no-op spec guards the empty case; Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14" -> "Realign runs as one registered bpmn-js command whose postExecute does the modeling calls, skipped when nothing needs changing (src/widget.ts); spec DEF-ALIGN-19-UNDO-STEPS one undo fails on the previous build (logs/galata-mutant-r5.log), no-op spec guards the empty case; Galata 42/42 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged

## Test suite `TEST`

Jest, pytest and Galata test infrastructure

- [x] `DEF-TEST-10-ANY-SERVER` **Galata adopts any server on port 8888** - MEDIUM; a local run with `reuseExistingServer: !process.env.CI` adopts whatever answers on the fixed port 8888 and creates and deletes test files there; a developer lab on 8888 blocks the suite; fix: `JUPYTER_TEST_PORT` setting, never reuse a server; `ui-tests/playwright.config.js`
  - evidence: suite ran on port 8890 beside the server on 8888; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: start any Jupyter server on 8888, run jlpm playwright test in ui-tests
  - test-tags: E2E
  - root-cause: 2026-10-14T10:12:11Z @kj Playwright config copied from the copier template, which assumes a free port 8888 and reuses a running server outside CI
  - log: 2026-10-14T10:12:11Z @kj added
  - log: 2026-10-14T10:36:34Z @kj closed: fixed: JUPYTER_TEST_PORT shared by playwright.config.js and the server config, reuseExistingServer false
  - log: 2026-10-31T16:02:03Z @kj coded ANY-SERVER
- [x] `DEF-TEST-11-DEVELOPER-SETTINGS` **Galata server writes the developer settings** - MEDIUM; the Galata test server reads and writes `~/.jupyter/lab/user-settings`, so a settings write in a test changes the developer lab; fix: `c.LabApp.user_settings_dir = mkdtemp(...)`; `ui-tests/jupyter_server_test_config.py`
  - evidence: test server used /tmp/galata-settings-*; ~/.jupyter/lab/user-settings themes file kept mtime 2026-10-13 after the dark-theme spec
  - repro: switch theme on the test server, check the mtime of ~/.jupyter/lab/user-settings/@jupyterlab/apputils-extension/themes.jupyterlab-settings
  - test-tags: E2E
  - root-cause: 2026-10-14T10:12:12Z @kj `configure_jupyter_server` moves workspaces and root to temporary folders but leaves the user settings folder at its default
  - log: 2026-10-14T10:12:12Z @kj added
  - log: 2026-10-14T10:36:35Z @kj closed: fixed: c.LabApp.user_settings_dir = mkdtemp(prefix=galata-settings-)
  - log: 2026-10-31T16:02:03Z @kj coded DEVELOPER-SETTINGS
- [x] `DEF-TEST-12-NO-EDIT` **Save test passes without an edit** - MEDIUM; `should save BPMN diagram with Ctrl+S` stays green with saving broken; fix: unconditional edit, assert the new task in the saved XML; `ui-tests/tests/jupyterlab_camunda_modeller_extension.spec.ts`
  - root-cause: 2026-10-31T20:44:43Z @kj `should save BPMN diagram with Ctrl+S` skips the edit when the palette entry is not visible and asserts only `StartEvent_1`, which the file held before the save
  - evidence: spec ACC-SAVE-11-CTRL-S failed on the old build where saving was broken, green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - repro: make Ctrl+S a no-op in src/widget.ts, run the Galata suite, the test still passes
  - test-tags: E2E
  - log: 2026-10-14T10:12:12Z @kj added
  - log: 2026-10-14T10:36:35Z @kj closed: fixed: weak test removed; ACC-SAVE-11 spec edits unconditionally and asserts the task in the saved file
  - log: 2026-10-31T16:02:03Z @kj coded NO-EDIT
  - log: 2026-10-31T16:03:50Z @kj edited evidence "spec ACC-SAVE-11 failed on the old build where saving was broken, green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-SAVE-11-CTRL-S failed on the old build where saving was broken, green after the fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14"; reason: full id written; meaning unchanged
  - log: 2026-10-31T20:44:43Z @kj edited text "`should save BPMN diagram with Ctrl+S` skips the edit when the palette entry is not visible and asserts only `StartEvent_1`, which the file held before the save, so it stays green with saving broken; fix: unconditional edit, assert the new task in the saved XML; `ui-tests/tests/jupyterlab_camunda_modeller_extension.spec.ts`" -> "`should save BPMN diagram with Ctrl+S` stays green with saving broken; fix: unconditional edit, assert the new task in the saved XML; `ui-tests/tests/jupyterlab_camunda_modeller_extension.spec.ts`"

## Documentation `DOCS`

README and other user-facing text

- [x] `DEF-DOCS-13-README-CLAIM` **README claims server-side diagram processing** - MINOR; README Features lists "Server-side processing - Backend support for diagram operations"; the server extension serves only the template `hello` endpoint; fix: list the shipped features instead; `README.md`
  - root-cause: 2026-10-31T20:41:15Z @kj likely cause: the README feature list was never compared with the server extension, which serves only the template hello endpoint; the claim is present at 1937e28 README.md:23 and older history is not readable in this shallow clone
  - evidence: README.md Features checked against src/index.ts commands and routes.py, 2026-10-14
  - repro: read README Features, compare with jupyterlab_camunda_modeller_extension/routes.py
  - test-tags: MANUAL
  - log: 2026-10-14T10:12:12Z @kj added
  - log: 2026-10-14T10:36:35Z @kj closed: fixed: README Features lists colouring, Export as SVG and Realign Connectors
  - log: 2026-10-31T16:02:03Z @kj coded README-CLAIM
- [x] `DEF-DOCS-28-SKILL-REFS` **Skill named the wrong attribute for incoming and outgoing** - MEDIUM; SKILL.md told agents to make `incoming` and `outgoing` match the `sourceRef` and `targetRef` of the flows, and those values are flow ids; an agent following it wrote node ids, which `bpmn-validate` does not report
  - evidence: SKILL.md `missing-reference` rule, read 2026-10-31: value is a sequence flow id, `targetRef` for `incoming`, `sourceRef` for `outgoing`; ACC-VALID-92-SKILL-REFS
  - related: ACC-VALID-92-SKILL-REFS
  - repro: at commit 5d03796 follow SKILL.md line 16: set `incoming` to a node id, run `bpmn-validate`: no issue reported
  - test-tags: MANUAL
  - root-cause: 2026-10-31T16:03:53Z @kj the line named the wrong attribute
  - log: 2026-10-31T16:03:53Z @kj added
  - log: 2026-10-31T16:21:52Z @kj closed
  - log: 2026-10-31T19:51:48Z @kj edited evidence "SKILL.md line 16, read 2026-10-31: value is a sequence flow id, `targetRef` for `incoming`, `sourceRef` for `outgoing`; ACC-VALID-92-SKILL-REFS" -> "SKILL.md `missing-reference` rule, read 2026-10-31: value is a sequence flow id, `targetRef` for `incoming`, `sourceRef` for `outgoing`; ACC-VALID-92-SKILL-REFS"

## Toolbar `VIEW`

Document toolbar of the BPMN view: refresh, zoom and fit buttons

- [x] `DEF-VIEW-23-BUTTON-PRESSED` **Clicked toolbar buttons stay highlighted** - MINOR; After a click the refresh, zoom out, zoom in and fit buttons stay highlighted as if switched on, and report aria-pressed true to screen readers; a second click turns the highlight off.
  - evidence: toolbar buttons built by actionButton(), which resets pressed after ToolbarButton flips it (src/widget.ts); spec DEF-VIEW-23-BUTTON-PRESSED clicks all four buttons and asserts aria-pressed false; fails on the previous build (logs/galata-mutant-def-view-23.log), Toolbar block 6/6 green (logs/galata-def-view-23.log)
  - repro: Open a .bpmn file, click Zoom in, move the mouse away: the button keeps a lit box
  - test-tags: FUNCTIONAL
  - root-cause: 2026-10-14T14:10:09Z @kj JupyterLab 4.6 ToolbarButton flips its pressed state on every click (ui-components toolbar.js onClick getter), which suits toggles; our four buttons are actions built with ToolbarButton.
  - log: 2026-10-14T14:10:09Z @kj added
  - log: 2026-10-14T14:12:18Z @kj closed
  - log: 2026-10-31T16:02:03Z @kj coded BUTTON-PRESSED
  - log: 2026-10-31T16:03:51Z @kj edited evidence "toolbar buttons built by actionButton(), which resets pressed after ToolbarButton flips it (src/widget.ts); spec DEF-VIEW-23 clicks all four buttons and asserts aria-pressed false; fails on the previous build (logs/galata-mutant-def-view-23.log), Toolbar block 6/6 green (logs/galata-def-view-23.log)" -> "toolbar buttons built by actionButton(), which resets pressed after ToolbarButton flips it (src/widget.ts); spec DEF-VIEW-23-BUTTON-PRESSED clicks all four buttons and asserts aria-pressed false; fails on the previous build (logs/galata-mutant-def-view-23.log), Toolbar block 6/6 green (logs/galata-def-view-23.log)"; reason: full id written; meaning unchanged

## BPMN Validation `VALID`

bpmn-validate CLI, its checks and the agent skill that points at it

- log: 2026-10-31T16:03:53Z @kj category created

- [x] `DEF-VALID-26-ENCODING` **Unusable declared encoding crashes the command** - MEDIUM; a declared encoding Python cannot use crashed `bpmn-validate` with a traceback, and later files were not checked; `validate.py`
  - evidence: `validate()` catches `LookupError` and `ValueError`; repro on encoding foo: `malformed-xml` at line 1, exit 1, no traceback, second file reported (logs/verify-close-cli.log); `test_encoding_the_parser_cannot_use_is_malformed_xml` failed before the fix (tmp/workflows/lint-and-skill-audit/skill.json), passed after (logs/test-tracker-change.log)
  - related: ACC-VALID-90-BAD-ENCODING
  - repro: at commit 5d03796 run `bpmn-validate` on a file starting `<?xml version="1.0" encoding="foo"?>`, then a second file: LookupError traceback, second file not checked
  - test-tags: UNIT
  - root-cause: 2026-10-31T16:03:53Z @kj `validate()` caught only `ExpatError`, and Python's codecs raise `LookupError` or `ValueError`
  - log: 2026-10-31T16:03:53Z @kj added
  - log: 2026-10-31T16:21:51Z @kj closed
- [x] `DEF-VALID-27-NESTING` **Deep nesting crashes the command** - MINOR; 5000 nested elements raise RecursionError in `_Element.walk` (`validate.py`), with a traceback, and later files are not checked
  - evidence: `_Element.walk` uses a stack; repro on 5000 nested elements: no traceback, second file reported (logs/verify-close-cli.log); `test_deep_nesting_reports_nothing_and_later_files_are_checked` failed with RecursionError before the fix (logs/test-tracker-red-nesting.log), passed after (logs/test-tracker-change.log)
  - related: ACC-VALID-91-DEEP-NESTING
  - repro: run `bpmn-validate` on a file with 5000 nested elements inside a valid definitions root, then a second file: RecursionError traceback, second file not checked
  - test-tags: UNIT
  - root-cause: 2026-10-31T16:03:53Z @kj `_Element.walk` recurses per nesting level
  - log: 2026-10-31T16:03:53Z @kj added
  - log: 2026-10-31T16:21:51Z @kj closed
- [x] `DEF-VALID-29-UTF8-DECL` **UTF-8 spelling in the declaration gives a false malformed-xml** - MINOR; `validate(bytes)` reports `malformed-xml` on a valid UTF-8 file that declares `utf8`, `UTF8`, `utf_8` or `U8` and holds non-ASCII text; `validate(str)` reports no XML error on the same file; `validate.py`
  - evidence: `_parse` creates the parser with encoding UTF-8 when the codec registry resolves the declared name to UTF-8. `test_declared_utf8_spelling_parses_as_utf8`: 9 of 11 failed with the fix undone (logs/pytest-mutant-utf8-decl.log); all `test_declared_` tests, 21 passed (logs/test-utf8-repair-declared.log)
  - related: ACC-VALID-93-UTF8-SPELLING
  - repro: printf '<?xml version="1.0" encoding="utf8"?><a b="\303\263"/>' > z.bpmn; bpmn-validate z.bpmn; prints malformed-xml not well-formed (invalid token) at 1:44 and exits 1
  - test-tags: UNIT
  - root-cause: 2026-10-31T18:45:20Z @kj Expat does not recognise the name utf8, so pyexpat decodes bytes(range(256)) through the Python codec with errors=replace and uses the result as a single-byte table. UTF-8 fills 0x80 to 0xff with U+FFFD, so expat rejects every non-ASCII byte as invalid token.
  - log: 2026-10-31T18:45:20Z @kj added
  - log: 2026-10-31T18:50:59Z @kj closed
  - log: 2026-10-31T19:15:02Z @kj edited evidence "`_parse` creates the parser with encoding UTF-8 when the codec registry resolves the declared name to UTF-8. `test_declared_utf8_spelling_parses_as_utf8`: 6 of 8 failed with the fix undone (logs/pytest-mutant-utf8-decl.log); all `test_declared_` tests, 13 passed (logs/test-utf8-decl.log)" -> "`_parse` creates the parser with encoding UTF-8 when the codec registry resolves the declared name to UTF-8. `test_declared_utf8_spelling_parses_as_utf8`: 9 of 11 failed with the fix undone (logs/pytest-mutant-utf8-decl.log); all `test_declared_` tests, 21 passed (logs/test-utf8-repair-declared.log)"

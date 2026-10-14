# Acceptance Criteria - jupyterlab_camunda_modeller_extension

JupyterLab document widget that opens `.bpmn` files in the bpmn-js Modeler with the Camunda moddle extension, saves edits back to the file, and adds colouring, SVG export and connector realignment.

## Authors

- `@kj` Konrad Jelen

## File type `FILE`

How JupyterLab recognises and opens `.bpmn` files

- [x] `ACC-FILE-1` **BPMN file type** - HIGH; `.bpmn` is registered as file type `bpmn` with display name "BPMN Diagram"
  - evidence: spec ACC-FILE-1: file type lists .bpmn, display name BPMN Diagram; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: read `app.docRegistry.getFileType("bpmn")`, assert extension `.bpmn` and name "BPMN Diagram"
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:18Z @kj closed: verified
- [x] `ACC-FILE-2` **File browser icon** - MEDIUM; a `.bpmn` file shows the orange `bpmn:icon` in the file browser
  - evidence: spec ACC-FILE-2: listing row svg data-icon bpmn:icon; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: upload test-diagram.bpmn, assert its listing row icon is `bpmn:icon`
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:18Z @kj closed: verified
- [x] `ACC-FILE-3` **Opens in BPMN Modeler** - HIGH; double-click on a `.bpmn` file opens it in the "BPMN Modeler" widget
  - evidence: spec ACC-FILE-3 ACC-EDIT-4: double-click opened .jp-BpmnWidget; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: double-click test-diagram.bpmn, assert `.jp-BpmnWidget .djs-container`
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:18Z @kj closed: verified
- [x] `ACC-FILE-36` **XML highlighting in the text editor** - MEDIUM; a `.bpmn` file opened with "Open With > Editor" is highlighted as XML
  - evidence: spec ACC-FILE-36: bpmn:process drawn in the tag colour; fails without the BPMN language (logs/galata-mutant-xml.log); Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14
  - test: open test-diagram.bpmn with factory "Editor", assert the tag name bpmn:process is drawn in the editor tag colour (--jp-mirror-editor-tag-color)
  - test-tags: E2E
  - mechanism: 2026-10-14T10:44:44Z @kj a `.bpmn` language in `IEditorLanguageRegistry` that loads the registry XML support; the editor picks its language by file extension
  - log: 2026-10-14T10:44:44Z @kj added
  - log: 2026-10-14T10:44:44Z @kj requested by the Star Colonel 2026-10-14: ".bpmn opened in editor uses xml syntax highlighting and comprehension"
  - log: 2026-10-14T11:35:07Z @kj edited test "open test-diagram.bpmn with factory "Editor", assert the editor mime type is the XML language and tag names carry highlight token classes" -> "open test-diagram.bpmn with factory "Editor", assert the tag name bpmn:process is drawn in the editor tag colour (--jp-mirror-editor-tag-color)"; reason: test line aligned with the spec as written
  - log: 2026-10-14T11:35:07Z @kj closed
- [x] `ACC-FILE-37` **Closing tag completed in the text editor** - LOW; typing an opening tag in a `.bpmn` file in the text editor inserts its closing tag
  - evidence: spec ACC-FILE-37: typing <bpmn:task> yields <bpmn:task></bpmn:task>; fails without the BPMN language; Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14
  - test: type `<bpmn:task>` before `<bpmn:startEvent`, assert the text reads `<bpmn:task></bpmn:task><bpmn:startEvent`
  - test-tags: E2E
  - log: 2026-10-14T10:44:44Z @kj added
  - log: 2026-10-14T11:35:07Z @kj edited test "type `<bpmn:task>` on an empty line, assert the line reads `<bpmn:task></bpmn:task>`" -> "type `<bpmn:task>` before `<bpmn:startEvent`, assert the text reads `<bpmn:task></bpmn:task><bpmn:startEvent`"; reason: test line aligned with the spec as written
  - log: 2026-10-14T11:35:07Z @kj closed
- [x] `ACC-FILE-38` **Elements fold in the text editor** - LOW; an XML element of a `.bpmn` file folds in the text editor
  - evidence: spec ACC-FILE-38: codemirror:fold-current on <bpmn:process> shows the fold placeholder and hides the start event; fails without the BPMN language; Galata 31/31 green on JupyterLab 4.6.4, 2026-10-14
  - test: place the cursor on the `<bpmn:process>` line, run fold, assert a fold placeholder replaces its children
  - test-tags: E2E
  - log: 2026-10-14T10:44:44Z @kj added
  - log: 2026-10-14T11:35:07Z @kj closed

## Editing `EDIT`

Rendering and editing diagrams in the bpmn-js Modeler

- [x] `ACC-EDIT-4` **Diagram renders** - CRITICAL; a valid BPMN 2.0 file shows its elements on the canvas
  - evidence: spec ACC-FILE-3 ACC-EDIT-4: StartEvent_1 visible on the canvas; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open test-diagram.bpmn, assert `StartEvent_1` visible
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:18Z @kj closed: verified
- [x] `ACC-EDIT-5` **Palette adds elements** - HIGH; a palette tool places a new element on the canvas
  - evidence: spec ACC-EDIT-5: bpmn:Task count 0 -> 1 after the palette tool; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: click palette `create.task`, click the canvas, assert one `bpmn:Task` in the element registry
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-EDIT-6` **Empty file template** - MEDIUM; an empty `.bpmn` file opens as a diagram with one start event
  - evidence: spec ACC-EDIT-6: empty file shows StartEvent_1, one start event; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open an empty .bpmn file, assert `StartEvent_1` visible
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-EDIT-7` **Edge: invalid file** - MEDIUM; a file that is not BPMN XML shows "Failed to load BPMN diagram" and the parser message
  - evidence: spec ACC-EDIT-7: error panel shows Failed to load BPMN diagram and the parser message; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open a .bpmn file holding plain text, assert the error panel text
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-EDIT-8` **Edge: error message escaped** - HIGH; markup inside the parser message is shown as text, never parsed as HTML
  - evidence: spec ACC-EDIT-8: error text shows unparsable content </img>, no img element; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open a file holding `<a></img>`, assert the error text shows `unparsable content </img>` and the panel holds no img element
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:18Z @kj edited test "open a file whose parser message holds an `<img onerror>` tag, assert no img element in the error panel" -> "open a file holding `<a></img>`, assert the error text shows `unparsable content </img>` and the panel holds no img element"
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-EDIT-9` **Camunda attributes kept** - HIGH; `camunda:*` attributes survive open, edit and save
  - evidence: spec ACC-EDIT-9: saved XML keeps camunda:assignee="demo" next to the new task; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open a user task with `camunda:assignee="demo"`, add a task, Ctrl+S, assert the saved XML keeps the attribute
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-EDIT-10` **Fit to viewport** - LOW; on open the whole diagram is zoomed to fit the canvas
  - evidence: spec ACC-EDIT-10: end event at x=2000 drawn inside the canvas box; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open a diagram with an element at x=2000, assert the element box lies inside the canvas box
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified

## Saving `SAVE`

Writing the diagram back to the file and tracking unsaved changes

- [x] `ACC-SAVE-11` **Ctrl+S saves edits** - CRITICAL; Ctrl+S writes the edited diagram, new elements included, to the file
  - evidence: spec ACC-SAVE-11: saved file holds <bpmn:task after Ctrl+S; failed before DEF-SAVE-14 fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - related: DEF-SAVE-14 - broke this on JupyterLab 4.6
  - test: add a task, Ctrl+S, read the file through the contents API, assert `bpmn:task`
  - test-tags: E2E
  - mechanism: 2026-10-14T10:36:18Z @kj every `commandStack.changed` writes `saveXML` output to the model and sets `model.dirty`, so Ctrl+S writes current XML
  - mechanism: 2026-10-14T10:11:17Z @kj every `commandStack.changed` writes `saveXML` output to the document model, so the JupyterLab save reads current XML
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:18Z @kj mechanism overridden; reason: JupyterLab 4.6 no longer marks the model dirty on fromString (DEF-SAVE-14)
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-SAVE-12` **Edit marks tab dirty** - MEDIUM; an edit marks the document tab dirty
  - evidence: spec ACC-SAVE-11 ACC-SAVE-12 ACC-SAVE-13: tab gains jp-mod-dirty after the edit; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: add a task, assert the tab has `jp-mod-dirty`
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-SAVE-13` **Save clears dirty mark** - MEDIUM; a save clears the dirty mark of the document tab
  - evidence: spec ACC-SAVE-11 ACC-SAVE-12 ACC-SAVE-13: jp-mod-dirty gone after Ctrl+S; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: add a task, Ctrl+S, assert the tab has no `jp-mod-dirty`
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-SAVE-14` **Close asks to save** - HIGH; closing a tab with unsaved edits asks to save, discard or cancel
  - evidence: spec ACC-SAVE-14: close icon over unsaved edits opened the dialog with Save; Cancel kept the widget; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: add a task, close the tab, assert a dialog with a Save button
  - test-tags: E2E
  - mechanism: 2026-10-14T10:11:17Z @kj JupyterLab document manager save-before-close dialog, driven by `context.model.dirty`
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-SAVE-15` **Reload from disk** - HIGH; "Reload from Disk" shows the file as it is on disk, also after an edit was saved
  - evidence: spec ACC-SAVE-15: EndEvent_Reloaded shown, task gone after reload; failed before DEF-SAVE-15 fix; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - related: DEF-SAVE-15 - the defect this criterion covers
  - test: add a task, Ctrl+S, overwrite the file through the API, run `docmanager:reload`, assert the canvas shows the new file
  - test-tags: E2E
  - mechanism: 2026-10-14T10:11:17Z @kj every model content change not raised by the widget sync re-imports the model XML
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-SAVE-16` **Edge: reload over unsaved edits** - MEDIUM; "Reload from Disk" confirmed over unsaved edits shows the disk content on the canvas
  - evidence: spec ACC-SAVE-16: reload confirmed over unsaved task shows EndEvent_Reloaded; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: add a task without saving, overwrite the file through the API, reload and confirm, assert the task is gone
  - test-tags: E2E
  - log: 2026-10-14T10:11:17Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified

## Colour `COLOR`

Element colouring through bpmn-js-color-picker

- [x] `ACC-COLOR-17` **Colour picker entry** - MEDIUM; the context pad of a selected element offers the colour picker
  - evidence: spec ACC-COLOR-17: context pad entry set-color visible; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: click `StartEvent_1`, assert context pad entry `[data-action="set-color"]`
  - test-tags: E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-COLOR-18` **Colour applies** - MEDIUM; a colour picked in the popup becomes the element fill in the saved XML
  - evidence: spec ACC-COLOR-18 ACC-COLOR-19: saved StartEvent_1 shape carries bioc:fill; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open the colour popup on `StartEvent_1`, pick a colour, Ctrl+S, assert `bioc:fill` on its shape
  - test-tags: E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-COLOR-19` **Popup beside the element** - MEDIUM; the colour popup opens next to the clicked context pad entry
  - evidence: spec ACC-COLOR-18 ACC-COLOR-19: popup parent is body, popup within 100 px of the pad entry; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open the colour popup, assert the popup box starts within 100 px of the pad entry box
  - test-tags: E2E
  - mechanism: 2026-10-14T10:11:40Z @kj MutationObserver moves each `.djs-popup-parent` added under the canvas to `document.body`, outside transformed ancestors
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-COLOR-20` **Group fill** - LOW; a coloured group shows its fill colour at 0.3 opacity
  - evidence: spec ACC-COLOR-20: group rect fill rgb(255, 204, 0), fill-opacity 0.3; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open a group carrying `bioc:fill`, assert the group rect fill and `fill-opacity` 0.3
  - test-tags: E2E
  - mechanism: 2026-10-14T10:11:40Z @kj `GroupColorModule` reads `bioc:fill` or `color:background-color` from `element.di` and styles the group rect
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:19Z @kj closed: verified
- [x] `ACC-COLOR-21` **Popup cleanup** - LOW; closing the diagram removes the popup elements it moved to the page body
  - evidence: spec ACC-COLOR-21: no body > .djs-popup-parent after closing the tab; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: open the colour popup, close the tab, assert no `body > .djs-popup-parent`
  - test-tags: E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified

## Export `EXPORT`

Export of the diagram to other formats

- [x] `ACC-EXPORT-22` **Export as SVG** - MEDIUM; context menu "Export Diagram as SVG" downloads `<file name>.svg` holding the diagram
  - evidence: spec ACC-EXPORT-22: download test-diagram.svg holds <svg; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: right-click the canvas, choose the item, assert download `test-diagram.svg` holding `<svg`
  - test-tags: E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified

## Realign connectors `ALIGN`

The Realign Connectors context menu command

- [x] `ACC-ALIGN-23` **Menu entry** - MEDIUM; the canvas context menu offers "Realign Connectors"
  - evidence: spec ACC-ALIGN-23: Realign Connectors visible in the canvas context menu; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: right-click the canvas, assert the item is visible
  - test-tags: E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-ALIGN-24` **Annotation widening** - MEDIUM; Realign widens a text annotation to 7 px per character of its text, clamped to 100-400 px
  - evidence: jest geometry.spec.ts 13/13 (100, 210, 400 px); spec ACC-ALIGN-24: 30-character annotation 100 -> 210 px; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: unit: width for 0, 30 and 100 characters is 100, 210 and 400; e2e: 30-character annotation reaches 210 px
  - test-tags: UNIT, E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-ALIGN-25` **Edge: annotation never narrowed** - LOW; an annotation already wider than its estimate keeps its width
  - evidence: spec ACC-ALIGN-24 ACC-ALIGN-25: 300 px annotation with 4 characters stays 300 px; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: run Realign on a 300 px annotation holding 4 characters, assert width 300
  - test-tags: E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
  - log: 2026-10-14T11:09:15Z @kj edited test "run Realign on a 300 px annotation holding 5 characters, assert width 300" -> "run Realign on a 300 px annotation holding 4 characters, assert width 300"; reason: test line said 5 characters; the spec and the evidence use 4 (review round 1)
- [x] `ACC-ALIGN-26` **Association re-route** - MEDIUM; Realign redraws an association whose end is off the target border as one segment between the two shape borders
  - evidence: jest getBorderIntersection on all four edges; spec ACC-ALIGN-26: both waypoints on shape borders; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: unit: border intersection on each edge; e2e: misaligned association, run Realign, assert both waypoints on shape borders
  - test-tags: UNIT, E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-ALIGN-27` **Edge: aligned association kept** - LOW; an association ending within 5 px of the target border keeps its waypoints
  - evidence: jest isPointOnBoundary 5 px yes, 6 px no; spec ACC-ALIGN-27: aligned association waypoints unchanged; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: unit: point 5 px off an edge is on the boundary, 6 px is not; e2e: aligned association keeps its waypoints
  - test-tags: UNIT, E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified

## Styling `STYLE`

Canvas and bpmn-js controls inside JupyterLab themes

- [x] `ACC-STYLE-28` **White canvas in dark theme** - LOW; the canvas background stays white under JupyterLab Dark
  - evidence: spec ACC-STYLE-28: canvas rgb(255, 255, 255) under JupyterLab Dark; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: switch to JupyterLab Dark, assert canvas background `rgb(255, 255, 255)`
  - test-tags: E2E
  - log: 2026-10-14T10:11:40Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-STYLE-29` **Controls at full opacity** - LOW; context pad entries render at opacity 1
  - evidence: spec ACC-STYLE-29: every context pad entry opacity 1; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: select an element, assert computed opacity 1 on every context pad entry
  - test-tags: E2E
  - log: 2026-10-14T10:11:41Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-STYLE-30` **Label editing text black** - LOW; text in the label editor is black
  - evidence: spec ACC-STYLE-30: .djs-direct-editing-content colour rgb(0, 0, 0); Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14
  - test: double-click a task, assert `.djs-direct-editing-content` colour `rgb(0, 0, 0)`
  - test-tags: E2E
  - log: 2026-10-14T10:11:41Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified

## Server extension `SERVER`

The Jupyter Server half of the package

- [x] `ACC-SERVER-31` **Server extension loads** - MEDIUM; the server extension loads and answers on `/jupyterlab-camunda-modeller-extension/hello`
  - evidence: pytest test_hello green (200, hello payload), make test 2026-10-14
  - test: pytest `test_hello`
  - test-tags: INTEGRATION
  - log: 2026-10-14T10:11:41Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-SERVER-32` **Endpoints need login** - HIGH; every endpoint of the extension rejects a request without authentication
  - evidence: check_auth.py: all endpoints require authentication; pytest test_hello_requires_authentication: 403
  - test: run `.github/scripts/check_auth.py`; pytest: unauthenticated request answers 403
  - test-tags: INTEGRATION
  - log: 2026-10-14T10:11:41Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified

## Packaging `PACK`

Build, install and activation of the npm and PyPI packages

- [x] `ACC-PACK-33` **Production build** - HIGH; `make build` builds the wheel and the sdist from a clean tree
  - evidence: make build exit 0 after clean, dist/ holds 1.0.31 .whl and .tar.gz, 2026-10-14
  - test: `make build`, assert one `.whl` and one `.tar.gz` in `dist/`
  - test-tags: FUNCTIONAL
  - log: 2026-10-14T10:11:41Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-PACK-34` **Prebuilt labextension** - HIGH; the installed wheel shows the labextension as enabled and OK
  - evidence: make install; jupyter labextension list: jupyterlab_camunda_modeller_extension enabled OK, 2026-10-14
  - test: `make install`, assert `jupyter labextension list` shows the extension `enabled OK`
  - test-tags: FUNCTIONAL
  - log: 2026-10-14T10:11:41Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
- [x] `ACC-PACK-35` **Activation message** - LOW; activation logs "JupyterLab extension jupyterlab_camunda_modeller_extension is activated!" exactly once
  - evidence: spec ACC-PACK-35 emits the activation console message once: line logged once; Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - test: load the lab page, count the console line
  - test-tags: E2E
  - log: 2026-10-14T10:11:41Z @kj added
  - log: 2026-10-14T10:36:20Z @kj closed: verified
  - log: 2026-10-14T12:10:48Z @kj edited evidence "spec should emit an activation console message: line logged once; Galata 25/25 green on JupyterLab 4.6.4, 2026-10-14" -> "spec ACC-PACK-35 emits the activation console message once: line logged once; Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14"; reason: spec renamed to carry its criterion id

## Toolbar `VIEW`

Buttons in the toolbar of the BPMN Modeler tab

- [x] `ACC-VIEW-39` **Zoom in button** - MEDIUM; the toolbar `+` button zooms the diagram in one step around the centre of the view
  - evidence: spec ACC-VIEW-39: zoom grows, view centre unchanged; fails without the toolbar (logs/galata-mutant-toolbar.log); Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - test: click `+`, assert the canvas zoom grows and the diagram point at the view centre stays
  - test-tags: E2E
  - mechanism: 2026-10-14T11:57:03Z @kj `zoomScroll.stepZoom(1)` without a position zooms around the viewport centre
  - log: 2026-10-14T11:57:03Z @kj added
  - log: 2026-10-14T11:57:03Z @kj requested by the Star Colonel 2026-10-14: "add toolbar in the BPMN view -> pan, zoom in, zoom out (similar like in our advanced image viewer)", then "also refresh"; pan renamed to fit
  - log: 2026-10-14T12:10:47Z @kj closed
- [x] `ACC-VIEW-40` **Zoom out button** - MEDIUM; the toolbar `-` button zooms the diagram out one step around the centre of the view
  - evidence: spec ACC-VIEW-40: zoom shrinks, view centre unchanged; fails without the toolbar; Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - test: click `-`, assert the canvas zoom shrinks and the diagram point at the view centre stays
  - test-tags: E2E
  - mechanism: 2026-10-14T11:57:04Z @kj `zoomScroll.stepZoom(-1)` without a position zooms around the viewport centre
  - log: 2026-10-14T11:57:04Z @kj added
  - log: 2026-10-14T12:10:47Z @kj closed
- [x] `ACC-VIEW-41` **Fit button** - MEDIUM; the toolbar button with the four-corners icon fits the whole diagram into the view, the same fit as on open
  - evidence: spec ACC-VIEW-41: four-corners icon shown; after two zoom-ins Fit restores the zoom and centre of the open; fails without the toolbar; Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - test: zoom in twice, click the fit button, assert zoom and view centre equal those right after open
  - test-tags: E2E
  - mechanism: 2026-10-14T11:57:04Z @kj `canvas.zoom('fit-viewport')`, the call `_loadDiagram` makes on open
  - log: 2026-10-14T11:57:04Z @kj added
  - log: 2026-10-14T12:10:47Z @kj closed
- [x] `ACC-VIEW-42` **Refresh button** - MEDIUM; the toolbar refresh button reloads the diagram from disk
  - evidence: spec ACC-VIEW-42: refresh shows the overwritten file, no dialog; fails without the toolbar; Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - test: overwrite the file through the API, click refresh, assert the canvas shows the new file and no dialog opened
  - test-tags: E2E
  - mechanism: 2026-10-14T11:57:04Z @kj `context.revert()`; the widget's contentChanged handler re-imports the diagram
  - log: 2026-10-14T11:57:04Z @kj added
  - log: 2026-10-14T12:10:47Z @kj closed
- [x] `ACC-VIEW-43` **Edge: refresh over unsaved edits** - HIGH; with unsaved edits the refresh button asks before reloading; Cancel keeps the edits and the dirty mark
  - evidence: spec ACC-VIEW-43: Cancel keeps the task and the dirty mark; Reload shows the disk file and clears the mark; fails without the toolbar; Galata 38/38 green on JupyterLab 4.6.4, 2026-10-14
  - test: add a task, overwrite the file, click refresh and Cancel: task kept, tab dirty; click refresh and Reload: disk content shown, tab clean
  - test-tags: E2E
  - mechanism: 2026-10-14T11:57:04Z @kj `showDialog` when `model.dirty`; `context.revert()` only on accept
  - log: 2026-10-14T11:57:04Z @kj added
  - log: 2026-10-14T12:10:47Z @kj closed

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
- [x] `ACC-COLOR-65` **Annotation colour bright, on bracket and text only** - HIGH; a coloured text annotation keeps an empty background; bracket and text use a bright saturated colour at full opacity: Blue #1976d2, Orange #ef6c00, Green #2e7d32, Red #d32f2f, Purple #8e24aa; the file keeps the picker colours
  - evidence: AnnotationColorHandler (src/widget.ts ANNOTATION_COLOR); spec ACC-COLOR-65: saved Red, runtime Red and saved Blue annotations rect fill none, bracket stroke and text fill rgb(211, 47, 47) and rgb(25, 118, 210), opacity 1; failed on the previous build with rgb(131, 19, 17) (logs/galata-def-color-25-before.log); Colour block 5/5 green (logs/galata-def-color-25.log); make test green, 2026-10-14
  - related: DEF-COLOR-24
  - related: DEF-COLOR-25
  - test: open annotations saved Red and Blue, colour another Red at runtime; assert rect fill none, bracket stroke and text fill rgb(211, 47, 47) for Red, rgb(25, 118, 210) for Blue, opacity 1
  - test-tags: FUNCTIONAL
  - mechanism: 2026-10-14T16:39:59Z @kj AnnotationColorHandler in src/widget.ts maps the di stroke of a picker colour to its bright colour and sets it on the annotation bracket and text after each render; rect stays fill none
  - mechanism: 2026-10-14T16:33:00Z @kj bpmn-js draws the annotation rect with fill none and the bracket and text in the di stroke colour; the colour module fills only groups
  - mechanism: 2026-10-14T14:17:02Z @kj bpmn-js draws the annotation rect with fill none, so only the dark stroke showed; the colour module paints the di fill on that rect, as it does for groups
  - log: 2026-10-14T14:17:02Z @kj added
  - log: 2026-10-14T14:35:51Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
  - log: 2026-10-14T16:33:00Z @kj reopened; evidence retired: FillColorHandler paints the di fill on the annotation rect at opacity 1 (src/widget.ts FILL_OPACITY); spec ACC-COLOR-65: saved and runtime-coloured annotations both rgb(255, 205, 210), opacity 1; fails on the previous build (logs/galata-mutant-color-65.log); ACC-COLOR-20 group spec still green; Galata Toolbar and Colour blocks green on JupyterLab 4.6.4 (logs/galata-button.log, logs/galata-button-fixed.log), 2026-10-14; reason: owner 2026-10-14: colour changes only the bracket and the text, never the background
  - log: 2026-10-14T16:33:00Z @kj edited title "Annotation fill at full strength" -> "Annotation colour on bracket and text only"; text "a coloured text annotation shows the fill colour as its background at full opacity, so Red reads as red: #ffcdd2 background, #831311 bracket and text" -> "HIGH; a coloured text annotation keeps an empty background; its bracket and text take the picker stroke colour at full opacity: Red gives #831311 bracket and text, no #ffcdd2 background"; test "open an annotation with bioc:fill #ffcdd2, and colour another Red at runtime; assert each annotation rect fill rgb(255, 205, 210), opacity 1" -> "open an annotation with bioc:fill #ffcdd2 bioc:stroke #831311, colour another Red at runtime; assert each rect fill none, bracket stroke and text fill rgb(131, 19, 17), opacity 1"; reason: owner corrected the requirement: no background fill
  - log: 2026-10-14T16:35:49Z @kj closed
  - log: 2026-10-14T16:39:59Z @kj reopened; evidence retired: colour module fills only groups again (src/widget.ts GroupColorHandler); spec ACC-COLOR-65: saved and runtime-coloured annotations rect fill none, bracket stroke and text fill rgb(131, 19, 17), opacity 1; failed on the 1.0.33 build with rect rgb(255, 205, 210) (logs/galata-def-color-24-before.log); Colour block 5/5 green incl. ACC-COLOR-20 (logs/galata-def-color-24.log); make test green, 2026-10-14; reason: owner 2026-10-14: strong means brighter, more saturated, not the dark picker stroke
  - log: 2026-10-14T16:39:59Z @kj edited title "Annotation colour on bracket and text only" -> "Annotation colour bright, on bracket and text only"; text "a coloured text annotation keeps an empty background; its bracket and text take the picker stroke colour at full opacity: Red gives #831311 bracket and text, no #ffcdd2 background" -> "a coloured text annotation keeps an empty background; bracket and text use a bright saturated colour at full opacity: Blue #1976d2, Orange #ef6c00, Green #2e7d32, Red #d32f2f, Purple #8e24aa; the file keeps the picker colours"; test "open an annotation with bioc:fill #ffcdd2 bioc:stroke #831311, colour another Red at runtime; assert each rect fill none, bracket stroke and text fill rgb(131, 19, 17), opacity 1" -> "open annotations saved Red and Blue, colour another Red at runtime; assert rect fill none, bracket stroke and text fill rgb(211, 47, 47) for Red, rgb(25, 118, 210) for Blue, opacity 1"; reason: owner clarified strong: brighter, more saturated colours
  - log: 2026-10-14T16:40:00Z @kj closed

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

## BPMN Validation `VALID`

bpmn-validate CLI, its checks and the agent skill that points at it

- [x] `ACC-VALID-44` **Command installed** - HIGH; installing the wheel puts a `bpmn-validate` command on PATH
  - evidence: [project.scripts] bpmn-validate in pyproject.toml; after make install /opt/conda/bin/bpmn-validate exists; jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_installed_command_runs runs it with --help, exit 0; pytest 27/27 green, make test green, 2026-10-14
  - test: install the wheel, run `bpmn-validate --help`, assert exit 0
  - test-tags: INTEGRATION
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-45` **Help names checks and exit codes** - MEDIUM; `bpmn-validate --help` lists every check code, the exit codes and worked examples
  - evidence: help epilog generated from CHECKS lists every code, exit codes 0/1/2, output format and examples (cli.py); jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_help_names_every_check_and_exit_code; pytest 27/27 green, make test green, 2026-10-14
  - test: run --help, assert each check code and exit code 0, 1, 2 appear
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-46` **Exit codes** - HIGH; exit 0 when no file has an error, 1 when any file has an error, 2 when a file cannot be read or the arguments are wrong; warnings never change the exit code
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_exit_codes: clean and template files 0, a file with a missing reference 1, a missing path 2 with the path on stderr, no arguments 2; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a clean file, a malformed file, a missing path; assert 0, 1, 2
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-47` **Text output** - MEDIUM; one line per issue: `path:line:column: severity code: message`, then one summary line per file
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_text_output_format asserts `path:line:` prefix, `error missing-reference:` and the summary line; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a file with one error, assert the line format
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-48` **JSON output** - MEDIUM; `--json` prints the same issues as one JSON document with path, severity, code, message, line, column and element per issue
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_json_output_matches_text parses --json output: paths in order, issue keys severity, code, message, line, column, element, error count; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: run --json on a file with issues, parse stdout, compare with the text run
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
  - log: 2026-10-14T14:35:51Z @kj amended text "`--json` prints the same issues as one JSON document with path, severity, code, message, line and column per issue" -> "`--json` prints the same issues as one JSON document with path, severity, code, message, line, column and element per issue"
  - log: 2026-10-14T14:35:51Z @kj edited evidence "jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_json_output_matches_text parses --json output: paths in order, issue keys severity, code, message, line, column, error count; pytest 27/27 green, make test green, 2026-10-14" -> "jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_json_output_matches_text parses --json output: paths in order, issue keys severity, code, message, line, column, element, error count; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14"; reason: issues gained the element field (ACC-VALID-79)
- [x] `ACC-VALID-49` **Malformed XML** - HIGH; XML that does not parse is reported as error `malformed-xml` with the parser's line, column and message; no other check runs on that file
  - evidence: expat error with lineno, offset and ErrorString, early return (validate.py); jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_malformed_xml_reports_parser_position_and_stops; pytest 27/27 green, make test green, 2026-10-14
  - test: validate an unclosed tag, assert one malformed-xml error at its line
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-50` **Empty file** - MEDIUM; an empty or whitespace-only file is reported as warning `empty-file`, because the modeller opens it as a new diagram
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_empty_file_is_a_warning for empty and whitespace-only text, exit 0 via test_exit_codes; pytest 27/27 green, make test green, 2026-10-14
  - test: validate an empty file, assert one empty-file warning and exit 0
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-51` **DOCTYPE rejected** - HIGH; a file with a DOCTYPE is reported as error `doctype` and parsing stops before any entity is expanded
  - evidence: StartDoctypeDeclHandler raises before the internal subset is read (validate.py); jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_doctype_rejected_before_entity_expansion with a 10^9-expansion entity payload returns under 1 s; without the handler the test ran over 5 min; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a file declaring an entity used 10^6 times, assert doctype error, fast exit
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:54Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-52` **Not a BPMN file** - HIGH; a root element other than `definitions` in the BPMN 2.0 model namespace is reported as error `not-bpmn`; no other check runs
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_not_bpmn_root_is_an_error_and_stops for an SVG root and definitions in another namespace; pytest 27/27 green, make test green, 2026-10-14
  - test: validate an SVG file and a definitions element in another namespace
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-53` **Duplicate id** - HIGH; two elements with the same id are reported as error `duplicate-id` at the second element, naming the line of the first
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_duplicate_id_names_the_first_line; mutant without the check fails it; pytest 27/27 green, make test green, 2026-10-14
  - test: validate two tasks with id Task_1
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-54` **Missing reference** - HIGH; a reference to an id that no element has is reported as error `missing-reference`: sourceRef, targetRef, bpmnElement, attachedToRef, default, processRef, the event definition refs, and incoming or outgoing text
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_missing_target_ref_is_an_error and test_missing_bpmn_element_and_outgoing_text_are_errors; mutant without the check fails 5 tests; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a sequence flow whose targetRef names no element
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-55` **No diagram** - HIGH; a file with no BPMNDiagram is reported as error `no-diagram`, because bpmn-js stops with 'no diagram to display'
  - evidence: no-diagram issued when no BPMNDiagram exists, missing-shape then skipped (validate.py); bpmn-js throws 'no diagram to display' (BpmnTreeWalker.js:173); jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_no_diagram_is_an_error; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a process with no bpmndi section
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-56` **Element without shape** - MEDIUM; a flow node, flow, annotation, data reference, participant, lane or group with no BPMNShape or BPMNEdge is reported as warning `missing-shape`, because the modeller does not show it
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_element_without_shape_is_a_warning; collapsed subprocess children drawn in a second plane pass (test_collaboration_...); pytest 27/27 green, make test green, 2026-10-14
  - test: validate a task with no BPMNShape
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-57` **Process without start event** - MEDIUM; a process holding flow nodes but no start event is reported as warning `no-start-event`
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_process_without_start_or_end_event; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a process with one task
  - test-tags: UNIT
  - log: 2026-10-14T13:57:31Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-58` **Process without end event** - MEDIUM; a process holding flow nodes but no end event is reported as warning `no-end-event`
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_process_without_start_or_end_event and test_template_reports_only_its_modelling_warnings; mutant without the check fails 2 tests; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a process with a start event and a task
  - test-tags: UNIT
  - log: 2026-10-14T13:57:32Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-59` **Start event with incoming flow** - LOW; a start event that is the target of a sequence flow is reported as warning `start-event-incoming`
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_start_event_with_incoming_flow; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a flow targeting StartEvent_1
  - test-tags: UNIT
  - log: 2026-10-14T13:57:32Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-60` **End event with outgoing flow** - LOW; an end event that is the source of a sequence flow is reported as warning `end-event-outgoing`
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_end_event_with_outgoing_flow; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a flow leaving EndEvent_1
  - test-tags: UNIT
  - log: 2026-10-14T13:57:32Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-61` **Disconnected flow node** - MEDIUM; a flow node with no incoming and no outgoing sequence flow is reported as warning `disconnected`; boundary events, event subprocesses and nodes in an ad-hoc subprocess are skipped
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_disconnected_node_but_not_boundary_event; compensation task skipped in the collaboration fixture; boundary mutant fails the test; pytest 27/27 green, make test green, 2026-10-14
  - test: validate a task with no flows, and a boundary event
  - test-tags: UNIT
  - log: 2026-10-14T13:57:32Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-62` **Edge: valid diagrams report nothing** - HIGH; diagrams the modeller writes report no error: a connected start-task-end diagram and the repository sample `.resources/diagram.bpmn` report nothing, a collaboration with lanes, a message flow and a collapsed subprocess reports only its lone inner task as `disconnected`, the new-diagram template reports only `no-end-event` and `disconnected`
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py: test_connected_diagram_reports_nothing, test_repository_sample_written_by_the_modeller_reports_nothing, test_collaboration_with_lanes_process_annotation_and_collapsed_subprocess (only Inner_A disconnected), test_template_reports_only_its_modelling_warnings, test_gateway_with_named_flows_and_default_reports_nothing; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: validate the Galata fixtures and the empty-diagram template
  - test-tags: UNIT
  - log: 2026-10-14T13:57:32Z @kj added
  - log: 2026-10-14T14:12:54Z @kj amended text "the modeller's new-diagram template and a connected start-task-end diagram with full DI produce no error and no warning other than the template's expected modelling warnings" -> "HIGH; diagrams the modeller writes report no error: a connected start-task-end diagram and the repository sample `.resources/diagram.bpmn` report nothing, a collaboration with lanes, a message flow and a collapsed subprocess reports only its lone inner task as `disconnected`, the new-diagram template reports only `no-end-event` and `disconnected`"
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
  - log: 2026-10-14T14:35:51Z @kj edited evidence "jupyterlab_camunda_modeller_extension/tests/test_validate.py: test_connected_diagram_reports_nothing, test_repository_sample_written_by_the_modeller_reports_nothing, test_collaboration_with_lanes_and_collapsed_subprocess_reports_only_inner_task, test_template_reports_only_its_modelling_warnings; pytest 27/27 green, make test green, 2026-10-14" -> "jupyterlab_camunda_modeller_extension/tests/test_validate.py: test_connected_diagram_reports_nothing, test_repository_sample_written_by_the_modeller_reports_nothing, test_collaboration_with_lanes_process_annotation_and_collapsed_subprocess (only Inner_A disconnected), test_template_reports_only_its_modelling_warnings, test_gateway_with_named_flows_and_default_reports_nothing; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14"; reason: collaboration test renamed when the process annotation was added; gateway fixture added
- [x] `ACC-VALID-63` **Agent skill shipped** - MEDIUM; the wheel installs `.agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md` under `share/jupyter/agents/skills/`, identical to the repository copy
  - evidence: shared-data line in pyproject.toml; after make install /opt/conda/share/jupyter/agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md exists; jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_installed_skill_matches_repository_copy; pytest 27/27 green, make test green, 2026-10-14
  - test: make install, pytest compares the sys.prefix copy with the repository copy
  - test-tags: INTEGRATION
  - log: 2026-10-14T13:57:32Z @kj added
  - log: 2026-10-14T14:12:55Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-64` **README documents the command and the skill** - LOW; README shows `bpmn-validate` usage and the two lines that link the skill for agents
  - evidence: README section 'Validating BPMN files' shows two bpmn-validate commands, the output format and exit codes; subsection 'Agent skill' carries the sys.prefix link line and the clone link line; read 2026-10-14
  - test: read README
  - test-tags: MANUAL
  - log: 2026-10-14T13:57:32Z @kj added
  - log: 2026-10-14T14:12:56Z @kj closed; reason: evidence names the tests and the mutation results
- [x] `ACC-VALID-66` **Skill names the standard colours** - MEDIUM; the agent skill lists the colour picker's five colours with their fill and stroke hex values, and the four shape attributes and two edge attributes the modeller writes, so an agent colours elements the way the picker does
  - evidence: .agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md lists Blue, Orange, Green, Red, Purple with fill/stroke hex and bioc:fill, color:background-color, bioc:stroke, color:border-color; jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_skill_lists_the_colour_picker_palette reads bpmn-js-color-picker COLORS; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: pytest compares each fill and stroke in bpmn-js-color-picker COLORS with SKILL.md
  - test-tags: UNIT
  - log: 2026-10-14T14:17:03Z @kj added
  - log: 2026-10-14T14:35:51Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-67` **Skill: red marks problems** - MEDIUM; the agent skill says red goes only on error or problem shapes and on negative decision outcomes, and a red text annotation only where the note points the analyst at a problem to solve
  - evidence: .agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md rule: red only on error or problem shapes and negative decision outcomes, red text annotation only to point the analyst at a problem; read 2026-10-14
  - test: read SKILL.md
  - test-tags: MANUAL
  - log: 2026-10-14T14:18:50Z @kj added
  - log: 2026-10-14T14:35:51Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-68` **Skill: task type by certainty** - MEDIUM; the agent skill says a task stays a plain task while it is undecided whether a person or a system does it, and becomes a service task when the step is likely automatic
  - evidence: .agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md rule: plain bpmn:task while person or system is undecided, bpmn:serviceTask when likely automatic; read 2026-10-14
  - test: read SKILL.md
  - test-tags: MANUAL
  - log: 2026-10-14T14:18:50Z @kj added
  - log: 2026-10-14T14:35:51Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-69` **Skill: explicit gateway conditions** - MEDIUM; the agent skill says every outgoing flow of a deciding gateway carries its condition as the flow name and one flow is set as the default
  - evidence: .agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md rule: name every outgoing flow of an exclusive or inclusive gateway with its condition and set one as default, naming checks unnamed-condition and no-default-flow; read 2026-10-14
  - test: read SKILL.md
  - test-tags: MANUAL
  - log: 2026-10-14T14:18:50Z @kj added
  - log: 2026-10-14T14:35:51Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-70` **Unnamed gateway condition** - MEDIUM; a flow leaving an exclusive or inclusive gateway with two or more outgoing flows, other than the default flow, with no name is reported as warning `unnamed-condition`
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_unnamed_condition_on_a_non_default_flow, test_unnamed_default_flow_is_not_reported, test_parallel_gateway_needs_no_conditions_or_default; failed before the check; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: validate a gateway with two outgoing flows, one unnamed and not default
  - test-tags: UNIT
  - log: 2026-10-14T14:18:50Z @kj added
  - log: 2026-10-14T14:35:51Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-71` **Gateway without default flow** - MEDIUM; an exclusive or inclusive gateway with two or more outgoing flows and no default flow is reported as warning `no-default-flow`
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_gateway_without_default_flow; failed before the check; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: validate a gateway with two named outgoing flows and no default attribute
  - test-tags: UNIT
  - log: 2026-10-14T14:18:50Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-72` **Skill: process annotation above the pools** - LOW; the agent skill allows one process annotation: a text annotation above the pools, connected by an association to the pool it describes, very brief, in plain English for readers who are not native speakers
  - evidence: .agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md rule: one process annotation above the pools with a bpmn:association to the pool, brief plain English; the collaboration fixture with that association validates clean (jupyterlab_camunda_modeller_extension/tests/test_validate.py); read 2026-10-14
  - test: read SKILL.md
  - test-tags: MANUAL
  - log: 2026-10-14T14:19:33Z @kj added
  - log: 2026-10-14T14:22:45Z @kj amended title "Skill: process description above the pools" -> "Skill: process annotation above the pools"; text "the agent skill allows one text annotation above the pools that describes the process, very brief, in plain English for readers who are not native speakers" -> "the agent skill allows one process annotation: a text annotation above the pools, connected by an association to the pool it describes, very brief, in plain English for readers who are not native speakers"
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-73` **Skill: ask before modelling starts, tasks and decisions** - MEDIUM; the agent skill tells the agent to ask the user, in one short round before modelling, what starts the process (manual, message, timer, signal or condition), who or what does each step, and the condition at each decision; only as many questions as the design needs
  - evidence: .agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md rule: before modelling a start event, task types or decisions ask one short round about the start trigger (manual, message, timer, signal, condition), who or what does each step, and each decision condition; read 2026-10-14
  - test: read SKILL.md
  - test-tags: MANUAL
  - log: 2026-10-14T14:24:27Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-74` **Unreachable flow node** - HIGH; a flow node with sequence flows that no path from a start event in its process or subprocess reaches is reported as warning `unreachable`; paths through boundary events of reached activities count; a scope with no start event starts from its nodes with no incoming flow
  - evidence: jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_unreachable_chain_and_loop (A, B, X, Y reported), test_path_through_boundary_event_is_reachable, test_scope_without_start_event_starts_from_nodes_without_incoming_flow; chain test failed before the check; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: validate a process with start-end plus a task chain and a two-task loop that nothing enters; assert unreachable for each of them, none for a boundary-event path
  - test-tags: UNIT
  - log: 2026-10-14T14:25:06Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-75` **Validate button lists the issues** - HIGH; the toolbar Validate button checks the diagram as shown, unsaved edits included, and opens a dialog with one row per issue: severity, element id and message
  - evidence: toolbar Validate button posts context.model.toString() to the validate endpoint and shows a dialog table severity, element, message (src/widget.ts); spec ACC-VALID-75 adds a palette task without saving and finds it listed as disconnected; failed on the build without the button (logs/galata-mutant-validate-button.log); Galata Toolbar and Colour blocks green on JupyterLab 4.6.4 (logs/galata-button.log, logs/galata-button-fixed.log), 2026-10-14
  - test: add a task without saving, click Validate, assert the dialog lists the new task as disconnected
  - test-tags: FUNCTIONAL
  - log: 2026-10-14T14:28:41Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-76` **Validate dialog with no issues** - MEDIUM; when the diagram has no issue the Validate dialog says No issues found
  - evidence: spec ACC-VALID-76: connected start-end diagram, dialog says No issues found; failed on the build without the button (logs/galata-mutant-validate-button.log); Galata Toolbar and Colour blocks green on JupyterLab 4.6.4 (logs/galata-button.log, logs/galata-button-fixed.log), 2026-10-14
  - test: open a connected start-end diagram, click Validate, assert the text
  - test-tags: FUNCTIONAL
  - log: 2026-10-14T14:28:41Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-77` **Validate endpoint** - HIGH; POST jupyterlab-camunda-modeller-extension/validate with body {content} returns {issues} from the same checks as bpmn-validate
  - evidence: ValidateRouteHandler in routes.py; jupyterlab_camunda_modeller_extension/tests/test_routes.py::test_validate_returns_the_issues_of_the_posted_content: one missing-reference issue naming element F with all six keys; failed with 404 before the route; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: pytest posts a diagram with a missing reference, asserts one missing-reference issue
  - test-tags: INTEGRATION
  - log: 2026-10-14T14:28:41Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-78` **Validate endpoint requires authentication** - HIGH; the validate endpoint refuses a request without a token
  - evidence: post() carries tornado.web.authenticated; jupyterlab_camunda_modeller_extension/tests/test_routes.py::test_validate_requires_authentication 403 without token; .github/scripts/check_auth.py passes; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: pytest posts without the token, asserts 403; check_auth.py passes
  - test-tags: INTEGRATION
  - log: 2026-10-14T14:28:41Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-79` **Issue names its element** - MEDIUM; every issue carries `element`, the id of the element it concerns, empty when the file does not parse; the --json output and the endpoint include it
  - evidence: Issue.element set from the node at every site, flow node id for incoming/outgoing, empty for parse failures (validate.py); jupyterlab_camunda_modeller_extension/tests/test_validate.py::test_issue_names_its_element; failed before the field; make test green (39 pytest, 13 Jest, auth gate), 2026-10-14
  - test: validate a missing reference, assert element is the referencing flow id
  - test-tags: UNIT
  - log: 2026-10-14T14:28:41Z @kj added
  - log: 2026-10-14T14:35:52Z @kj closed; reason: evidence names the tests, the failing-first logs and the run
- [x] `ACC-VALID-80` **Skill: validation mandatory after every agent edit** - HIGH; the agent skill makes running `bpmn-validate` on a .bpmn file mandatory after every create or edit of that file by the agent, before it replies to the user, and not done until exit 0
  - evidence: SKILL.md first Validate rule: 'Mandatory: after every create or edit you make to a .bpmn file, run bpmn-validate on it before replying to the user. Exit 1 means errors: fix every one, rerun. Not done until exit 0'; installed copy identical (test_installed_skill_matches_repository_copy), make test green, 2026-10-14
  - test: read SKILL.md, first Validate rule
  - test-tags: MANUAL
  - log: 2026-10-14T14:57:29Z @kj added
  - log: 2026-10-14T14:58:23Z @kj closed
  - log: 2026-10-14T15:01:51Z @kj edited evidence "SKILL.md first Validate rule: 'Mandatory: after every create or edit of a .bpmn file, run bpmn-validate on it before replying to the user. Exit 1 means errors: fix every one, rerun. Not done until exit 0'; installed copy identical (test_installed_skill_matches_repository_copy), make test green, 2026-10-14" -> "SKILL.md first Validate rule: 'Mandatory: after every create or edit you make to a .bpmn file, run bpmn-validate on it before replying to the user. Exit 1 means errors: fix every one, rerun. Not done until exit 0'; installed copy identical (test_installed_skill_matches_repository_copy), make test green, 2026-10-14"; reason: review round 3: the rule now names the agent as the actor, matching the owner's 'each ai edit or create'

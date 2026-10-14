import { expect, test } from '@jupyterlab/galata';
import * as fs from 'fs';

import {
  addTaskWithPalette,
  bpmn,
  canvasContextMenu,
  countOfType,
  edge,
  element,
  openDiagram,
  readFile,
  save,
  shape,
  START_ONLY,
  tab,
  writeFile
} from './helpers';

const NAME = 'test-diagram.bpmn';

const RELOADED = bpmn(
  '    <bpmn:endEvent id="EndEvent_Reloaded"/>',
  shape('EndEvent_Reloaded', 260, 160, 36, 36)
);

test.describe('File type', () => {
  test('ACC-FILE-1 registers the bpmn file type', async ({ page }) => {
    const fileType = await page.evaluate(() => {
      const ft = (window as any).jupyterapp.docRegistry.getFileType('bpmn');
      return { extensions: ft.extensions, displayName: ft.displayName };
    });
    expect(fileType.extensions).toContain('.bpmn');
    expect(fileType.displayName).toBe('BPMN Diagram');
  });

  test('ACC-FILE-2 shows the BPMN icon in the file browser', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await page.filebrowser.openDirectory(tmpPath);
    const icon = page
      .locator('.jp-DirListing-item', { hasText: NAME })
      .locator('.jp-DirListing-itemIcon svg');
    await expect(icon).toHaveAttribute('data-icon', 'bpmn:icon');
  });

  /**
   * Open a file in the text editor and put the cursor before `marker`.
   */
  async function openInEditor(
    page: any,
    path: string,
    marker: string
  ): Promise<void> {
    await page.evaluate(async (filePath: string) => {
      await (window as any).jupyterapp.commands.execute('docmanager:open', {
        path: filePath,
        factory: 'Editor'
      });
    }, path);
    await page.waitForSelector('.jp-FileEditor .cm-content');
    await page.evaluate((text: string) => {
      const editor = (window as any).jupyterapp.shell.currentWidget.content
        .editor;
      const offset = editor.model.sharedModel.getSource().indexOf(text);
      editor.setCursorPosition(editor.getPositionAt(offset));
      editor.focus();
    }, marker);
  }

  async function editorSource(page: any): Promise<string> {
    return page.evaluate(() =>
      (
        window as any
      ).jupyterapp.shell.currentWidget.content.editor.model.sharedModel.getSource()
    );
  }

  test('ACC-FILE-36 text editor highlights a bpmn file as XML', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openInEditor(page, `${tmpPath}/${NAME}`, '<bpmn:process');
    const tagColor = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--jp-mirror-editor-tag-color)';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(
      page
        .locator('.jp-FileEditor .cm-line span', { hasText: /^bpmn:process$/ })
        .first()
    ).toHaveCSS('color', tagColor);
  });

  test('ACC-FILE-37 text editor completes the closing tag', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openInEditor(page, `${tmpPath}/${NAME}`, '<bpmn:startEvent');
    await page.keyboard.type('<bpmn:task>');
    await expect
      .poll(() => editorSource(page))
      .toContain('<bpmn:task></bpmn:task><bpmn:startEvent');
  });

  test('ACC-FILE-38 text editor folds an element', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openInEditor(page, `${tmpPath}/${NAME}`, '<bpmn:process');
    await page.evaluate(() =>
      (window as any).jupyterapp.commands.execute('codemirror:fold-current')
    );
    await expect(
      page.locator('.jp-FileEditor .cm-foldPlaceholder')
    ).toBeVisible();
    await expect(
      page.locator('.jp-FileEditor .cm-line', { hasText: 'bpmn:startEvent' })
    ).toHaveCount(0);
  });
});

test.describe('Editing', () => {
  test('ACC-EDIT-5 palette task tool adds a task', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    expect(await countOfType(page, 'bpmn:Task')).toBe(0);
    await addTaskWithPalette(page);
    expect(await countOfType(page, 'bpmn:Task')).toBe(1);
  });

  test('ACC-EDIT-6 empty file opens with one start event', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/empty.bpmn`, '');
    await openDiagram(page, `${tmpPath}/empty.bpmn`);
    await expect(
      page.locator('.jp-BpmnWidget [data-element-id="StartEvent_1"]')
    ).toBeVisible();
    expect(await countOfType(page, 'bpmn:StartEvent')).toBe(1);
  });

  test('ACC-EDIT-7 invalid file shows the load error', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/broken.bpmn`, 'this is not xml');
    await page.evaluate(async (path: string) => {
      await (window as any).jupyterapp.commands.execute('docmanager:open', {
        path,
        factory: 'BPMN Modeler'
      });
    }, `${tmpPath}/broken.bpmn`);
    const error = page.locator('.jp-BpmnWidget-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Failed to load BPMN diagram');
    await expect(error.locator('p')).toContainText('Error:');
    expect(
      ((await error.locator('p').textContent()) ?? '').length
    ).toBeGreaterThan('Error: '.length);
  });

  test('ACC-EDIT-8 markup in the parser message stays text', async ({
    page,
    tmpPath
  }) => {
    // The XML parser reports a mismatched closing tag by quoting it.
    await writeFile(page, `${tmpPath}/markup.bpmn`, '<a></img>');
    await page.evaluate(async (path: string) => {
      await (window as any).jupyterapp.commands.execute('docmanager:open', {
        path,
        factory: 'BPMN Modeler'
      });
    }, `${tmpPath}/markup.bpmn`);
    const error = page.locator('.jp-BpmnWidget-error');
    await expect(error).toBeVisible();
    await expect(error.locator('p')).toContainText('unparsable content </img>');
    await expect(error.locator('img')).toHaveCount(0);
  });

  test('ACC-EDIT-9 camunda attributes survive edit and save', async ({
    page,
    tmpPath
  }) => {
    const xml = bpmn(
      '    <bpmn:userTask id="UserTask_1" name="Review" camunda:assignee="demo"/>',
      shape('UserTask_1', 160, 120, 100, 80)
    );
    await writeFile(page, `${tmpPath}/${NAME}`, xml);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await save(page, NAME);
    const saved = await readFile(page, `${tmpPath}/${NAME}`);
    expect(saved).toContain('<bpmn:task');
    expect(saved).toMatch(/<bpmn:userTask[^>]*camunda:assignee="demo"/);
  });

  test('ACC-EDIT-10 diagram is fitted to the viewport on open', async ({
    page,
    tmpPath
  }) => {
    const xml = bpmn(
      '    <bpmn:startEvent id="StartEvent_1"/>\n    <bpmn:endEvent id="EndEvent_1"/>',
      shape('StartEvent_1', 100, 100, 36, 36) +
        '\n' +
        shape('EndEvent_1', 2000, 1500, 36, 36)
    );
    await writeFile(page, `${tmpPath}/${NAME}`, xml);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const canvas = await page
      .locator('.jp-BpmnWidget .djs-container')
      .boundingBox();
    const far = await page
      .locator('.jp-BpmnWidget [data-element-id="EndEvent_1"] .djs-visual')
      .boundingBox();
    // 1 px for the circle stroke drawn outside the 36 px bounds.
    expect(far!.x).toBeGreaterThanOrEqual(canvas!.x - 1);
    expect(far!.y).toBeGreaterThanOrEqual(canvas!.y - 1);
    expect(far!.x + far!.width).toBeLessThanOrEqual(
      canvas!.x + canvas!.width + 1
    );
    expect(far!.y + far!.height).toBeLessThanOrEqual(
      canvas!.y + canvas!.height + 1
    );
  });
});

test.describe('Saving', () => {
  test('ACC-SAVE-11 ACC-SAVE-12 ACC-SAVE-13 edit marks dirty, Ctrl+S saves and clears it', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await expect(tab(page, NAME)).not.toHaveClass(/jp-mod-dirty/);
    await addTaskWithPalette(page);
    await expect(tab(page, NAME)).toHaveClass(/jp-mod-dirty/);
    await save(page, NAME);
    const saved = await readFile(page, `${tmpPath}/${NAME}`);
    expect(saved).toContain('<bpmn:task');
  });

  test('ACC-SAVE-14 closing with unsaved edits asks to save', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await tab(page, NAME).locator('.lm-TabBar-tabCloseIcon').click();
    const dialog = page.locator('.jp-Dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.locator('.jp-Dialog-button', { hasText: 'Save' })
    ).toBeVisible();
    await dialog.locator('.jp-Dialog-button', { hasText: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('.jp-BpmnWidget')).toBeVisible();
  });

  const NAMED_TASK = bpmn(
    '    <bpmn:task id="Task_1" name="Old label"/>',
    shape('Task_1', 200, 120, 100, 80)
  );

  async function renameTask(page: any): Promise<void> {
    await page.locator('.jp-BpmnWidget [data-element-id="Task_1"]').dblclick();
    await expect(page.locator('.djs-direct-editing-content')).toBeVisible();
    await page.keyboard.press('Control+a');
    await page.keyboard.type('New label');
  }

  /**
   * Resolves on the next 'completed' save state of the current document.
   */
  async function nextSaveCompleted(page: any): Promise<() => Promise<void>> {
    await page.evaluate(() => {
      const context = (window as any).jupyterapp.shell.currentWidget.context;
      (window as any).saveCompleted = new Promise<void>(resolve => {
        const onState = (_: any, state: string) => {
          if (state === 'completed') {
            context.saveState.disconnect(onState);
            resolve();
          }
        };
        context.saveState.connect(onState);
      });
    });
    return () => page.evaluate(() => (window as any).saveCompleted);
  }

  async function closeAndSave(page: any): Promise<void> {
    await tab(page, NAME).locator('.lm-TabBar-tabCloseIcon').click();
    const dialog = page.locator('.jp-Dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('.jp-Dialog-button', { hasText: 'Save' }).click();
    await expect(page.locator('.jp-BpmnWidget')).toHaveCount(0);
  }

  test('DEF-SAVE-16 closing with the label editor open asks and saves the label', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, NAMED_TASK);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await renameTask(page);
    await closeAndSave(page);
    expect(await readFile(page, `${tmpPath}/${NAME}`)).toContain(
      'name="New label"'
    );
  });

  test('DEF-SAVE-17 autosave while the label editor is open keeps the tab dirty', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, NAMED_TASK);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await renameTask(page);
    const saved = await nextSaveCompleted(page);
    // Autosave calls context.save(); the label editor stays open
    await page.evaluate(() =>
      (window as any).jupyterapp.shell.currentWidget.context.save()
    );
    await saved();
    await expect(tab(page, NAME)).toHaveClass(/jp-mod-dirty/);
    await closeAndSave(page);
    expect(await readFile(page, `${tmpPath}/${NAME}`)).toContain(
      'name="New label"'
    );
  });

  test('DEF-SAVE-17 edit made while the save is in flight keeps the tab dirty', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await page.route(`**/api/contents/**${NAME}*`, async route => {
      if (route.request().method() === 'PUT') {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      await route.continue();
    });
    await page.locator('.jp-BpmnWidget .djs-container').click({
      position: { x: 5, y: 5 }
    });
    const saved = await nextSaveCompleted(page);
    const put = page.waitForRequest(
      request => request.method() === 'PUT' && request.url().includes(NAME)
    );
    await page.keyboard.press('Control+s');
    await put;
    await page.evaluate(() => {
      const modeler = (window as any).jupyterapp.shell.currentWidget.content
        ._modeler;
      modeler
        .get('modeling')
        .createShape(
          { type: 'bpmn:EndEvent' },
          { x: 400, y: 178 },
          modeler.get('canvas').getRootElement()
        );
    });
    await saved();
    await expect(tab(page, NAME)).toHaveClass(/jp-mod-dirty/);
    await closeAndSave(page);
    expect(await readFile(page, `${tmpPath}/${NAME}`)).toContain(
      '<bpmn:endEvent'
    );
  });

  test('DEF-SAVE-18 Ctrl+S in the label editor saves the typed label', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await expect(page.locator('.djs-direct-editing-content')).toBeVisible();
    await page.keyboard.type('Typed label');
    await page.keyboard.press('Control+s');
    await expect(tab(page, NAME)).not.toHaveClass(/jp-mod-dirty/);
    expect(await readFile(page, `${tmpPath}/${NAME}`)).toContain(
      'name="Typed label"'
    );
  });

  test('DEF-SAVE-18 Ctrl+S with CapsLock in the label editor saves the typed label', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await expect(page.locator('.djs-direct-editing-content')).toBeVisible();
    await page.keyboard.type('Typed label');
    // key 'S' with keyCode 83 and no Shift, as CapsLock sends it
    await page.keyboard.press('Control+S');
    await expect(tab(page, NAME)).not.toHaveClass(/jp-mod-dirty/);
    expect(await readFile(page, `${tmpPath}/${NAME}`)).toContain(
      'name="Typed label"'
    );
  });

  async function reloadFromDisk(
    page: any,
    overUnsavedEdits: boolean
  ): Promise<void> {
    // Not awaited: over unsaved edits the command waits for its own dialog.
    await page.evaluate(() => {
      void (window as any).jupyterapp.commands.execute('docmanager:reload');
    });
    if (overUnsavedEdits) {
      const dialog = page.locator('.jp-Dialog');
      await expect(dialog).toBeVisible();
      await dialog.locator('.jp-mod-accept').click();
    }
  }

  test('ACC-SAVE-15 reload from disk after a saved edit', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await save(page, NAME);
    await writeFile(page, `${tmpPath}/${NAME}`, RELOADED);
    await reloadFromDisk(page, false);
    await expect(
      page.locator('.jp-BpmnWidget [data-element-id="EndEvent_Reloaded"]')
    ).toBeVisible();
    expect(await countOfType(page, 'bpmn:Task')).toBe(0);
  });

  test('ACC-SAVE-16 reload from disk over unsaved edits', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await writeFile(page, `${tmpPath}/${NAME}`, RELOADED);
    await reloadFromDisk(page, true);
    await expect(
      page.locator('.jp-BpmnWidget [data-element-id="EndEvent_Reloaded"]')
    ).toBeVisible();
    expect(await countOfType(page, 'bpmn:Task')).toBe(0);
  });

  test('DEF-SAVE-22 Reload from Disk on an empty file shows the empty diagram', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, '');
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await expect(tab(page, NAME)).toHaveClass(/jp-mod-dirty/);
    await reloadFromDisk(page, true);
    await expect.poll(() => countOfType(page, 'bpmn:Task')).toBe(0);
    expect(await countOfType(page, 'bpmn:StartEvent')).toBe(1);
    await expect(tab(page, NAME)).not.toHaveClass(/jp-mod-dirty/);
    expect(await readFile(page, `${tmpPath}/${NAME}`)).toBe('');
  });

  test('DEF-SAVE-21 confirmed Reload from Disk clears the unsaved mark', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await expect(tab(page, NAME)).toHaveClass(/jp-mod-dirty/);
    await writeFile(page, `${tmpPath}/${NAME}`, RELOADED);
    await reloadFromDisk(page, true);
    await expect(
      page.locator('.jp-BpmnWidget [data-element-id="EndEvent_Reloaded"]')
    ).toBeVisible();
    await expect(tab(page, NAME)).not.toHaveClass(/jp-mod-dirty/);
  });
});

test.describe('Colour', () => {
  async function openColourPopup(page: any): Promise<void> {
    await page
      .locator('.jp-BpmnWidget [data-element-id="StartEvent_1"]')
      .click();
    await page
      .locator('.djs-context-pad .entry[data-action="set-color"]')
      .click();
    await expect(page.locator('.djs-popup')).toBeVisible();
  }

  test('ACC-COLOR-17 context pad offers the colour picker', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await page
      .locator('.jp-BpmnWidget [data-element-id="StartEvent_1"]')
      .click();
    await expect(
      page.locator('.djs-context-pad .entry[data-action="set-color"]')
    ).toBeVisible();
  });

  test('ACC-COLOR-18 ACC-COLOR-19 colour popup beside the element sets the fill', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await openColourPopup(page);

    const parentIsBody = await page.evaluate(
      () =>
        document.querySelector('.djs-popup-parent')?.parentElement ===
        document.body
    );
    expect(parentIsBody).toBe(true);
    const pad = await page
      .locator('.djs-context-pad .entry[data-action="set-color"]')
      .boundingBox();
    const popup = await page.locator('.djs-popup').boundingBox();
    expect(Math.abs(popup!.x - pad!.x)).toBeLessThan(100);
    expect(Math.abs(popup!.y - (pad!.y + pad!.height))).toBeLessThan(100);

    await page.locator('.djs-popup .entry').nth(1).click();
    await save(page, NAME);
    const saved = await readFile(page, `${tmpPath}/${NAME}`);
    expect(saved).toMatch(/bpmnElement="StartEvent_1"[^>]*bioc:fill="#/);
  });

  test('ACC-COLOR-20 coloured group shows its fill at 0.3 opacity', async ({
    page,
    tmpPath
  }) => {
    const xml = bpmn(
      '    <bpmn:group id="Group_1"/>',
      shape(
        'Group_1',
        100,
        80,
        300,
        200,
        'bioc:fill="#ffcc00" bioc:stroke="#000000"'
      )
    );
    await writeFile(page, `${tmpPath}/${NAME}`, xml);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const rect = page.locator(
      '.jp-BpmnWidget [data-element-id="Group_1"] .djs-visual rect'
    );
    await expect
      .poll(() =>
        rect.first().evaluate((r: any) => [r.style.fill, r.style.fillOpacity])
      )
      .toEqual(['rgb(255, 204, 0)', '0.3']);
  });

  test('ACC-COLOR-65 coloured annotation draws bracket and text in the bright colour', async ({
    page,
    tmpPath
  }) => {
    const xml = bpmn(
      `    <bpmn:textAnnotation id="Note_1"><bpmn:text>Saved red</bpmn:text></bpmn:textAnnotation>
    <bpmn:textAnnotation id="Note_2"><bpmn:text>Coloured now</bpmn:text></bpmn:textAnnotation>
    <bpmn:textAnnotation id="Note_3"><bpmn:text>Saved blue</bpmn:text></bpmn:textAnnotation>`,
      shape(
        'Note_1',
        100,
        80,
        160,
        40,
        'bioc:fill="#ffcdd2" bioc:stroke="#831311"'
      ) +
        shape('Note_2', 100, 200, 160, 40) +
        shape(
          'Note_3',
          100,
          320,
          160,
          40,
          'bioc:fill="#BBDEFB" bioc:stroke="#0D4372"'
        )
    );
    await writeFile(page, `${tmpPath}/${NAME}`, xml);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    // The colour picker's Red entry runs this command
    await page.evaluate(() => {
      const modeler = (window as any).jupyterapp.shell.currentWidget.content
        ._modeler;
      modeler
        .get('modeling')
        .setColor([modeler.get('elementRegistry').get('Note_2')], {
          fill: '#FFCDD2',
          stroke: '#831311'
        });
    });
    const expected: Record<string, string> = {
      Note_1: 'rgb(211, 47, 47)',
      Note_2: 'rgb(211, 47, 47)',
      Note_3: 'rgb(25, 118, 210)'
    };
    for (const [id, color] of Object.entries(expected)) {
      const visual = page.locator(
        `.jp-BpmnWidget [data-element-id="${id}"] .djs-visual`
      );
      await expect
        .poll(() =>
          visual.first().evaluate((v: any) => {
            const style = (selector: string) =>
              getComputedStyle(v.querySelector(selector));
            return [
              style('rect').fill,
              style('path').stroke,
              style('path').strokeOpacity,
              style('text').fill,
              style('text').fillOpacity
            ];
          })
        )
        .toEqual(['none', color, '1', color, '1']);
    }
  });

  test('ACC-COLOR-21 closing the diagram removes the moved popup', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await openColourPopup(page);
    expect(
      await page.evaluate(
        () => document.querySelectorAll('body > .djs-popup-parent').length
      )
    ).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await tab(page, NAME).locator('.lm-TabBar-tabCloseIcon').click();
    await expect(page.locator('.jp-BpmnWidget')).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.querySelectorAll('body > .djs-popup-parent').length
      )
    ).toBe(0);
  });
});

test.describe('Export', () => {
  test('ACC-EXPORT-22 exports the diagram as SVG', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await canvasContextMenu(page);
    const downloadPromise = page.waitForEvent('download');
    await page
      .locator('.lm-Menu-itemLabel', { hasText: 'Export Diagram as SVG' })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test-diagram.svg');
    const svg = fs.readFileSync(await download.path(), 'utf-8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('djs-');
  });
});

test.describe('Realign connectors', () => {
  const THIRTY = 'abcdefghijabcdefghijabcdefghij';
  const ALIGN_XML = bpmn(
    [
      '    <bpmn:task id="Task_1"/>',
      `    <bpmn:textAnnotation id="Long_1"><bpmn:text>${THIRTY}</bpmn:text></bpmn:textAnnotation>`,
      '    <bpmn:textAnnotation id="Short_1"><bpmn:text>short</bpmn:text></bpmn:textAnnotation>',
      '    <bpmn:textAnnotation id="Wide_1"><bpmn:text>tiny</bpmn:text></bpmn:textAnnotation>',
      '    <bpmn:association id="Off_1" sourceRef="Task_1" targetRef="Long_1"/>',
      '    <bpmn:association id="Aligned_1" sourceRef="Task_1" targetRef="Short_1"/>'
    ].join('\n'),
    [
      shape('Task_1', 300, 140, 100, 80),
      shape('Long_1', 500, 40, 100, 30),
      shape('Short_1', 500, 250, 100, 30),
      shape('Wide_1', 100, 300, 300, 30),
      edge('Off_1', [
        [400, 180],
        [550, 120]
      ]),
      edge('Aligned_1', [
        [400, 200],
        [500, 265]
      ])
    ].join('\n')
  );

  async function realign(page: any): Promise<void> {
    await page.evaluate(() =>
      (window as any).jupyterapp.commands.execute('bpmn:realign-connectors')
    );
  }

  function onBorder(p: any, s: any): boolean {
    const tol = 1;
    const inX = p.x >= s.x - tol && p.x <= s.x + s.width + tol;
    const inY = p.y >= s.y - tol && p.y <= s.y + s.height + tol;
    const edgeX =
      Math.abs(p.x - s.x) <= tol || Math.abs(p.x - (s.x + s.width)) <= tol;
    const edgeY =
      Math.abs(p.y - s.y) <= tol || Math.abs(p.y - (s.y + s.height)) <= tol;
    return inX && inY && (edgeX || edgeY);
  }

  test('ACC-ALIGN-23 canvas context menu offers Realign Connectors', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, ALIGN_XML);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await canvasContextMenu(page);
    await expect(
      page.locator('.lm-Menu-itemLabel', { hasText: 'Realign Connectors' })
    ).toBeVisible();
  });

  test('ACC-ALIGN-24 ACC-ALIGN-25 annotations widen to 7 px per character and never shrink', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, ALIGN_XML);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await realign(page);
    expect((await element(page, 'Long_1')).width).toBe(210);
    expect((await element(page, 'Short_1')).width).toBe(100);
    expect((await element(page, 'Wide_1')).width).toBe(300);
  });

  test('ACC-ALIGN-26 ACC-ALIGN-27 misaligned association re-routed, aligned one kept', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, ALIGN_XML);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const alignedBefore = (await element(page, 'Aligned_1')).waypoints;
    await realign(page);

    const off = (await element(page, 'Off_1')).waypoints;
    expect(off).toHaveLength(2);
    expect(onBorder(off[0], await element(page, 'Task_1'))).toBe(true);
    expect(onBorder(off[1], await element(page, 'Long_1'))).toBe(true);

    expect((await element(page, 'Aligned_1')).waypoints).toEqual(alignedBefore);
  });

  async function undoOnce(page: any): Promise<void> {
    await page.evaluate(() =>
      (window as any).jupyterapp.shell.currentWidget.content._modeler
        .get('commandStack')
        .undo()
    );
  }

  test('DEF-ALIGN-19 one undo reverts a whole Realign run', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, ALIGN_XML);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const ids = ['Long_1', 'Off_1', 'Aligned_1'];
    const before = await Promise.all(ids.map(id => element(page, id)));
    await realign(page);
    expect((await element(page, 'Long_1')).width).toBe(210);
    await undoOnce(page);
    expect(await Promise.all(ids.map(id => element(page, id)))).toEqual(before);
  });

  test('DEF-ALIGN-19 Realign with nothing to change adds no undo step', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await realign(page);
    const canUndo = await page.evaluate(() =>
      (window as any).jupyterapp.shell.currentWidget.content._modeler
        .get('commandStack')
        .canUndo()
    );
    expect(canUndo).toBe(false);
    await expect(tab(page, NAME)).not.toHaveClass(/jp-mod-dirty/);
  });
});

test.describe('Styling', () => {
  test('ACC-STYLE-28 canvas stays white under JupyterLab Dark', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await page.theme.setDarkTheme();
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const background = await page
      .locator('.jp-BpmnWidget .djs-container')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(255, 255, 255)');
  });

  test('ACC-STYLE-29 context pad entries at full opacity', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await page
      .locator('.jp-BpmnWidget [data-element-id="StartEvent_1"]')
      .click();
    const entries = page.locator('.djs-context-pad .entry');
    await expect(entries.first()).toBeVisible();
    const opacities = await entries.evaluateAll(els =>
      els.map(el => getComputedStyle(el).opacity)
    );
    expect(opacities.length).toBeGreaterThan(0);
    expect(new Set(opacities)).toEqual(new Set(['1']));
  });

  test('ACC-STYLE-30 label editor text is black', async ({ page, tmpPath }) => {
    const xml = bpmn(
      '    <bpmn:task id="Task_1" name="Label"/>',
      shape('Task_1', 200, 120, 100, 80)
    );
    await writeFile(page, `${tmpPath}/${NAME}`, xml);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await page.locator('.jp-BpmnWidget [data-element-id="Task_1"]').dblclick();
    const editor = page.locator('.djs-direct-editing-content');
    await expect(editor).toBeVisible();
    expect(await editor.evaluate(el => getComputedStyle(el).color)).toBe(
      'rgb(0, 0, 0)'
    );
  });

  test('DEF-STYLE-20 canvas fits a panel shorter than 400 px', async ({
    page,
    tmpPath
  }) => {
    await page.setViewportSize({ width: 1280, height: 480 });
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const widget = await page.locator('.jp-BpmnWidget').boundingBox();
    const canvas = await page
      .locator('.jp-BpmnWidget .jp-BpmnWidget-container')
      .boundingBox();
    expect(widget!.height).toBeLessThan(400);
    expect(canvas!.y + canvas!.height).toBeLessThanOrEqual(
      widget!.y + widget!.height + 1
    );
    const scale = await page.evaluate(
      () =>
        (window as any).jupyterapp.shell.currentWidget.content._modeler
          .get('canvas')
          .viewbox().scale
    );
    expect(Number.isFinite(scale) && scale > 0).toBe(true);
  });
});

test.describe('Toolbar', () => {
  const CLEAN = bpmn(
    `    <bpmn:startEvent id="S"><bpmn:outgoing>F</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="E"><bpmn:incoming>F</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="F" sourceRef="S" targetRef="E"/>`,
    shape('S', 180, 160, 36, 36) +
      shape('E', 380, 160, 36, 36) +
      edge('F', [
        [216, 178],
        [380, 178]
      ])
  );
  const TASK = bpmn(
    '    <bpmn:task id="Task_1" name="Task"/>',
    shape('Task_1', 200, 120, 100, 80)
  );

  function button(page: any, title: string) {
    return page.locator(
      `.jp-Toolbar .jp-ToolbarButtonComponent[title="${title}"]`
    );
  }

  /** Canvas zoom and the diagram point at the centre of the view. */
  async function view(
    page: any
  ): Promise<{ zoom: number; cx: number; cy: number }> {
    return page.evaluate(() => {
      const canvas = (
        window as any
      ).jupyterapp.shell.currentWidget.content._modeler.get('canvas');
      const vb = canvas.viewbox();
      return {
        zoom: canvas.zoom(),
        cx: vb.x + vb.width / 2,
        cy: vb.y + vb.height / 2
      };
    });
  }

  test('DEF-VIEW-23 clicked buttons do not stay pressed', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, TASK);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    for (const title of [
      'Zoom in',
      'Zoom out',
      'Fit diagram to view',
      'Reload diagram from disk'
    ]) {
      await button(page, title).click();
      await expect(button(page, title)).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    }
  });

  test('ACC-VALID-75 Validate lists the issues of the unsaved diagram', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, CLEAN);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await button(page, 'Check the diagram for problems').click();
    const dialog = page.locator('.jp-Dialog');
    await expect(dialog).toContainText('Validation');
    const rows = dialog.locator('.jp-BpmnValidation-issue');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('warning');
    await expect(rows.first()).toContainText(
      'has no incoming or outgoing sequence flow'
    );
    await dialog.locator('.jp-Dialog-button.jp-mod-accept').click();
  });

  test('ACC-VALID-76 Validate on a clean diagram says no issues found', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, CLEAN);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await button(page, 'Check the diagram for problems').click();
    await expect(page.locator('.jp-Dialog')).toContainText('No issues found');
    await page.locator('.jp-Dialog .jp-mod-accept').click();
  });

  test('ACC-VIEW-39 zoom in button zooms one step around the centre', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, TASK);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const before = await view(page);
    await button(page, 'Zoom in').click();
    const after = await view(page);
    expect(after.zoom).toBeGreaterThan(before.zoom);
    expect(after.cx).toBeCloseTo(before.cx, 0);
    expect(after.cy).toBeCloseTo(before.cy, 0);
  });

  test('ACC-VIEW-40 zoom out button zooms one step around the centre', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, TASK);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const before = await view(page);
    await button(page, 'Zoom out').click();
    const after = await view(page);
    expect(after.zoom).toBeLessThan(before.zoom);
    expect(after.cx).toBeCloseTo(before.cx, 0);
    expect(after.cy).toBeCloseTo(before.cy, 0);
  });

  test('ACC-VIEW-41 fit button fits the diagram as on open', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, TASK);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    const opened = await view(page);
    const fit = button(page, 'Fit diagram to view');
    await expect(fit.locator('svg[data-icon="bpmn:fit"]')).toBeVisible();
    await button(page, 'Zoom in').click();
    await button(page, 'Zoom in').click();
    expect((await view(page)).zoom).toBeGreaterThan(opened.zoom);
    await fit.click();
    const fitted = await view(page);
    expect(fitted.zoom).toBeCloseTo(opened.zoom, 3);
    expect(fitted.cx).toBeCloseTo(opened.cx, 0);
    expect(fitted.cy).toBeCloseTo(opened.cy, 0);
  });

  test('ACC-VIEW-42 refresh button reloads the diagram from disk', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await writeFile(page, `${tmpPath}/${NAME}`, RELOADED);
    await button(page, 'Reload diagram from disk').click();
    await expect(
      page.locator('.jp-BpmnWidget [data-element-id="EndEvent_Reloaded"]')
    ).toBeVisible();
    await expect(page.locator('.jp-Dialog')).toHaveCount(0);
  });

  test('ACC-VIEW-43 refresh over unsaved edits asks; Cancel keeps them', async ({
    page,
    tmpPath
  }) => {
    await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
    await openDiagram(page, `${tmpPath}/${NAME}`);
    await addTaskWithPalette(page);
    await writeFile(page, `${tmpPath}/${NAME}`, RELOADED);
    const refresh = button(page, 'Reload diagram from disk');
    const dialog = page.locator('.jp-Dialog');
    await refresh.click();
    await expect(dialog).toBeVisible();
    await dialog.locator('.jp-mod-reject').click();
    await expect(dialog).toHaveCount(0);
    expect(await countOfType(page, 'bpmn:Task')).toBe(1);
    await expect(tab(page, NAME)).toHaveClass(/jp-mod-dirty/);
    await refresh.click();
    await dialog.locator('.jp-mod-accept').click();
    await expect(
      page.locator('.jp-BpmnWidget [data-element-id="EndEvent_Reloaded"]')
    ).toBeVisible();
    expect(await countOfType(page, 'bpmn:Task')).toBe(0);
    await expect(tab(page, NAME)).not.toHaveClass(/jp-mod-dirty/);
  });
});

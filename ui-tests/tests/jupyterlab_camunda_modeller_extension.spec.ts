import { expect, test } from '@jupyterlab/galata';
import * as path from 'path';

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

test('should emit an activation console message', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });

  await page.goto();

  expect(
    logs.filter(
      s =>
        s ===
        'JupyterLab extension jupyterlab_camunda_modeller_extension is activated!'
    )
  ).toHaveLength(1);
});

test.describe('BPMN Diagram Tests', () => {
  const BPMN_FILENAME = 'test-diagram.bpmn';
  const BPMN_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

  test.beforeEach(async ({ page, tmpPath }) => {
    await page.goto();
    // Create a test BPMN file
    await page.evaluate(
      async ({ filename, content }) => {
        const serverSettings = (window as any).jupyterapp.serviceManager
          .serverSettings;
        const response = await fetch(
          `${serverSettings.baseUrl}api/contents/${filename}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'file',
              format: 'text',
              content: content
            })
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to create file: ${response.statusText}`);
        }
      },
      { filename: BPMN_FILENAME, content: BPMN_CONTENT }
    );
  });

  test.afterEach(async ({ page }) => {
    // Clean up test file
    await page.evaluate(async filename => {
      const serverSettings = (window as any).jupyterapp.serviceManager
        .serverSettings;
      await fetch(`${serverSettings.baseUrl}api/contents/${filename}`, {
        method: 'DELETE'
      });
    }, BPMN_FILENAME);
  });

  test('should open BPMN diagram successfully', async ({ page }) => {
    // Wait for file browser to be visible
    await page.waitForSelector('.jp-FileBrowser');

    // Refresh the file browser to show our test file
    await page.keyboard.press('Control+Shift+R');
    await page.waitForTimeout(1000);

    // Double-click on the BPMN file to open it
    const fileItem = page.locator(
      `.jp-DirListing-item[title="${BPMN_FILENAME}"]`
    );
    await fileItem.waitFor({ state: 'visible', timeout: 10000 });
    await fileItem.dblclick();

    // Wait for the BPMN widget to be created
    await page.waitForSelector('.jp-BpmnWidget', { timeout: 30000 });

    // Wait for the modeler to initialize (look for bpmn-js container)
    await page.waitForSelector('.jp-BpmnWidget .djs-container', {
      timeout: 30000
    });

    // Verify the diagram canvas is visible
    const canvas = page.locator('.jp-BpmnWidget .djs-container svg');
    await expect(canvas).toBeVisible();

    // Verify the start event is rendered
    const startEvent = page.locator(
      '.jp-BpmnWidget .djs-container [data-element-id="StartEvent_1"]'
    );
    await expect(startEvent).toBeVisible();
  });

  test('should save BPMN diagram with Ctrl+S', async ({ page }) => {
    // Wait for file browser and open the file
    await page.waitForSelector('.jp-FileBrowser');
    await page.keyboard.press('Control+Shift+R');
    await page.waitForTimeout(1000);

    const fileItem = page.locator(
      `.jp-DirListing-item[title="${BPMN_FILENAME}"]`
    );
    await fileItem.waitFor({ state: 'visible', timeout: 10000 });
    await fileItem.dblclick();

    // Wait for the BPMN widget and modeler
    await page.waitForSelector('.jp-BpmnWidget .djs-container', {
      timeout: 30000
    });

    // Make a modification - click on the canvas and add an element via palette
    const palette = page.locator('.jp-BpmnWidget .djs-palette');
    await expect(palette).toBeVisible();

    // Click on the Task tool in the palette
    const taskTool = page.locator(
      '.jp-BpmnWidget .djs-palette .entry[data-action="create.task"]'
    );
    if (await taskTool.isVisible()) {
      await taskTool.click();

      // Click on the canvas to place the element
      const canvas = page.locator('.jp-BpmnWidget .djs-container');
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        await page.mouse.click(
          canvasBox.x + canvasBox.width / 2,
          canvasBox.y + canvasBox.height / 2
        );
      }
    }

    // Save with Ctrl+S
    await page.keyboard.press('Control+s');

    // Wait a moment for save to complete
    await page.waitForTimeout(2000);

    // Verify the file was saved by checking the document title
    // (JupyterLab removes the asterisk when saved)
    const tabTitle = page.locator(
      `.jp-DockPanel-tabBar .lm-TabBar-tab[data-type="document-title"]:has-text("${BPMN_FILENAME}")`
    );
    await expect(tabTitle).toBeVisible();

    // Check that there's no dirty indicator (asterisk)
    const dirtyIndicator = page.locator(
      `.jp-DockPanel-tabBar .lm-TabBar-tab.jp-mod-dirty:has-text("${BPMN_FILENAME}")`
    );
    await expect(dirtyIndicator).not.toBeVisible();

    // Verify content was actually saved by reading the file
    const savedContent = await page.evaluate(async filename => {
      const serverSettings = (window as any).jupyterapp.serviceManager
        .serverSettings;
      const response = await fetch(
        `${serverSettings.baseUrl}api/contents/${filename}`,
        {
          method: 'GET'
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.statusText}`);
      }
      const data = await response.json();
      return data.content;
    }, BPMN_FILENAME);

    // Verify the saved content is valid BPMN XML
    expect(savedContent).toContain('<?xml version="1.0"');
    expect(savedContent).toContain('bpmn:definitions');
    expect(savedContent).toContain('StartEvent_1');
  });
});

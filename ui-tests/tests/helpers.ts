import { expect, IJupyterLabPageFixture } from '@jupyterlab/galata';

const NS = `xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
                  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"`;

/**
 * Wrap process elements and their diagram shapes into a BPMN document.
 */
export function bpmn(processXml: string, diagramXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions ${NS} id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
${processXml}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
${diagramXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}

export function shape(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  attrs = ''
): string {
  return `      <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}" ${attrs}>
        <dc:Bounds x="${x}" y="${y}" width="${width}" height="${height}"/>
      </bpmndi:BPMNShape>`;
}

export function edge(id: string, points: Array<[number, number]>): string {
  const waypoints = points
    .map(([x, y]) => `        <di:waypoint x="${x}" y="${y}"/>`)
    .join('\n');
  return `      <bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}">
${waypoints}
      </bpmndi:BPMNEdge>`;
}

/** One start event, as in a new diagram. */
export const START_ONLY = bpmn(
  '    <bpmn:startEvent id="StartEvent_1"/>',
  shape('StartEvent_1', 180, 160, 36, 36)
);

/**
 * Write a file through the contents API of the test server.
 */
export async function writeFile(
  page: IJupyterLabPageFixture,
  path: string,
  content: string
): Promise<void> {
  await page.evaluate(
    async ({ filePath, text }) => {
      const app = (window as any).jupyterapp;
      await app.serviceManager.contents.save(filePath, {
        type: 'file',
        format: 'text',
        content: text
      });
    },
    { filePath: path, text: content }
  );
}

/**
 * Read a file through the contents API of the test server.
 */
export async function readFile(
  page: IJupyterLabPageFixture,
  path: string
): Promise<string> {
  return page.evaluate(async (filePath: string) => {
    const app = (window as any).jupyterapp;
    const model = await app.serviceManager.contents.get(filePath, {
      content: true,
      format: 'text'
    });
    return model.content as string;
  }, path);
}

/**
 * Open a file in the BPMN Modeler and wait until the diagram is imported.
 */
export async function openDiagram(
  page: IJupyterLabPageFixture,
  path: string
): Promise<void> {
  await page.evaluate(async (filePath: string) => {
    await (window as any).jupyterapp.commands.execute('docmanager:open', {
      path: filePath,
      factory: 'BPMN Modeler'
    });
  }, path);
  await page.waitForSelector('.jp-BpmnWidget .djs-container', {
    timeout: 30000
  });
  await waitForImport(page);
}

/**
 * Wait until the current BPMN widget has finished its first import.
 */
export async function waitForImport(
  page: IJupyterLabPageFixture
): Promise<void> {
  await page.evaluate(async () => {
    const content = (window as any).jupyterapp.shell.currentWidget.content;
    await content.ready;
  });
}

/**
 * Return [type, id] of every element in the current diagram.
 */
export async function elements(
  page: IJupyterLabPageFixture
): Promise<Array<[string, string]>> {
  return page.evaluate(() => {
    const modeler = (window as any).jupyterapp.shell.currentWidget.content
      ._modeler;
    return modeler
      .get('elementRegistry')
      .getAll()
      .map((el: any) => [el.type, el.id]);
  });
}

export async function countOfType(
  page: IJupyterLabPageFixture,
  type: string
): Promise<number> {
  return (await elements(page)).filter(([t]) => t === type).length;
}

/**
 * Bounds and waypoints of one element in the current diagram.
 */
export async function element(
  page: IJupyterLabPageFixture,
  id: string
): Promise<any> {
  return page.evaluate((elementId: string) => {
    const modeler = (window as any).jupyterapp.shell.currentWidget.content
      ._modeler;
    const el = modeler.get('elementRegistry').get(elementId);
    return {
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      waypoints: el.waypoints?.map((p: any) => ({ x: p.x, y: p.y }))
    };
  }, id);
}

/**
 * Add a task with the palette: pick the task tool, click an empty canvas spot.
 */
export async function addTaskWithPalette(
  page: IJupyterLabPageFixture
): Promise<void> {
  const before = await countOfType(page, 'bpmn:Task');
  await page
    .locator('.jp-BpmnWidget .djs-palette .entry[data-action="create.task"]')
    .click();
  const box = await page.locator('.jp-BpmnWidget .djs-container').boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width - 150, box!.y + box!.height - 120);
  await expect.poll(() => countOfType(page, 'bpmn:Task')).toBe(before + 1);
}

/**
 * The document tab of a file.
 */
export function tab(page: IJupyterLabPageFixture, name: string) {
  return page.locator(
    `.lm-DockPanel-tabBar .lm-TabBar-tab:has-text("${name}")`
  );
}

/**
 * Save the current document with Ctrl+S and wait for the dirty mark to go.
 */
export async function save(
  page: IJupyterLabPageFixture,
  name: string
): Promise<void> {
  await page.locator('.jp-BpmnWidget .djs-container').click({
    position: { x: 5, y: 5 }
  });
  await page.keyboard.press('Control+s');
  await expect(tab(page, name)).not.toHaveClass(/jp-mod-dirty/);
}

/**
 * Open the JupyterLab context menu on an empty spot of the canvas.
 */
export async function canvasContextMenu(
  page: IJupyterLabPageFixture
): Promise<void> {
  const box = await page.locator('.jp-BpmnWidget .djs-container').boundingBox();
  await page.mouse.click(box!.x + box!.width - 60, box!.y + 60, {
    button: 'right'
  });
  await page.waitForSelector('.lm-Menu');
}

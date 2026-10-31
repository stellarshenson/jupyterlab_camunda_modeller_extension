import { expect, test } from '@jupyterlab/galata';

import {
  addTaskWithPalette,
  bpmn,
  edge,
  openDiagram,
  shape,
  START_ONLY,
  writeFile
} from './helpers';

const NAME = 'trans-strings.bpmn';
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

test('ACC-TRANS-83 command labels and captions', async ({ page }) => {
  const seen = await page.evaluate(() => {
    const { commands } = (window as any).jupyterapp;
    return [
      commands.label('bpmn:export-svg'),
      commands.caption('bpmn:export-svg'),
      commands.label('bpmn:realign-connectors'),
      commands.caption('bpmn:realign-connectors')
    ];
  });
  expect(seen).toEqual([
    'Export Diagram as SVG',
    'Export BPMN diagram as SVG file',
    'Realign Connectors',
    'Widen text annotations and re-route association connectors for proper alignment'
  ]);
});

test('ACC-TRANS-83 toolbar and validation dialog', async ({
  page,
  tmpPath
}) => {
  await writeFile(page, `${tmpPath}/${NAME}`, CLEAN);
  await openDiagram(page, `${tmpPath}/${NAME}`);
  const toolbar = page.locator('.jp-Toolbar .jp-ToolbarButtonComponent');
  const titles = await toolbar.evaluateAll((nodes: Element[]) =>
    nodes.map(node => node.getAttribute('title'))
  );
  for (const title of [
    'Reload diagram from disk',
    'Zoom out',
    'Zoom in',
    'Fit diagram to view',
    'Check the diagram for problems'
  ]) {
    expect(titles).toContain(title);
  }
  const validate = page.locator(
    '.jp-Toolbar .jp-ToolbarButtonComponent[title="Check the diagram for problems"]'
  );
  await expect(validate.locator('.jp-ToolbarButtonComponent-label')).toHaveText(
    'Validate'
  );
  await validate.click();
  const dialog = page.locator('.jp-Dialog');
  const header = dialog.locator('.jp-Dialog-header');
  const body = dialog.locator('.jp-Dialog-body');
  await expect(header).toHaveText('Validation');
  await expect(body).toHaveText('No issues found');
  await dialog.locator('.jp-mod-accept').click();
});

test('ACC-TRANS-83 reload dialog', async ({ page, tmpPath }) => {
  await writeFile(page, `${tmpPath}/${NAME}`, START_ONLY);
  await openDiagram(page, `${tmpPath}/${NAME}`);
  await addTaskWithPalette(page);
  await page
    .locator(
      '.jp-Toolbar .jp-ToolbarButtonComponent[title="Reload diagram from disk"]'
    )
    .click();
  const dialog = page.locator('.jp-Dialog');
  const header = dialog.locator('.jp-Dialog-header');
  const body = dialog.locator('.jp-Dialog-body');
  const accept = dialog.locator('.jp-mod-accept');
  await expect(header).toHaveText('Reload Diagram from Disk');
  await expect(body).toHaveText(
    'Discard the unsaved changes and reload the diagram from disk?'
  );
  await expect(accept).toHaveText('Reload');
  await dialog.locator('.jp-mod-reject').click();
});

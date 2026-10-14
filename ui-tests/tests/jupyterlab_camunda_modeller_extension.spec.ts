import { expect, test } from '@jupyterlab/galata';

import { START_ONLY, writeFile } from './helpers';

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

test('ACC-PACK-35 emits the activation console message once', async ({
  page
}) => {
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

test('ACC-FILE-3 ACC-EDIT-4 double-click opens the diagram in the BPMN Modeler', async ({
  page,
  tmpPath
}) => {
  await page.goto();
  await writeFile(page, `${tmpPath}/test-diagram.bpmn`, START_ONLY);
  await page.filebrowser.openDirectory(tmpPath);

  await page
    .locator('.jp-DirListing-item', { hasText: 'test-diagram.bpmn' })
    .dblclick();

  await page.waitForSelector('.jp-BpmnWidget .djs-container', {
    timeout: 30000
  });
  await expect(
    page.locator(
      '.jp-BpmnWidget .djs-container [data-element-id="StartEvent_1"]'
    )
  ).toBeVisible();
});

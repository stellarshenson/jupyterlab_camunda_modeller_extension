import { ITranslator } from '@jupyterlab/translation';
import plugin from '../index';

jest.mock('../widget', () => ({
  BpmnFactory: class {
    constructor(public options: any) {}
  },
  BpmnWidget: class {}
}));
jest.mock('@jupyterlab/codemirror', () => ({}));
jest.mock('@jupyterlab/docregistry', () => ({}));
jest.mock('@jupyterlab/ui-components', () => ({ LabIcon: class {} }));

it('activates with a null translator and keeps the strings in English', () => {
  const addCommand = jest.fn();
  const addWidgetFactory = jest.fn();
  const stub = jest.fn();
  const app: any = {
    commands: { addCommand },
    docRegistry: { addFileType: stub, getFileType: stub, addWidgetFactory },
    contextMenu: { addItem: stub },
    serviceManager: {}
  };
  (plugin.activate as any)(app, null, null);
  expect(plugin.optional).toContain(ITranslator);
  expect(plugin.requires).toBeUndefined();
  const commands = new Map<string, any>(addCommand.mock.calls);
  expect(commands.get('bpmn:export-svg')).toMatchObject({
    label: 'Export Diagram as SVG',
    caption: 'Export BPMN diagram as SVG file'
  });
  expect(commands.get('bpmn:realign-connectors')).toMatchObject({
    label: 'Realign Connectors',
    caption:
      'Widen text annotations and re-route association connectors for proper alignment'
  });
  const { trans } = addWidgetFactory.mock.calls[0][0].options;
  expect(trans.__('Any text')).toBe('Any text');
});

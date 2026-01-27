import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { DocumentWidget } from '@jupyterlab/docregistry';

import { bpmnIcon } from './icon';
import { BpmnFactory, BpmnWidget } from './widget';

/**
 * Extensions we handle
 */
const BPMN_EXTENSIONS = ['.bpmn'];

/**
 * File type name
 */
const FILE_TYPE_NAME = 'bpmn';

/**
 * Plugin ID
 */
const PLUGIN_ID = 'jupyterlab_camunda_modeller_extension:plugin';

/**
 * Command IDs
 */
const CommandIds = {
  exportSvg: 'bpmn:export-svg'
};

/**
 * Helper to get BpmnWidget from current widget
 */
function getBpmnWidget(app: JupyterFrontEnd): BpmnWidget | null {
  const widget = app.shell.currentWidget;
  if (widget instanceof DocumentWidget) {
    const content = widget.content;
    if (content instanceof BpmnWidget) {
      return content;
    }
  }
  return null;
}

/**
 * Initialization data for the jupyterlab_camunda_modeller_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description:
    'JupyterLab extension to model BPMN diagrams and open Camunda BPMN files',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log(
      'JupyterLab extension jupyterlab_camunda_modeller_extension is activated!'
    );

    const { docRegistry, commands } = app;

    // Register file type with icon
    docRegistry.addFileType({
      name: FILE_TYPE_NAME,
      displayName: 'BPMN Diagram',
      extensions: BPMN_EXTENSIONS,
      mimeTypes: ['application/bpmn+xml', 'text/xml'],
      fileFormat: 'text',
      contentType: 'file',
      icon: bpmnIcon
    });

    // Create and register widget factory
    const factory = new BpmnFactory({
      name: 'BPMN Modeler',
      modelName: 'text',
      fileTypes: [FILE_TYPE_NAME],
      defaultFor: [FILE_TYPE_NAME],
      readOnly: false
    });

    docRegistry.addWidgetFactory(factory);

    // Register Export as SVG command
    commands.addCommand(CommandIds.exportSvg, {
      label: 'Export Diagram as SVG',
      caption: 'Export BPMN diagram as SVG file',
      isEnabled: () => getBpmnWidget(app) !== null,
      execute: async () => {
        const widget = getBpmnWidget(app);
        if (widget) {
          try {
            const svg = await widget.exportAsSvg();
            if (svg) {
              // Create download
              const blob = new Blob([svg], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              const baseName = widget
                .getDocumentPath()
                .replace(/\.[^/.]+$/, '')
                .split('/')
                .pop();
              a.href = url;
              a.download = `${baseName || 'diagram'}.svg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              console.log('Diagram exported as SVG');
            }
          } catch (error) {
            console.error('Failed to export diagram as SVG:', error);
          }
        }
      }
    });

    // Add context menu item for BPMN widgets
    app.contextMenu.addItem({
      command: CommandIds.exportSvg,
      selector: '.jp-BpmnWidget',
      rank: 1
    });
  }
};

export default plugin;

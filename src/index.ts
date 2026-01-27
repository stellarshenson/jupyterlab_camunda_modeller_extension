import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { LabIcon } from '@jupyterlab/ui-components';

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
 * BPMN icon SVG - Camunda orange with BPMN symbols
 * Simplified SVG for LabIcon compatibility
 */
const BPMN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill="#fc5d0d" d="M80.472 0c10.785 0 19.528 8.743 19.528 19.528v60.944c0 10.785-8.743 19.528-19.528 19.528H19.528C8.743 100 0 91.257 0 80.472V19.528C0 8.743 8.743 0 19.528 0h60.944z"/>
  <circle cx="20.86" cy="50" r="8.5" fill="#fff"/>
  <circle cx="79.08" cy="50" r="8.5" fill="#fff"/>
  <rect x="32.46" y="43.45" width="13.18" height="13.14" fill="#fff"/>
  <path fill="#fff" d="M58.95 40.7l-9.3 9.29 9.3 9.3 9.3-9.3z"/>
</svg>`;

/**
 * Create BPMN icon
 */
const bpmnIcon = new LabIcon({
  name: 'bpmn:icon',
  svgstr: BPMN_SVG
});

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
    console.log('BPMN file type registered with icon');

    // Debug: Check if file type was registered correctly
    const registeredType = docRegistry.getFileType(FILE_TYPE_NAME);
    console.log(
      'Registered file type:',
      registeredType?.name,
      'icon:',
      registeredType?.icon?.name
    );

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

import { LabIcon } from '@jupyterlab/ui-components';

/**
 * BPMN icon SVG - Camunda orange with start->task->end flow
 */
const BPMN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect fill="#FC5D0D" width="32" height="32" rx="4"/>
  <circle fill="none" stroke="#fff" stroke-width="1.5" cx="6" cy="16" r="3"/>
  <rect fill="#fff" x="12" y="12" width="8" height="8" rx="1"/>
  <circle fill="none" stroke="#fff" stroke-width="2.5" cx="26" cy="16" r="3"/>
  <line stroke="#fff" stroke-width="1.5" x1="9" y1="16" x2="12" y2="16"/>
  <line stroke="#fff" stroke-width="1.5" x1="20" y1="16" x2="23" y2="16"/>
</svg>`;

/**
 * BPMN file icon for JupyterLab file browser
 */
export const bpmnIcon = new LabIcon({
  name: 'bpmn:icon',
  svgstr: BPMN_SVG
});

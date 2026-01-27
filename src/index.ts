import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './request';

/**
 * Initialization data for the jupyterlab_camunda_modeller_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_camunda_modeller_extension:plugin',
  description: 'Jupyterlab extension to allow modelling bpmn diagrams (and opening camunda bpmn diagrams) directly in jupyterlab',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_camunda_modeller_extension is activated!');

    requestAPI<any>('hello')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_camunda_modeller_extension server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;

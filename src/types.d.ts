/**
 * Type declarations for modules without TypeScript support
 */

// bpmn-js Modeler types
declare module 'bpmn-js/lib/Modeler' {
  interface IModelerOptions {
    container: HTMLElement;
    moddleExtensions?: Record<string, any>;
    additionalModules?: any[];
  }

  interface ISaveXMLResult {
    xml: string;
  }

  interface ISaveSVGResult {
    svg: string;
  }

  interface ICanvas {
    zoom(method: string | number): void;
  }

  interface IEventBus {
    on(event: string, callback: () => void): void;
    off(event: string, callback: () => void): void;
  }

  export default class BpmnModeler {
    constructor(options: IModelerOptions);
    importXML(xml: string): Promise<{ warnings: string[] }>;
    saveXML(options?: { format?: boolean }): Promise<ISaveXMLResult>;
    saveSVG(): Promise<ISaveSVGResult>;
    get(service: 'canvas'): ICanvas;
    get(service: 'eventBus'): IEventBus;
    get(service: string): any;
    destroy(): void;
  }
}

// Camunda BPMN moddle descriptor
declare module 'camunda-bpmn-moddle/resources/camunda' {
  const camundaModdleDescriptor: Record<string, any>;
  export default camundaModdleDescriptor;
}

// bpmn-js color picker module
declare module 'bpmn-js-color-picker' {
  const BpmnColorPickerModule: any;
  export default BpmnColorPickerModule;
}

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

  interface IShape {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    businessObject: {
      text?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface IConnection {
    id: string;
    type: string;
    source: IShape;
    target: IShape;
    waypoints?: Array<{ x: number; y: number }>;
    [key: string]: any;
  }

  interface IBounds {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface IElementRegistry {
    filter(
      callback: (element: IShape | IConnection) => boolean
    ): Array<IShape | IConnection>;
    get(id: string): IShape | IConnection | undefined;
  }

  interface IWaypoint {
    x: number;
    y: number;
  }

  interface IModeling {
    resizeShape(shape: IShape, newBounds: IBounds): void;
    layoutConnection(
      connection: IConnection,
      hints?: Record<string, any>
    ): void;
    updateWaypoints(connection: IConnection, waypoints: IWaypoint[]): void;
  }

  export default class BpmnModeler {
    constructor(options: IModelerOptions);
    importXML(xml: string): Promise<{ warnings: string[] }>;
    saveXML(options?: { format?: boolean }): Promise<ISaveXMLResult>;
    saveSVG(): Promise<ISaveSVGResult>;
    get(service: 'canvas'): ICanvas;
    get(service: 'eventBus'): IEventBus;
    get(service: 'elementRegistry'): IElementRegistry;
    get(service: 'modeling'): IModeling;
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

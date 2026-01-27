import { DocumentWidget } from '@jupyterlab/docregistry';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { PromiseDelegate } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

// Import bpmn-js modeler
import BpmnModeler from 'bpmn-js/lib/Modeler';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

/**
 * Empty BPMN diagram template for new files
 */
const EMPTY_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

/**
 * Track all active widgets
 */
const activeWidgets: Set<BpmnWidget> = new Set();

/**
 * A widget for editing BPMN diagrams using bpmn-js
 */
export class BpmnWidget extends Widget {
  private _context: DocumentRegistry.Context;
  private _ready = new PromiseDelegate<void>();
  private _container: HTMLDivElement;
  private _errorDiv: HTMLDivElement;
  private _modeler: BpmnModeler | null = null;
  private _dirty = false;
  private _loading = false;

  constructor(context: DocumentRegistry.Context) {
    super();
    this._context = context;

    this.addClass('jp-BpmnWidget');
    this.title.label = context.localPath;

    // Create container for diagram
    this._container = document.createElement('div');
    this._container.className = 'jp-BpmnWidget-container';

    // Create error display div
    this._errorDiv = document.createElement('div');
    this._errorDiv.className = 'jp-BpmnWidget-error';
    this._errorDiv.style.display = 'none';

    this.node.appendChild(this._errorDiv);
    this.node.appendChild(this._container);

    // Register widget for tracking
    activeWidgets.add(this);

    // Initialize modeler and load diagram
    void this._initialize();

    // Listen for content changes (file reload from external source)
    context.ready.then(() => {
      context.model.contentChanged.connect(this._onContentChanged, this);
    });

    // Listen for save requests
    context.saveState.connect(this._onSaveState, this);
  }

  /**
   * A promise that resolves when the widget is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * Whether the widget has unsaved changes
   */
  get dirty(): boolean {
    return this._dirty;
  }

  /**
   * Initialize the BPMN modeler
   */
  private async _initialize(): Promise<void> {
    try {
      console.log('[BpmnWidget] Starting initialization...');

      // Show loading state
      this._container.innerHTML = `
        <div class="jp-BpmnWidget-loading">
          <div>Loading BPMN editor...</div>
        </div>
      `;

      // Wait for context to be ready
      console.log('[BpmnWidget] Waiting for context...');
      await this._context.ready;
      console.log('[BpmnWidget] Context ready');

      // Clear loading state before creating modeler
      this._container.innerHTML = '';

      // Create modeler
      console.log('[BpmnWidget] Creating BpmnModeler...');
      this._modeler = new BpmnModeler({
        container: this._container,
        moddleExtensions: {
          camunda: camundaModdleDescriptor
        }
      });
      console.log('[BpmnWidget] BpmnModeler created');

      // Listen for changes to mark dirty and sync to model
      const eventBus = this._modeler.get('eventBus');
      eventBus.on('commandStack.changed', () => {
        if (!this._loading) {
          this._setDirty(true);
          // Sync to model on every change so Ctrl+S works
          void this._syncToModel();
        }
      });

      // Load the diagram
      console.log('[BpmnWidget] Loading diagram...');
      await this._loadDiagram();
      console.log('[BpmnWidget] Diagram loaded');

      this._ready.resolve();
      console.log('[BpmnWidget] Initialization complete');
    } catch (error) {
      console.error('[BpmnWidget] Initialization error:', error);
      this._showError(error);
      this._ready.reject(error);
    }
  }

  /**
   * Load the diagram from context
   */
  private async _loadDiagram(): Promise<void> {
    if (!this._modeler) {
      return;
    }

    this._loading = true;
    this._errorDiv.style.display = 'none';
    this._container.style.display = 'block';

    try {
      let content = this._context.model.toString();

      // If empty file, use template
      if (!content || content.trim() === '') {
        content = EMPTY_BPMN;
        // Set the template as initial content
        this._context.model.fromString(content);
      }

      await this._modeler.importXML(content);

      // Fit diagram to viewport
      const canvas = this._modeler.get('canvas');
      canvas.zoom('fit-viewport');

      this._setDirty(false);
    } catch (error) {
      this._showError(error);
    } finally {
      this._loading = false;
    }
  }

  /**
   * Sync diagram content to the document model
   */
  private async _syncToModel(): Promise<void> {
    if (!this._modeler) {
      return;
    }

    try {
      const { xml } = await this._modeler.saveXML({ format: true });
      if (xml) {
        // Update model without triggering our contentChanged handler
        this._loading = true;
        this._context.model.fromString(xml);
        this._loading = false;
        console.log('[BpmnWidget] Synced to model');
      }
    } catch (error) {
      console.error('[BpmnWidget] Failed to sync to model:', error);
    }
  }

  /**
   * Save the diagram back to the document model
   */
  async save(): Promise<void> {
    await this._syncToModel();
    this._setDirty(false);
  }

  /**
   * Handle save state signal from context
   */
  private _onSaveState(
    sender: DocumentRegistry.Context,
    state: DocumentRegistry.SaveState
  ): void {
    if (state === 'started') {
      // Model should already be synced, but ensure it's up to date
      console.log('[BpmnWidget] Save started, syncing model...');
    }
  }

  /**
   * Handle content change signal (external file change)
   */
  private _onContentChanged(): void {
    // Only reload if not currently loading and not dirty
    // If dirty, user has unsaved changes - don't overwrite them
    if (!this._loading && !this._dirty) {
      void this._loadDiagram();
    }
  }

  /**
   * Set dirty state and update title
   */
  private _setDirty(dirty: boolean): void {
    this._dirty = dirty;
    // JupyterLab handles dirty indicator via DocumentWidget
  }

  /**
   * Show error message
   */
  private _showError(error: any): void {
    this._container.style.display = 'none';
    this._errorDiv.style.display = 'block';

    const message = error?.message || String(error);

    this._errorDiv.innerHTML = `
      <div class="jp-BpmnWidget-errorContent">
        <h3>Failed to load BPMN diagram</h3>
        <p><strong>Error:</strong> ${this._escapeHtml(message)}</p>
        <div class="jp-BpmnWidget-troubleshooting">
          <strong>Troubleshooting:</strong>
          <ul>
            <li>Verify the file is valid BPMN 2.0 XML</li>
            <li>Check that the file is not corrupted</li>
            <li>Try opening the file in Camunda Modeler to verify it works</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private _escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get the document path
   */
  getDocumentPath(): string {
    return this._context.localPath;
  }

  /**
   * Get the SVG element from the rendered diagram
   */
  getSvgElement(): SVGSVGElement | null {
    const svg = this._container.querySelector('svg.djs-container');
    return svg as SVGSVGElement | null;
  }

  /**
   * Export diagram as SVG string
   */
  async exportAsSvg(): Promise<string | null> {
    if (!this._modeler) {
      return null;
    }

    try {
      const { svg } = await this._modeler.saveSVG();
      return svg;
    } catch (error) {
      console.error('Failed to export SVG:', error);
      return null;
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    // Unregister widget
    activeWidgets.delete(this);

    // Disconnect signals
    this._context.model.contentChanged.disconnect(this._onContentChanged, this);
    this._context.saveState.disconnect(this._onSaveState, this);

    // Destroy modeler
    if (this._modeler) {
      this._modeler.destroy();
      this._modeler = null;
    }

    super.dispose();
  }
}

/**
 * A widget factory for BPMN diagrams
 */
export class BpmnFactory extends ABCWidgetFactory<
  DocumentWidget<BpmnWidget>,
  DocumentRegistry.IModel
> {
  /**
   * Create a new widget given a context.
   */
  protected createNewWidget(
    context: DocumentRegistry.Context
  ): DocumentWidget<BpmnWidget> {
    const content = new BpmnWidget(context);
    const widget = new DocumentWidget({ content, context });

    return widget;
  }
}

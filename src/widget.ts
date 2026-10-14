import { Dialog, showDialog } from '@jupyterlab/apputils';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { Contents } from '@jupyterlab/services';
import { LabIcon, refreshIcon, ToolbarButton } from '@jupyterlab/ui-components';
import { PromiseDelegate } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

// Import bpmn-js modeler
import BpmnModeler from 'bpmn-js/lib/Modeler';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import BpmnColorPickerModule from 'bpmn-js-color-picker';

import {
  estimateAnnotationWidth,
  getBorderIntersection,
  getShapeCenter,
  isPointOnBoundary
} from './geometry';

/**
 * Custom module to apply fill color to Groups
 * Groups don't get fill color by default in bpmn-js
 */
function GroupColorHandler(eventBus: any, elementRegistry: any) {
  // Helper to get fill color from element's di
  function getFillColor(element: any): string | null {
    const di = element.di;
    if (!di) {
      return null;
    }
    // Try different color properties used by bpmn-js-color-picker
    return (
      di.get('bioc:fill') || di.get('color:background-color') || di.fill || null
    );
  }

  // Helper to apply fill to group
  function applyGroupFill(element: any) {
    const fill = getFillColor(element);
    if (fill) {
      const gfx = elementRegistry.getGraphics(element);
      if (gfx) {
        const rect = gfx.querySelector('.djs-visual rect');
        if (rect) {
          rect.style.fill = fill;
          rect.style.fillOpacity = '0.3'; // Semi-transparent like lanes
        }
      }
    }
  }

  // Update group fill when element is changed (color applied)
  eventBus.on('element.changed', (event: any) => {
    const element = event.element;
    if (element.type === 'bpmn:Group') {
      applyGroupFill(element);
    }
  });

  // Also handle initial render for groups with existing colors
  eventBus.on('shape.added', (event: any) => {
    const element = event.element;
    if (element.type === 'bpmn:Group') {
      // Delay to ensure graphics are ready
      setTimeout(() => {
        applyGroupFill(element);
      }, 0);
    }
  });
}

(GroupColorHandler as any).$inject = ['eventBus', 'elementRegistry'];

const GroupColorModule = {
  __init__: ['groupColorHandler'],
  groupColorHandler: ['type', GroupColorHandler]
};

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
 * bpmn-js command that groups one Realign Connectors run
 */
const REALIGN_COMMAND = 'jp-bpmn.realign-connectors';

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
  private _loading = false;
  private _savedXml = '';
  private _popupObserver: MutationObserver | null = null;

  constructor(context: DocumentRegistry.Context, contents: Contents.IManager) {
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

    // JupyterLab 4.6 revert leaves the dirty mark and skips the text of an
    // empty file; File > Reload from Disk and the toolbar use it
    const revert = context.revert.bind(context);
    context.revert = async () => {
      const before = context.model.toString();
      await revert();
      if (context.model.toString() === before) {
        const disk = await contents.get(context.path, {
          content: true,
          format: 'text'
        });
        if (disk.content === '') {
          context.model.fromString('');
        }
      }
      // The model now holds the disk text (the empty-diagram template for an
      // empty file, as on open)
      context.model.dirty = false;
    };
  }

  /**
   * A promise that resolves when the widget is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
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

      // Create modeler with color picker
      console.log('[BpmnWidget] Creating BpmnModeler...');
      this._modeler = new BpmnModeler({
        container: this._container,
        moddleExtensions: {
          camunda: camundaModdleDescriptor
        },
        additionalModules: [BpmnColorPickerModule, GroupColorModule]
      });
      console.log('[BpmnWidget] BpmnModeler created');

      // Set up observer to move popup-parent to body for correct positioning
      // This fixes popup positioning when JupyterLab has CSS transforms
      this._setupPopupObserver();

      // Sync to model on every change so Ctrl+S works
      const eventBus = this._modeler.get('eventBus');
      eventBus.on('commandStack.changed', () => {
        if (!this._loading) {
          void this._syncToModel();
        }
      });
      // Modeling calls made in postExecute join this command's undo step
      this._modeler.get('commandStack').register(REALIGN_COMMAND, {
        postExecute: () => this._realign()
      });
      // An open label editor holds typed text no command has seen yet
      eventBus.on('directEditing.activate', () => {
        this._context.model.dirty = true;
      });
      // The label editor stops every key before JupyterLab sees it, so
      // Ctrl+S there completes the label and saves here
      this.node.addEventListener(
        'keydown',
        async (event: KeyboardEvent) => {
          const directEditing = this._modeler?.get('directEditing');
          if (
            (event.ctrlKey || event.metaKey) &&
            !event.shiftKey &&
            !event.altKey &&
            event.keyCode === 83 && // S as Lumino reads it: CapsLock and non-Latin layouts too
            directEditing?.isActive()
          ) {
            event.preventDefault();
            event.stopPropagation();
            directEditing.complete();
            await this._syncToModel();
            await this._context.save();
          }
        },
        true
      );

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
        try {
          this._context.model.fromString(xml);
        } finally {
          this._loading = false;
        }
        // fromString no longer marks the model dirty (JupyterLab 4.6)
        this._context.model.dirty = true;
        console.log('[BpmnWidget] Synced to model');
      }
    } catch (error) {
      console.error('[BpmnWidget] Failed to sync to model:', error);
    }
  }

  /**
   * Handle save state signal from context
   */
  private _onSaveState(
    sender: DocumentRegistry.Context,
    state: DocumentRegistry.SaveState
  ): void {
    if (state === 'started') {
      this._savedXml = this._context.model.toString();
    } else if (state === 'completed') {
      // The context marks the model clean after the write, even when an
      // edit arrived during the save or a label editor is still open
      if (
        this._context.model.toString() !== this._savedXml ||
        this._modeler?.get('directEditing').isActive()
      ) {
        this._context.model.dirty = true;
      }
    }
  }

  /**
   * Handle content change signal (external file change)
   */
  private _onContentChanged(): void {
    // Our own edits are already in the model, so any other change
    // (Reload from Disk, revert) replaces the diagram
    if (!this._loading) {
      void this._loadDiagram();
    }
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
   * Set up MutationObserver to move popup-parent to document.body
   * This fixes popup positioning when JupyterLab has CSS transforms
   */
  private _setupPopupObserver(): void {
    this._popupObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (
            node instanceof HTMLElement &&
            node.classList.contains('djs-popup-parent')
          ) {
            // Move popup-parent to body for correct fixed positioning
            document.body.appendChild(node);
            console.log('[BpmnWidget] Moved popup-parent to body');
          }
        });
      });
    });

    // Observe the container for added popup elements
    this._popupObserver.observe(this._container, {
      childList: true,
      subtree: true
    });
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
   * Zoom one step in (1) or out (-1) around the centre of the view
   */
  zoom(direction: 1 | -1): void {
    this._modeler?.get('zoomScroll').stepZoom(direction);
  }

  /**
   * Fit the whole diagram into the view, as on open
   */
  fit(): void {
    this._modeler?.get('canvas').zoom('fit-viewport');
  }

  /**
   * Reload the diagram from disk, asking first when there are unsaved edits
   */
  async reload(): Promise<void> {
    if (this._context.model.dirty) {
      const result = await showDialog({
        title: 'Reload Diagram from Disk',
        body: 'Discard the unsaved changes and reload the diagram from disk?',
        buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'Reload' })]
      });
      if (!result.button.accept) {
        return;
      }
    }
    await this._context.revert();
  }

  /**
   * Realign connectors by widening text annotations and re-routing associations
   */
  realignConnectors(): void {
    if (!this._modeler) {
      console.warn('[BpmnWidget] No modeler available for realign');
      return;
    }

    try {
      // Nothing to change: no empty undo step and no unsaved mark
      if (
        !this._annotationsToWiden().length &&
        !this._associationsToReroute().length
      ) {
        return;
      }
      this._modeler.get('commandStack').execute(REALIGN_COMMAND, {});
    } catch (error) {
      console.error('[BpmnWidget] Failed to realign connectors:', error);
    }
  }

  /**
   * Text annotations narrower than their text needs
   */
  private _annotationsToWiden(): any[] {
    return this._modeler!.get('elementRegistry').filter(
      (el: any) =>
        el.type === 'bpmn:TextAnnotation' &&
        estimateAnnotationWidth(el.businessObject?.text || '') > el.width
    );
  }

  /**
   * Associations whose end point is not on the target border
   */
  private _associationsToReroute(): any[] {
    return this._modeler!.get('elementRegistry').filter((el: any) => {
      if (el.type !== 'bpmn:Association' || !el.source || !el.target) {
        return false;
      }
      const waypoints = el.waypoints;
      return !(
        waypoints &&
        waypoints.length >= 2 &&
        isPointOnBoundary(waypoints[waypoints.length - 1], el.target)
      );
    });
  }

  /**
   * Widen annotations, then redraw associations as one segment between the
   * shape borders. Runs inside the realign command, so one undo reverts it.
   */
  private _realign(): void {
    const modeling = this._modeler!.get('modeling');
    this._annotationsToWiden().forEach((annotation: any) => {
      modeling.resizeShape(annotation, {
        x: annotation.x,
        y: annotation.y,
        width: estimateAnnotationWidth(annotation.businessObject?.text || ''),
        height: annotation.height
      });
    });
    this._associationsToReroute().forEach((assoc: any) => {
      const sourceCenter = getShapeCenter(assoc.source);
      const targetCenter = getShapeCenter(assoc.target);
      modeling.updateWaypoints(assoc, [
        getBorderIntersection(assoc.source, sourceCenter, targetCenter),
        getBorderIntersection(assoc.target, targetCenter, sourceCenter)
      ]);
    });
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

    // Stop observing popup changes
    if (this._popupObserver) {
      this._popupObserver.disconnect();
      this._popupObserver = null;
    }

    // Clean up any popup-parent elements we moved to body
    document.querySelectorAll('body > .djs-popup-parent').forEach(el => {
      el.remove();
    });

    // Destroy modeler
    if (this._modeler) {
      this._modeler.destroy();
      this._modeler = null;
    }

    super.dispose();
  }
}

/**
 * Four rectangle corners, the common fit-to-view icon (Material "crop_free")
 */
const fitIcon = new LabIcon({
  name: 'bpmn:fit',
  svgstr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path class="jp-icon3" fill="#616161" d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/>
</svg>`
});

/**
 * A widget factory for BPMN diagrams
 */
export class BpmnFactory extends ABCWidgetFactory<
  DocumentWidget<BpmnWidget>,
  DocumentRegistry.IModel
> {
  constructor(
    options: DocumentRegistry.IWidgetFactoryOptions<
      DocumentWidget<BpmnWidget>
    > & { contents: Contents.IManager }
  ) {
    super(options);
    this._contents = options.contents;
  }

  /**
   * Create a new widget given a context.
   */
  protected createNewWidget(
    context: DocumentRegistry.Context
  ): DocumentWidget<BpmnWidget> {
    const content = new BpmnWidget(context, this._contents);
    const widget = new DocumentWidget({ content, context });
    widget.toolbar.addItem(
      'bpmn-refresh',
      new ToolbarButton({
        icon: refreshIcon,
        tooltip: 'Reload diagram from disk',
        noFocusOnClick: true,
        onClick: () => void content.reload()
      })
    );
    widget.toolbar.addItem(
      'bpmn-zoom-out',
      new ToolbarButton({
        label: '-',
        tooltip: 'Zoom out',
        noFocusOnClick: true,
        onClick: () => content.zoom(-1)
      })
    );
    widget.toolbar.addItem(
      'bpmn-zoom-in',
      new ToolbarButton({
        label: '+',
        tooltip: 'Zoom in',
        noFocusOnClick: true,
        onClick: () => content.zoom(1)
      })
    );
    widget.toolbar.addItem(
      'bpmn-fit',
      new ToolbarButton({
        icon: fitIcon,
        tooltip: 'Fit diagram to view',
        noFocusOnClick: true,
        onClick: () => content.fit()
      })
    );
    return widget;
  }

  private _contents: Contents.IManager;
}

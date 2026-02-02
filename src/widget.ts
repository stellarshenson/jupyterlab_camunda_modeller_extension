import { DocumentWidget } from '@jupyterlab/docregistry';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { PromiseDelegate } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

// Import bpmn-js modeler
import BpmnModeler from 'bpmn-js/lib/Modeler';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
import BpmnColorPickerModule from 'bpmn-js-color-picker';

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
  private _popupObserver: MutationObserver | null = null;

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
   * Realign connectors by widening text annotations and re-routing associations
   */
  realignConnectors(): void {
    if (!this._modeler) {
      console.warn('[BpmnWidget] No modeler available for realign');
      return;
    }

    try {
      const modeling = this._modeler.get('modeling');
      const elementRegistry = this._modeler.get('elementRegistry');

      // Find all text annotations
      const textAnnotations = elementRegistry.filter(
        (el: any) => el.type === 'bpmn:TextAnnotation'
      );

      console.log(
        `[BpmnWidget] Found ${textAnnotations.length} text annotations`
      );

      // Resize each text annotation based on text content
      textAnnotations.forEach((annotation: any) => {
        const text = annotation.businessObject?.text || '';
        // Estimate required width: ~7px per character, min 100px, max 400px
        const estimatedWidth = Math.max(100, Math.min(400, text.length * 7));

        // Only resize if width needs to increase
        if (estimatedWidth > annotation.width) {
          console.log(
            `[BpmnWidget] Resizing annotation ${annotation.id}: ${annotation.width} -> ${estimatedWidth}`
          );
          modeling.resizeShape(annotation, {
            x: annotation.x,
            y: annotation.y,
            width: estimatedWidth,
            height: annotation.height
          });
        }
      });

      // Find all associations
      const associations = elementRegistry.filter(
        (el: any) => el.type === 'bpmn:Association'
      );

      console.log(`[BpmnWidget] Found ${associations.length} associations`);

      // Re-route associations where endpoint is not on target boundary
      associations.forEach((assoc: any) => {
        const source = assoc.source;
        const target = assoc.target;

        if (!source || !target) {
          console.warn(
            `[BpmnWidget] Association ${assoc.id} missing source or target`
          );
          return;
        }

        // Check if endpoint is already on target boundary
        const waypoints = assoc.waypoints;
        if (waypoints && waypoints.length >= 2) {
          const endpoint = waypoints[waypoints.length - 1];
          if (this._isPointOnBoundary(endpoint, target)) {
            console.log(
              `[BpmnWidget] Skipping ${assoc.id} - endpoint already on boundary`
            );
            return;
          }
        }

        // Calculate centers
        const sourceCenter = this._getShapeCenter(source);
        const targetCenter = this._getShapeCenter(target);

        // Calculate border intersection points
        const sourcePoint = this._getBorderIntersection(
          source,
          sourceCenter,
          targetCenter
        );
        const targetPoint = this._getBorderIntersection(
          target,
          targetCenter,
          sourceCenter
        );

        console.log(
          `[BpmnWidget] Updating waypoints for ${assoc.id}: ` +
            `(${sourcePoint.x}, ${sourcePoint.y}) -> (${targetPoint.x}, ${targetPoint.y})`
        );

        modeling.updateWaypoints(assoc, [sourcePoint, targetPoint]);
      });

      console.log('[BpmnWidget] Realign connectors complete');
    } catch (error) {
      console.error('[BpmnWidget] Failed to realign connectors:', error);
    }
  }

  /**
   * Get the center point of a shape
   */
  private _getShapeCenter(shape: any): { x: number; y: number } {
    return {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2
    };
  }

  /**
   * Check if a point is on the boundary of a shape (within tolerance)
   */
  private _isPointOnBoundary(
    point: { x: number; y: number },
    shape: any,
    tolerance: number = 5
  ): boolean {
    const { x, y, width, height } = shape;
    const left = x;
    const right = x + width;
    const top = y;
    const bottom = y + height;

    // Check if point is within shape bounds (with tolerance)
    const withinX = point.x >= left - tolerance && point.x <= right + tolerance;
    const withinY = point.y >= top - tolerance && point.y <= bottom + tolerance;

    if (!withinX || !withinY) {
      return false;
    }

    // Check if point is on one of the edges (within tolerance)
    const onLeft = Math.abs(point.x - left) <= tolerance;
    const onRight = Math.abs(point.x - right) <= tolerance;
    const onTop = Math.abs(point.y - top) <= tolerance;
    const onBottom = Math.abs(point.y - bottom) <= tolerance;

    return onLeft || onRight || onTop || onBottom;
  }

  /**
   * Calculate intersection point on shape border along line from inside to outside
   */
  private _getBorderIntersection(
    shape: any,
    inside: { x: number; y: number },
    outside: { x: number; y: number }
  ): { x: number; y: number } {
    const { x, y, width, height } = shape;

    // Shape bounds
    const left = x;
    const right = x + width;
    const top = y;
    const bottom = y + height;

    // Direction vector from inside to outside
    const dx = outside.x - inside.x;
    const dy = outside.y - inside.y;

    // Handle zero-length direction
    if (dx === 0 && dy === 0) {
      return { x: inside.x, y: top }; // Default to top center
    }

    // Calculate intersection with each edge
    const intersections: Array<{ x: number; y: number; t: number }> = [];

    // Left edge (x = left)
    if (dx !== 0) {
      const t = (left - inside.x) / dx;
      const iy = inside.y + t * dy;
      if (t > 0 && iy >= top && iy <= bottom) {
        intersections.push({ x: left, y: iy, t });
      }
    }

    // Right edge (x = right)
    if (dx !== 0) {
      const t = (right - inside.x) / dx;
      const iy = inside.y + t * dy;
      if (t > 0 && iy >= top && iy <= bottom) {
        intersections.push({ x: right, y: iy, t });
      }
    }

    // Top edge (y = top)
    if (dy !== 0) {
      const t = (top - inside.y) / dy;
      const ix = inside.x + t * dx;
      if (t > 0 && ix >= left && ix <= right) {
        intersections.push({ x: ix, y: top, t });
      }
    }

    // Bottom edge (y = bottom)
    if (dy !== 0) {
      const t = (bottom - inside.y) / dy;
      const ix = inside.x + t * dx;
      if (t > 0 && ix >= left && ix <= right) {
        intersections.push({ x: ix, y: bottom, t });
      }
    }

    // Return intersection with smallest positive t (closest to inside point)
    if (intersections.length > 0) {
      intersections.sort((a, b) => a.t - b.t);
      return { x: intersections[0].x, y: intersections[0].y };
    }

    // Fallback: return center of closest edge
    return { x: inside.x, y: top };
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
 * Custom DocumentWidget that prompts before closing unsaved diagrams
 */
class BpmnDocumentWidget extends DocumentWidget<BpmnWidget> {
  /**
   * Handle close request - prompt if unsaved changes
   */
  protected onCloseRequest(msg: any): void {
    const bpmnWidget = this.content;

    if (bpmnWidget.dirty) {
      void showDialog({
        title: 'Unsaved Changes',
        body: `"${this.context.localPath}" has unsaved changes. Are you sure you want to close?`,
        buttons: [
          Dialog.cancelButton({ label: 'Cancel' }),
          Dialog.warnButton({ label: 'Close Without Saving' })
        ]
      }).then(result => {
        if (result.button.accept) {
          // User confirmed, close the widget
          super.onCloseRequest(msg);
        }
        // Otherwise, do nothing (cancel close)
      });
    } else {
      // No unsaved changes, close normally
      super.onCloseRequest(msg);
    }
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
    const widget = new BpmnDocumentWidget({ content, context });

    return widget;
  }
}

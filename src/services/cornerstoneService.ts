// Service for managing Cornerstone3D functionality

import { RenderingEngine, Enums, utilities as csUtils } from '@cornerstonejs/core';
import { init as initCornerstone, utilities } from '@cornerstonejs/core';
import {
  addTool,
  PanTool,
  ZoomTool,
  WindowLevelTool,
  StackScrollTool,
  ToolGroupManager
} from '@cornerstonejs/tools';

// Initialize Cornerstone tools
const initCornerstoneTools = () => {
  initCornerstone();

  // Add tools to cornerstone
  addTool(PanTool);
  addTool(ZoomTool);
  addTool(WindowLevelTool);
  addTool(StackScrollTool);
};

// Initialize Cornerstone core
export const initCornerstoneService = () => {
  initCornerstoneTools();
};

// Create and manage rendering engine
export class CornerstoneService {
  private renderingEngine: RenderingEngine | null = null;
  private element: HTMLDivElement | null = null;
  private viewportId: string = 'viewport';

  public getRenderingEngine = () => this.renderingEngine;

  public setElement = (element: HTMLDivElement) => {
    this.element = element;
  }

  public createRenderingEngine = (element: HTMLDivElement) => {
    if (this.renderingEngine) {
      this.destroy();
    }

    this.element = element;
    const renderingEngineId = utilities.uuidv4();
    this.renderingEngine = new RenderingEngine(renderingEngineId);

    // Store element reference but don't call enableElement yet
    // We'll enable and configure the viewport when we load an image
    return this.renderingEngine;
  }

  public loadImage = async (imageId: string) => {
    if (!this.renderingEngine || !this.element) {
      throw new Error('Rendering engine or element not initialized');
    }

    try {
      // First enable the element with proper configuration if not already done
      if (!this.renderingEngine.getViewport(this.viewportId)) {
        this.renderingEngine.enableElement({
          element: this.element,
          viewportId: this.viewportId,
          type: Enums.ViewportType.ORTHOGONAL,
        });
      }

      // Load the image using Cornerstone
      const image = await csUtils.drawImageToCanvas(imageId);

      // Get the viewport and set the image
      const viewport = this.renderingEngine.getViewport(this.viewportId);

      // Set the image stack
      if (viewport && typeof viewport.setStack === 'function') {
        await viewport.setStack([imageId]);
      }

      // Set the VOI (Window/Level)
      if (viewport && typeof viewport.setProperties === 'function') {
        viewport.setProperties({
          voiRange: { width: 400, center: 50 } // Default window/level
        });
      }

      // Render the viewport
      if (viewport && typeof viewport.render === 'function') {
        viewport.render();
      }

      return image;
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  }

  public destroy = () => {
    if (this.renderingEngine) {
      this.renderingEngine.destroy();
      this.renderingEngine = null;
    }
    this.element = null;
  }

  public setTool = (toolName: string, toolGroupId: string = 'default') => {
    if (!this.renderingEngine || !this.element) {
      throw new Error('Rendering engine or element not initialized');
    }

    // Create tool group if it doesn't exist
    if (!ToolGroupManager.getToolGroup(toolGroupId)) {
      ToolGroupManager.createToolGroup(toolGroupId);
    }

    // Add tool to tool group
    ToolGroupManager.addTool(toolGroupId, toolName);

    // Set tool active
    ToolGroupManager.setToolActive(toolGroupId, toolName, {
      bindings: [
        {
          mouseButton: 1, // Left click
        },
      ],
    });

    // Set the tool group on the element
    ToolGroupManager.addEnabledElement(
      this.renderingEngine.getRenderingEngineId(),
      this.viewportId,
      toolGroupId
    );
  }

  public setViewportSettings = (settings: any) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport) {
      // Apply window level if provided
      if (settings.voiRange && typeof viewport.setProperties === 'function') {
        viewport.setProperties({
          voiRange: settings.voiRange
        });
      }

      // Apply zoom if provided
      if (settings.zoom && typeof viewport.setZoom === 'function') {
        viewport.setZoom(settings.zoom);
      }

      // Apply pan if provided
      if (settings.pan && typeof viewport.setPan === 'function') {
        viewport.setPan(settings.pan);
      }

      if (typeof viewport.render === 'function') {
        viewport.render();
      }
    }
  }

  public setZoom = (zoom: number) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport && typeof viewport.setZoom === 'function') {
      viewport.setZoom(zoom);
      if (typeof viewport.render === 'function') {
        viewport.render();
      }
    }
  }

  public setVOI = (width: number, center: number) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport && typeof viewport.setProperties === 'function') {
      viewport.setProperties({
        voiRange: {
          width,
          center
        }
      });
      if (typeof viewport.render === 'function') {
        viewport.render();
      }
    }
  }

  public setPan = (pan: [number, number]) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport && typeof viewport.setPan === 'function') {
      viewport.setPan(pan);
      if (typeof viewport.render === 'function') {
        viewport.render();
      }
    }
  }

  public resetViewport = () => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport) {
      if (typeof viewport.resetCamera === 'function') {
        viewport.resetCamera();
      }
      if (typeof viewport.resetProperties === 'function') {
        viewport.resetProperties();
      }
      if (typeof viewport.render === 'function') {
        viewport.render();
      }
    }
  }
}

// Singleton instance
export const cornerstoneService = new CornerstoneService();
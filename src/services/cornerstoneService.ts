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
const initCornerstoneTools = async () => {
  // First initialize external dependencies for WADO image loader
  const dicomParserModule = await import('dicom-parser');
  const csWADOImageLoaderModule = await import('cornerstone-wado-image-loader');
  const csWADOImageLoader = csWADOImageLoaderModule.default || csWADOImageLoaderModule;
  csWADOImageLoader.external.dicomParser = dicomParserModule.default || dicomParserModule;

  initCornerstone();

  // Add tools to cornerstone
  addTool(PanTool);
  addTool(ZoomTool);
  addTool(WindowLevelTool);
  addTool(StackScrollTool);
};

let isInitialized = false;

// Initialize Cornerstone core
export const initCornerstoneService = async () => {
  if (!isInitialized) {
    await initCornerstoneTools();
    isInitialized = true;
  }
  return isInitialized;
};

// Check if cornerstone is initialized
export const isCornerstoneInitialized = () => {
  return isInitialized;
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

  public createRenderingEngine = async (element: HTMLDivElement) => {
    // Wait for cornerstone to be initialized if it's not already
    if (!isCornerstoneInitialized()) {
      await initCornerstoneService();
    }

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
          type: Enums.ViewportType.STACK, // Use STACK instead of ORTHOGONAL
        });
      }

      // The image should already be loaded through WADO image loader
      // We don't need to explicitly load it, just set it to the viewport
      const image = null; // We'll return null since the actual image loading happens via setImageId

      // Get the viewport and set the image
      const viewport = this.renderingEngine.getViewport(this.viewportId);

      // Set the image stack for the viewport
      if (viewport && typeof (viewport as any).setStack === 'function') {
        await (viewport as any).setStack([imageId]);
      }

      // Set the VOI (Window/Level) - Check if setProperties exists or use alternative
      // Only apply if we have reasonable values to avoid zero-width range errors
      try {
        if (viewport && typeof (viewport as any).setProperties === 'function') {
          // Only set VOI if width is greater than 0 to avoid zero-width range errors
          if (400 > 0) {
            (viewport as any).setProperties({
              voiRange: { width: 400, center: 50 } // Default window/level
            });
          }
        } else if (viewport && typeof (viewport as any).setVOI === 'function') {
          // Only set VOI if width is greater than 0 to avoid zero-width range errors
          if (400 > 0) {
            (viewport as any).setVOI(400, 50); // Alternative method for setting VOI
          }
        }
      } catch (e) {
        console.warn('Could not set VOI properties:', e);
        // Continue without setting VOI properties if there's an error
      }

      // Render the viewport - in newer version, rendering is automatic
      if (viewport && typeof (viewport as any).render === 'function') {
        (viewport as any).render();
      }

      return imageId; // Return the imageId instead of the image object
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
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (toolGroup) {
      toolGroup.addTool(toolName);

      // Set tool active
      toolGroup.setToolActive(toolName, {
        bindings: [
          {
            mouseButton: 1, // Left click
          },
        ],
      });

      // Set the tool group on the element - using different API in newer version
      toolGroup.addViewport(this.viewportId, this.renderingEngine.id);
    }
  }

  public setViewportSettings = (settings: any) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport) {
      // Apply window level if provided
      if (settings.voiRange && typeof (viewport as any).setProperties === 'function') {
        (viewport as any).setProperties({
          voiRange: settings.voiRange
        });
      } else if (settings.voiRange && typeof (viewport as any).setVOI === 'function') {
        (viewport as any).setVOI(settings.voiRange.width, settings.voiRange.center);
      }

      // Apply zoom if provided
      if (settings.zoom && typeof (viewport as any).setZoom === 'function') {
        (viewport as any).setZoom(settings.zoom);
      }

      // Apply pan if provided
      if (settings.pan && typeof (viewport as any).setPan === 'function') {
        (viewport as any).setPan(settings.pan);
      }

      if (typeof (viewport as any).render === 'function') {
        (viewport as any).render();
      }
    }
  }

  public setZoom = (zoom: number) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport && typeof (viewport as any).setZoom === 'function') {
      (viewport as any).setZoom(zoom);
      if (typeof (viewport as any).render === 'function') {
        (viewport as any).render();
      }
    }
  }

  public setVOI = (width: number, center: number) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport && typeof (viewport as any).setProperties === 'function') {
      (viewport as any).setProperties({
        voiRange: {
          width,
          center
        }
      });
      if (typeof (viewport as any).render === 'function') {
        (viewport as any).render();
      }
    } else if (viewport && typeof (viewport as any).setVOI === 'function') {
      (viewport as any).setVOI(width, center);
      if (typeof (viewport as any).render === 'function') {
        (viewport as any).render();
      }
    }
  }

  public setPan = (pan: [number, number]) => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport && typeof (viewport as any).setPan === 'function') {
      (viewport as any).setPan(pan);
      if (typeof (viewport as any).render === 'function') {
        (viewport as any).render();
      }
    }
  }

  public resetViewport = () => {
    if (!this.renderingEngine) {
      throw new Error('Rendering engine not initialized');
    }

    const viewport = this.renderingEngine.getViewport(this.viewportId);
    if (viewport) {
      if (typeof (viewport as any).resetCamera === 'function') {
        (viewport as any).resetCamera();
      }
      if (typeof (viewport as any).resetProperties === 'function') {
        (viewport as any).resetProperties();
      } else if (typeof (viewport as any).reset === 'function') {
        (viewport as any).reset();
      }
      if (typeof (viewport as any).render === 'function') {
        (viewport as any).render();
      }
    }
  }
}

// Singleton instance
export const cornerstoneService = new CornerstoneService();
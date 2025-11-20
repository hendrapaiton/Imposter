// Custom hook for viewport functionality

import { useState, useEffect, useRef } from 'react';
import { cornerstoneService, initCornerstoneService } from '../services/cornerstoneService';
import { useViewerStore } from '../services/stateService';
import { toolService } from '../services/toolService';

// Define types locally to avoid import issues
interface DicomImage {
  imageId: string;
  rows: number;
  columns: number;
  pixelData: Uint8Array | Uint16Array;
  spacing?: { row: number; column: number };
  origin?: { x: number; y: number };
}

export const useViewport = () => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const {
    viewportSettings,
    setViewportSettings,
    setCurrentInstance,
    activeTool,
    currentInstance
  } = useViewerStore();
  const viewportId = useRef<string>('viewport');
  const initialized = useRef<boolean>(false);

  // Initialize Cornerstone on mount
  useEffect(() => {
    if (!initialized.current) {
      initCornerstoneService();
      initialized.current = true;
    }

    return () => {
      cornerstoneService.destroy();
    };
  }, []);

  // Set up the viewport when element is available
  useEffect(() => {
    if (element && !cornerstoneService.getRenderingEngine()) {
      cornerstoneService.createRenderingEngine(element);
    }
  }, [element]);

  // Apply viewport settings when they change
  useEffect(() => {
    if (cornerstoneService.getRenderingEngine()) {
      cornerstoneService.setVOI(viewportSettings.windowWidth, viewportSettings.windowLevel);
      cornerstoneService.setZoom(viewportSettings.zoom);
      cornerstoneService.setPan([viewportSettings.pan.x, viewportSettings.pan.y]);
    }
  }, [viewportSettings]);

  // Handle tool changes
  useEffect(() => {
    if (activeTool) {
      cornerstoneService.setTool(activeTool);
    }
  }, [activeTool]);

  // Handle instance changes - when a new instance is selected, load the image
  useEffect(() => {
    if (currentInstance && currentInstance.imageId && element) {
      loadAndViewImage(currentInstance.imageId);
    }
  }, [currentInstance, element]);

  const loadAndViewImage = async (imageId: string) => {
    if (!element) {
      throw new Error('Viewport element not set');
    }

    try {
      const image = await cornerstoneService.loadImage(imageId);
      return image;
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  };

  const setZoom = (zoom: number) => {
    setViewportSettings({ zoom });
  };

  const setWindowLevel = (windowWidth: number, windowLevel: number) => {
    setViewportSettings({ windowWidth, windowLevel });
  };

  const setPan = (pan: { x: number; y: number }) => {
    setViewportSettings({ pan });
  };

  const resetViewport = () => {
    cornerstoneService.resetViewport();
    setViewportSettings({
      windowWidth: 400,
      windowLevel: 50,
      zoom: 1,
      pan: { x: 0, y: 0 }
    });
  };

  return {
    element,
    setElement,
    loadAndViewImage,
    setZoom,
    setWindowLevel,
    setPan,
    resetViewport,
    viewportSettings,
  };
};
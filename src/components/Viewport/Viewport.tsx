// Viewport component for displaying DICOM images

import React, { useEffect, useRef } from 'react';
import { useViewport } from '../../hooks/useViewport';
import { useViewerStore } from '../../services/stateService';

const Viewport: React.FC = () => {
  const { element, setElement, viewportSettings, resetViewport } = useViewport();
  const { currentInstance } = useViewerStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !element) {
      setElement(containerRef.current);
    }
  }, [setElement, element]);

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ position: 'relative' }}
      >
        {/* Cornerstone will render the image in this container */}
        {!currentInstance && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p>Load a DICOM file to view</p>
              <p className="text-sm mt-2">Use the file loader in the left panel</p>
            </div>
          </div>
        )}
      </div>

      {/* Viewport info overlay */}
      <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 p-1 rounded">
        {currentInstance && (
          <>
            <div>Instance: {currentInstance.instanceNumber}</div>
            <div>Size: {currentInstance.rows}x{currentInstance.columns}</div>
          </>
        )}
        <div>WW: {viewportSettings.windowWidth} | WL: {viewportSettings.windowLevel}</div>
        <div>Zoom: {viewportSettings.zoom.toFixed(2)}x</div>
      </div>

      {/* Reset viewport button */}
      <button
        className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
        onClick={resetViewport}
      >
        Reset View
      </button>
    </div>
  );
};

export default Viewport;
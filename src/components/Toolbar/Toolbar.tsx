// Toolbar component for DICOM viewer tools

import React from 'react';
import { useViewerStore } from '../../services/stateService';

interface ToolbarButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ isActive, onClick, icon, label }) => (
  <button
    className={`flex flex-col items-center justify-center p-2 rounded ${
      isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
    onClick={onClick}
    title={label}
  >
    <span className="text-lg mb-1">{icon}</span>
    <span className="text-xs">{label}</span>
  </button>
);

const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool, setIsToolActive } = useViewerStore();

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
    setIsToolActive(true);
  };

  return (
    <div className="bg-gray-100 p-2 border-b flex space-x-2 overflow-x-auto">
      <ToolbarButton
        isActive={activeTool === 'Pan'}
        onClick={() => handleToolSelect('Pan')}
        icon="←→"
        label="Pan"
      />
      <ToolbarButton
        isActive={activeTool === 'Zoom'}
        onClick={() => handleToolSelect('Zoom')}
        icon="🔍"
        label="Zoom"
      />
      <ToolbarButton
        isActive={activeTool === 'WindowLevel'}
        onClick={() => handleToolSelect('WindowLevel')}
        icon="🌡️"
        label="WW/WL"
      />
      <ToolbarButton
        isActive={activeTool === 'StackScroll'}
        onClick={() => handleToolSelect('StackScroll')}
        icon="↕️"
        label="Scroll"
      />
    </div>
  );
};

export default Toolbar;
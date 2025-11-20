import React, { useState } from 'react';
import Viewport from './components/Viewport/Viewport';
import Toolbar from './components/Toolbar/Toolbar';
import FileLoader from './components/FileLoader/FileLoader';
import StudyBrowser from './components/StudyBrowser/StudyBrowser';
import { useDicom } from './hooks/useDicom';
import { useViewerStore } from './services/stateService';

// Define types locally to avoid import issues
interface Instance {
  id: string;
  instanceNumber: number;
  imageId: string;
  sopClassUid: string;
  rows: number;
  columns: number;
  bitsAllocated: number;
  bitsStored: number;
  highBit: number;
  pixelRepresentation: number;
  samplesPerPixel: number;
  photometricInterpretation: string;
}

interface Series {
  id: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  instanceList: Instance[];
}

interface Study {
  id: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  studyDescription: string;
  seriesList: Series[];
}

function App() {
  const { loadedStudies } = useDicom();
  const { currentStudy, setCurrentStudy, setCurrentSeries } = useViewerStore();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  const handleStudySelect = (study: Study) => {
    setCurrentStudy(study);
  };

  const handleSeriesSelect = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    setCurrentSeries(seriesId);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-2">
        <h1 className="text-xl font-bold">Imposter DICOM Viewer</h1>
      </header>

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Study Browser */}
        <div className="w-80 border-r border-gray-300 flex flex-col">
          <FileLoader />
          <StudyBrowser
            studies={loadedStudies}
            onSelectStudy={handleStudySelect}
            onSelectSeries={handleSeriesSelect}
            selectedStudyId={currentStudy?.id}
            selectedSeriesId={selectedSeriesId}
          />
        </div>

        {/* Viewport Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-2 bg-white border-b border-gray-300 text-sm">
            {currentStudy ? (
              <div>
                <span className="font-semibold">{currentStudy.studyDescription}</span>
                <span className="ml-2 text-gray-600">Patient: {currentStudy.patientName}</span>
              </div>
            ) : (
              <span>No study loaded</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <Viewport />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 p-1 text-center text-xs text-gray-600 border-t border-gray-300">
        Imposter DICOM Viewer - Educational Implementation
      </footer>
    </div>
  );
}

export default App;

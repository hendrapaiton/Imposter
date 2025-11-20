// Study Browser component for navigating studies and series

import React from 'react';
import { useViewerStore } from '../../services/stateService';

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

interface StudyBrowserProps {
  studies: Study[];
  onSelectStudy: (study: Study) => void;
  onSelectSeries: (seriesId: string) => void;
  selectedStudyId?: string;
  selectedSeriesId?: string;
}

const StudyBrowser: React.FC<StudyBrowserProps> = ({
  studies,
  onSelectStudy,
  onSelectSeries,
  selectedStudyId,
  selectedSeriesId
}) => {
  return (
    <div className="bg-gray-100 p-2 flex flex-col h-full">
      <h3 className="font-bold mb-2 text-center">Study Browser</h3>
      <div className="overflow-y-auto flex-grow">
        {studies.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No studies loaded</p>
        ) : (
          studies.map(study => (
            <div 
              key={study.id} 
              className={`mb-2 p-2 rounded cursor-pointer ${
                selectedStudyId === study.id ? 'bg-blue-200' : 'bg-white'
              }`}
              onClick={() => onSelectStudy(study)}
            >
              <div className="font-semibold truncate">{study.studyDescription}</div>
              <div className="text-xs text-gray-600">Date: {study.studyDate}</div>
              <div className="text-xs text-gray-600">Patient: {study.patientName}</div>
              
              {/* Series list */}
              <div className="mt-1 pl-2">
                {study.seriesList.map(series => (
                  <div
                    key={series.id}
                    className={`mt-1 p-1 rounded cursor-pointer ${
                      selectedSeriesId === series.id ? 'bg-blue-100' : 'bg-gray-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSeries(series.id);
                    }}
                  >
                    <div className="text-xs">
                      <span className="font-medium">S{series.seriesNumber}</span>: {series.seriesDescription} ({series.modality})
                    </div>
                    <div className="text-xs text-gray-500">
                      {series.instanceList.length} instances
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyBrowser;
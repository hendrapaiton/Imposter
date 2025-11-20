// File loader component for loading DICOM files

import React, { useCallback } from 'react';
import { useDicom } from '../../hooks/useDicom';
import { useViewerStore } from '../../services/stateService';

const FileLoader: React.FC = () => {
  const { loadDicomFiles } = useDicom();
  const { loading, error } = useViewerStore();
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadDicomFiles(files);
    }
  }, [loadDicomFiles]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Load DICOM Files
        </label>
        <input
          type="file"
          multiple
          accept=".dcm,image/dicom,*/*"
          onChange={handleFileChange}
          disabled={loading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50"
        />
      </div>
      
      {loading && (
        <div className="text-blue-500 text-sm">Loading DICOM files...</div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm">Error: {error}</div>
      )}
    </div>
  );
};

export default FileLoader;
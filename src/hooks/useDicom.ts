// Custom hook for DICOM operations

import { useState, useEffect } from 'react';
import { dicomLoaderService } from '../services/dicomLoaderService';
import { useViewerStore } from '../services/stateService';

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

export const useDicom = () => {
  const { setStudies, setCurrentStudy, setCurrentInstance, setLoading, setError } = useViewerStore();
  const [loadedStudies, setLoadedStudies] = useState<Study[]>([]);

  // Initialize the DICOM loader service
  useEffect(() => {
    dicomLoaderService.init();
  }, []);

  const loadDicomFiles = async (files: FileList | File[]) => {
    setLoading(true);
    setError(null);

    try {
      const filesArray = Array.from(files);
      const study = await dicomLoaderService.loadDicomFiles(filesArray);

      // Update state
      setStudies([study]);
      setLoadedStudies([study]);
      setCurrentStudy(study);

      // Set first instance as current if available
      if (study.seriesList.length > 0 && study.seriesList[0].instanceList.length > 0) {
        setCurrentInstance(study.seriesList[0].instanceList[0]);
      }
    } catch (error) {
      console.error('Error loading DICOM files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load DICOM files');
    } finally {
      setLoading(false);
    }
  };

  const loadStudy = (study: Study) => {
    setCurrentStudy(study);
    setStudies([study]);
    setLoadedStudies([study]);
  };

  const getStudies = (): Study[] => {
    return dicomLoaderService.getLoadedStudies();
  };

  const clearStudies = () => {
    dicomLoaderService.clearStudies();
    setStudies([]);
    setLoadedStudies([]);
    setCurrentStudy(null);
    setCurrentInstance(null);
  };

  return {
    loadDicomFiles,
    loadStudy,
    getStudies,
    loadedStudies,
    clearStudies,
  };
};
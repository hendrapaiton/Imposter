// State management service using Zustand

import { create } from 'zustand';

// Define all types locally to avoid import issues
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

interface ViewerState {
  currentStudy: Study | null;
  currentSeries: string | null;
  currentInstance: Instance | null;
  viewportSettings: {
    windowWidth: number;
    windowLevel: number;
    zoom: number;
    pan: { x: number; y: number };
  };
  isToolActive: boolean;
  activeTool: string | null;
  studies: Study[];
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentStudy: (study: Study) => void;
  setCurrentSeries: (seriesId: string) => void;
  setCurrentInstance: (instance: Instance) => void;
  setViewportSettings: (settings: Partial<ViewerState['viewportSettings']>) => void;
  setActiveTool: (tool: string) => void;
  setIsToolActive: (active: boolean) => void;
  setStudies: (studies: Study[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

export const useViewerStore = create<ViewerState>((set, get) => ({
  currentStudy: null,
  currentSeries: null,
  currentInstance: null,
  viewportSettings: {
    windowWidth: 400,
    windowLevel: 50,
    zoom: 1,
    pan: { x: 0, y: 0 },
  },
  isToolActive: false,
  activeTool: null,
  studies: [],
  loading: false,
  error: null,

  setCurrentStudy: (study) => set({ currentStudy: study }),
  setCurrentSeries: (seriesId) => set({ currentSeries: seriesId }),
  setCurrentInstance: (instance) => set({ currentInstance: instance }),
  setViewportSettings: (settings) => 
    set((state) => ({
      viewportSettings: { ...state.viewportSettings, ...settings }
    })),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setIsToolActive: (active) => set({ isToolActive: active }),
  setStudies: (studies) => set({ studies }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetState: () => set({
    currentStudy: null,
    currentSeries: null,
    currentInstance: null,
    viewportSettings: {
      windowWidth: 400,
      windowLevel: 50,
      zoom: 1,
      pan: { x: 0, y: 0 },
    },
    isToolActive: false,
    activeTool: null,
    studies: [],
    loading: false,
    error: null,
  })
}));
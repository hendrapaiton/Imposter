// Simplified type definitions for the DICOM viewer

export interface DicomImage {
  imageId: string;
  rows: number;
  columns: number;
  pixelData: Uint8Array | Uint16Array;
  spacing?: { row: number; column: number };
  origin?: { x: number; y: number };
}

export interface ViewportSettings {
  windowWidth: number;
  windowLevel: number;
  zoom: number;
  pan: { x: number; y: number };
}
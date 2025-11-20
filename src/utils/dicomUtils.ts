// Utility functions for DICOM processing

import { utilities } from '@cornerstonejs/core';
import dcmjs from 'dcmjs';

/**
 * Creates an imageId for Cornerstone from a DICOM file
 * This uses the cornerstoneWADOImageLoader format
 */
export const createImageId = (file: File): string => {
  // Create a unique imageId for this file
  const fileUrl = URL.createObjectURL(file);
  return `wadouri:${fileUrl}`;
};

/**
 * Converts raw DICOM pixel data to image format suitable for Cornerstone
 */
export const processDicomImage = (dicomData: any) => {
  // Extract image properties from DICOM metadata
  const { 
    pixelData, 
    rows, 
    columns, 
    bitsAllocated, 
    bitsStored,
    highBit,
    pixelRepresentation,
    samplesPerPixel,
    photometricInterpretation
  } = dicomData;

  // Create image object expected by Cornerstone
  const image = {
    imageId: `dicom:${utilities.uuidv4()}`,
    minPixelValue: 0,
    maxPixelValue: Math.pow(2, bitsAllocated) - 1,
    slope: 1,
    intercept: 0,
    windowCenter: 0,
    windowWidth: 0,
    render: null as any, // Will be set by Cornerstone
    getPixelData: () => pixelData,
    rows,
    columns,
    height: rows,
    width: columns,
    color: samplesPerPixel > 1,
    columnPixelSpacing: 1,
    rowPixelSpacing: 1,
    sizeInBytes: pixelData ? pixelData.length * (bitsAllocated / 8) : 0,
  };

  return image;
};

/**
 * Gets DICOM metadata from file
 */
export const getDicomMetadata = (arrayBuffer: ArrayBuffer) => {
  try {
    const dicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer, {});
    const { naturalizeDataset } = dcmjs.data.DicomMetaDictionary;
    const dataset = naturalizeDataset(dicomDict.dict);
    
    return {
      patientName: dataset.PatientName || '',
      patientId: dataset.PatientID || '',
      studyDate: dataset.StudyDate || '',
      studyDescription: dataset.StudyDescription || '',
      seriesDescription: dataset.SeriesDescription || '',
      instanceNumber: dataset.InstanceNumber || 0,
      rows: dataset.Rows || 0,
      columns: dataset.Columns || 0,
      bitsAllocated: dataset.BitsAllocated || 16,
      bitsStored: dataset.BitsStored || 16,
      highBit: dataset.HighBit || 15,
      pixelRepresentation: dataset.PixelRepresentation || 0,
      samplesPerPixel: dataset.SamplesPerPixel || 1,
      photometricInterpretation: dataset.PhotometricInterpretation || 'MONOCHROME2',
      pixelData: dataset.PixelData,
    };
  } catch (error) {
    console.error('Error parsing DICOM metadata:', error);
    throw error;
  }
};

/**
 * Calculates default window/level for the image
 */
export const calculateDefaultWindowLevel = (minPixelValue: number, maxPixelValue: number) => {
  const windowWidth = maxPixelValue - minPixelValue;
  const windowLevel = minPixelValue + (windowWidth / 2);
  
  return {
    windowWidth: Math.max(100, windowWidth), // Ensure minimum window width
    windowLevel,
  };
};
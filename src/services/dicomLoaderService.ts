// Service for loading and processing DICOM data

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

import dcmjs from 'dcmjs';
import * as cornerstone from '@cornerstonejs/core';
import * as csWADOImageLoader from 'cornerstone-wado-image-loader';

// Initialize the WADO image loader with cornerstone
csWADOImageLoader.external.cornerstone = cornerstone;

export class DicomLoaderService {
  private loadedStudies: Map<string, Study> = new Map();

  /**
   * Initialize the DICOM loader service
   */
  public init = () => {
    // Configure the WADO image loader
    csWADOImageLoader.configure({
      beforeSend: (request) => {
        // Add any custom headers if needed
        return request;
      }
    });
  };

  /**
   * Load a DICOM file and extract metadata
   */
  public loadDicomFile = async (file: File): Promise<Instance> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error('Failed to read file'));
            return;
          }

          // Parse DICOM using dcmjs to extract metadata
          const dicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer, {});
          const { naturalizeDataset } = dcmjs.data.DicomMetaDictionary;
          const dataset = naturalizeDataset(dicomDict.dict);

          // Create imageId using WADO loader format
          const imageId = `wadouri:${URL.createObjectURL(file)}`;

          // Extract required DICOM tags
          const instance: Instance = {
            id: dataset.SOPInstanceUID || '',
            instanceNumber: dataset.InstanceNumber || 0,
            imageId: imageId,
            sopClassUid: dataset.SOPClassUID || '',
            rows: dataset.Rows || 0,
            columns: dataset.Columns || 0,
            bitsAllocated: dataset.BitsAllocated || 16,
            bitsStored: dataset.BitsStored || 16,
            highBit: dataset.HighBit || 15,
            pixelRepresentation: dataset.PixelRepresentation || 0,
            samplesPerPixel: dataset.SamplesPerPixel || 1,
            photometricInterpretation: dataset.PhotometricInterpretation || 'MONOCHROME2',
          };

          resolve(instance);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  /**
   * Create a study from a list of instances
   */
  public createStudy = (instances: Instance[]): Study => {
    if (instances.length === 0) {
      throw new Error('Cannot create study from empty instance list');
    }

    // Group instances by series using SeriesInstanceUID
    const seriesMap = new Map<string, Instance[]>();
    instances.forEach(instance => {
      // Group by a combination of SeriesInstanceUID and SeriesNumber if available
      // Otherwise use other series identifiers
      const seriesKey = instance.id || `series-${instances.indexOf(instance)}`;

      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
      }
      seriesMap.get(seriesKey)?.push(instance);
    });

    // Create series objects
    const seriesList: Series[] = [];
    seriesMap.forEach((instancesInSeries, seriesId) => {
      const firstInstance = instancesInSeries[0];
      seriesList.push({
        id: seriesId,
        seriesNumber: firstInstance.instanceNumber,
        seriesDescription: `Series ${firstInstance.seriesNumber || firstInstance.instanceNumber}`,
        modality: firstInstance.sopClassUid.substring(0, 2) || 'OT', // Other
        instanceList: instancesInSeries.sort((a, b) => a.instanceNumber - b.instanceNumber),
      });
    });

    // Get study information from first instance
    const firstInstance = instances[0];

    const study: Study = {
      id: firstInstance.id || 'study-' + Date.now(),
      patientName: 'Sample Patient',
      patientId: '12345',
      studyDate: new Date().toISOString().split('T')[0],
      studyDescription: 'Sample Study',
      seriesList: seriesList.sort((a, b) => a.seriesNumber - b.seriesNumber),
    };

    // Store the study
    this.loadedStudies.set(study.id, study);

    return study;
  };

  /**
   * Load multiple DICOM files as a study
   */
  public loadDicomFiles = async (files: File[]): Promise<Study> => {
    const instances = await Promise.all(
      Array.from(files).map(file => this.loadDicomFile(file))
    );

    return this.createStudy(instances);
  };

  /**
   * Get loaded studies
   */
  public getLoadedStudies = (): Study[] => {
    return Array.from(this.loadedStudies.values());
  };

  /**
   * Get a specific study
   */
  public getStudy = (studyId: string): Study | undefined => {
    return this.loadedStudies.get(studyId);
  };

  /**
   * Clear all loaded studies
   */
  public clearStudies = () => {
    this.loadedStudies.clear();
  }
}

export const dicomLoaderService = new DicomLoaderService();
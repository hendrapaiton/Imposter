// Configuration service for the DICOM viewer

export interface ViewerConfig {
  routerBasename: string;
  maxNumberOfWebWorkers: number;
  startWithHiddenMouseCursor: boolean;
  showLoadingIndicator: boolean;
  showStudyList: boolean;
  servers: {
    dicomWeb?: {
      wadoUriRoot?: string;
      qidoRoot?: string;
      wadoRoot?: string;
      qidoSupportsIncludeField?: boolean;
      supportsReject?: boolean;
      imageRendering?: string;
      thumbnailRendering?: string;
    };
  };
  extensions: string[];
  modes: string[];
  customizationService: Record<string, any>;
  studyPrefetcher?: Record<string, any>;
}

class ConfigService {
  private config: ViewerConfig = {
    routerBasename: '/',
    maxNumberOfWebWorkers: 3,
    startWithHiddenMouseCursor: false,
    showLoadingIndicator: true,
    showStudyList: true,
    servers: {},
    extensions: [],
    modes: [],
    customizationService: {},
  };

  /**
   * Set the application configuration
   */
  public setConfig = (config: Partial<ViewerConfig>) => {
    this.config = { ...this.config, ...config };
  };

  /**
   * Get the application configuration
   */
  public getConfig = (): ViewerConfig => {
    return { ...this.config };
  };

  /**
   * Get a specific configuration value
   */
  public get = <T extends keyof ViewerConfig>(key: T): ViewerConfig[T] => {
    return this.config[key];
  };

  /**
   * Set a specific configuration value
   */
  public set = <T extends keyof ViewerConfig>(key: T, value: ViewerConfig[T]) => {
    this.config[key] = value;
  };
}

export const configService = new ConfigService();
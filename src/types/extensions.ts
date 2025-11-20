// Extension system type definitions

export interface Extension {
  id: string;
  preRegistration?: (context: ExtensionContext) => void | Promise<void>;
  getViewportModule?: () => ViewportModule | Promise<ViewportModule>;
  getToolbarModule?: () => ToolbarModule | Promise<ToolbarModule>;
  getPanelModule?: () => PanelModule | Promise<PanelModule>;
}

export interface ExtensionContext {
  servicesManager: ServicesManager;
  commandsManager: CommandsManager;
}

export interface ServicesManager {
  services: Record<string, any>;
  registerService: (service: ServiceRegistration) => void;
  unregisterService: (id: string) => void;
}

export interface CommandsManager {
  run: (commandName: string, params?: any) => any;
  register: (command: Command) => void;
}

export interface ServiceRegistration {
  id: string;
  constructor: new (...args: any[]) => any;
  instance?: any;
}

export interface Command {
  name: string;
  execute: (params?: any) => any;
}

export interface ViewportModule {
  name: string;
  component: React.ComponentType<any>;
}

export interface ToolbarModule {
  name: string;
  items: ToolbarItem[];
}

export interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  callback: () => void;
}
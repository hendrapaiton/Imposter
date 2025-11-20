// Tool service for managing viewer tools

import { cornerstoneService } from './cornerstoneService';

export type ToolName = 'Pan' | 'Zoom' | 'WindowLevel' | 'StackScroll';

export class ToolService {
  private activeTool: ToolName | null = null;
  private toolGroup: string = 'default';

  /**
   * Set the active tool
   */
  public setActiveTool = (toolName: ToolName) => {
    this.activeTool = toolName;
    cornerstoneService.setTool(toolName, this.toolGroup);
  };

  /**
   * Get the current active tool
   */
  public getActiveTool = (): ToolName | null => {
    return this.activeTool;
  };

  /**
   * Activate Pan tool
   */
  public activatePanTool = () => {
    this.setActiveTool('Pan');
  };

  /**
   * Activate Zoom tool
   */
  public activateZoomTool = () => {
    this.setActiveTool('Zoom');
  };

  /**
   * Activate Window Level tool
   */
  public activateWindowLevelTool = () => {
    this.setActiveTool('WindowLevel');
  };

  /**
   * Activate Stack Scroll tool
   */
  public activateStackScrollTool = () => {
    this.setActiveTool('StackScroll');
  };

  /**
   * Reset all tools to default state
   */
  public resetTools = () => {
    this.activeTool = null;
  };
}

export const toolService = new ToolService();
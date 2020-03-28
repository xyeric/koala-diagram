
export enum DiagramType {
  CLASS = 'class',
  SEQUENCE = 'sequence',
  FLOWCHART = 'flowchart',
  STATE = 'state',
  GANTT = 'gantt',
  PIE = 'pie',
}

export enum FileFormat {
  MERM = 'merm',
  PNG = 'png',
  JPG = 'jpg',
  SVG = 'svg',
}

export interface IWindowUrlParams {
  filePath?: string;
  useExample?: DiagramType;
}

export interface IInitIpcOptions {
  type: DiagramType;
}

export interface IOpenIpcOptions {
  filePath: string;
}

export interface ISaveIpcOptions {
  format: FileFormat;
}

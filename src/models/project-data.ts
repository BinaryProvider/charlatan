export interface ProjectData {
  name: string,
  version: string,
  outDir: string,
  swagger: string,
  definitions?: string[],
  definitionDir?: string,
  options?: ProjectOptions,
  mode?: ProjectMode
}

export enum ProjectMode {
  Create = 0,
  Update = 1
}

export interface ProjectOptions {
  file?: unknown;
  model?: unknown;
  endpoint?: unknown;
}
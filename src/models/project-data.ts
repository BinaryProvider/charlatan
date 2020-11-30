export interface ProjectData {
  name: string,
  version: string,
  outDir: string,
  swagger: string,
  schemas?: string[],
  schemaDir?: string,
  extensions?: string[],
  extensionDir?: string,
  options?: ProjectOptions,
  mode?: ProjectMode
}

export enum ProjectMode {
  Create = 0,
  Update = 1
}

export interface ProjectOptions {
  file?: FileOptions;
  model?: EntityOptions;
  endpoint?: EntityOptions;
}

export interface FileOptions {
  name?: StringOptions;
}

export interface EntityOptions {
  name?: StringOptions;
}

export interface StringOptions {
  find?: string;
  replace?: string;
}
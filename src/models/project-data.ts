export interface ProjectData {
  name: string;
  version: string;
  outDir: string;
  swagger: string;
  port: number;
  models?: boolean;
  generatorVersion?: string;
  schemas?: string[];
  schemaDir?: string;
  extensions?: string[];
  extensionDir?: string;
  masterdata?: string[];
  masterdataDir?: string;
  options?: ProjectOptions;
  mode?: ProjectMode;
}

export enum ProjectMode {
  Create = 0,
  Update = 1,
}

export interface ProjectOptions {
  auth?: AuthOptions;
  file?: FileOptions;
  model?: EntityOptions;
  endpoint?: EntityOptions;
  createRouteHandlers?: boolean;
}

export interface AuthOptions {
  enabled?: boolean;
  secret?: string;
  rule?: string;
  method?: 'verify' | 'decode';
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

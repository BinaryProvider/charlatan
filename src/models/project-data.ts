export interface ProjectData {
  name: string,
  version: string,
  outDir: string,
  swagger: string,
  definitions?: string[],
  definitionDir?: string,
  options?: ProjectOptions,
}

export interface ProjectOptions {
  file?: unknown;
  model?: unknown;
  endpoint?: unknown;
}
export interface CoreProjectData {
  name: string,
  version: string,
  outDir: string,
  swagger: string,
  definitions?: string[],
  options?: CoreProjectOptions,
}

export interface CoreProjectOptions {
  file?: unknown;
  model?: unknown;
  endpoint?: unknown;
}
import fsx from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';
import Prettier from 'prettier';
import './global/string.extensions';
import { CoreProjectData, CoreProjectOptions } from './models/core-project-data';
import { EndpointData } from './models/endpoint-data';
import { ModelData } from './models/model-data';
import { SchemasData } from './models/schema-data';

export class CoreProject {
  static readonly CORE_DIR = 'src/core';
  static readonly TEMPLATE_DIR = path.join('src', 'templates');

  public static initialize(data: CoreProjectData): void {
    // fsx.removeSync(data.outDir);

    try {
      fsx.mkdirSync(data.outDir);
      fsx.mkdirSync(path.join(data.outDir, 'src'));
      fsx.mkdirSync(path.join(data.outDir, 'src', 'api'));
      fsx.mkdirSync(path.join(data.outDir, 'src', 'models'));
    } catch (error) {
      // do nothing 
    }

    this.createPackageJson(data);
    this.copyCoreFiles(data);
  }

  public static createModels(data: CoreProjectData, models: ModelData[], options?: CoreProjectOptions): void {
    models?.forEach(model => this.createModel(model, data.outDir, options));
  }

  public static createEndpoints(data: CoreProjectData, endpoints: EndpointData[], options?: CoreProjectOptions): void {
    endpoints?.forEach(endpoint => this.createEndpoint(endpoint, data.outDir, options));
  }

  public static createSchemas(data: CoreProjectData, endpoints: EndpointData[]): void {
    if (!endpoints) return;
    const schemaData = this.createSchemaData(endpoints);
    const sourcePath = path.join(this.TEMPLATE_DIR, 'schemas.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = 'schemas.ts';
    const outputData = this.format(template(schemaData));
    const outputPath = path.join(data.outDir, 'src', fileName);
    fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
  }

  private static createPackageJson(data: CoreProjectData): void {
    const sourcePath = path.join(this.TEMPLATE_DIR, 'package.json.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const outputData = this.format(template(data), { parser: 'json'});
    const outputPath = path.join(data.outDir, 'package.json');
    fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
  }

  private static createModel(model: ModelData, outDir: string, options: CoreProjectOptions): void {
    if (!model) return;
    const sourcePath = path.join(this.TEMPLATE_DIR, 'model.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = this.formatFilename(`${model.name.toHyphenCase()}.ts`, options);
    const outputData = this.format(template(model));
    const outputPath = path.join(outDir, 'src', 'models', fileName);
    fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
  }

  private static createEndpoint(endpoint: EndpointData, outDir: string, options: CoreProjectOptions): void {
    if (!endpoint) return;
    const sourcePath = path.join(this.TEMPLATE_DIR, 'endpoint.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = this.formatFilename(`${endpoint.name.toHyphenCase()}.ts`, options);
    const outputData = this.format(template(endpoint));
    const outputPath = path.join(outDir, 'src', 'api', fileName);
    fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
  }

  private static createSchemaData(endpoints: EndpointData[]): SchemasData {
    return {
      schemas: endpoints.map(endpoint => {
        return {
          name: endpoint.name,
          filename: endpoint.name.toHyphenCase()
        };
      })
    };
  }

  private static format(input: string, options?: Prettier.Options): string {
    const defaultOptions = { semi: true, quotes: 'single', parser: 'typescript' };
    const formatOptions = { ...defaultOptions, ...options };
    return Prettier.format(input, formatOptions);
  }

  private static copyCoreFiles(data: CoreProjectData): void {
    fsx.copySync(this.CORE_DIR, data.outDir);
  }

  private static formatFilename(filename: string, options?: CoreProjectOptions): string {
    if (!options.file || !options.file['name']) return filename;
    const find = options.file['name'].find;
    const replace = options.file['name'].replace;
    return filename.replace(find, replace);
  }
}
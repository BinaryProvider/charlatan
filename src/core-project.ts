import fsx from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';
import './global/string.extensions';
import { CoreProjectData } from './models/core-project-data';
import { EndpointData } from './models/endpoint-data';
import { ModelData } from './models/model-data';

export class CoreProject {
  static readonly CORE_DIR = 'src/core';
  static readonly TEMPLATE_DIR = path.join('src', 'templates');

  public static initialize(data: CoreProjectData): void {
    fsx.removeSync(data.outDir);
    fsx.mkdirSync(data.outDir);

    this.createPackageJson(data);
    this.copyCoreFiles(data);
  }

  public static saveModels(data: CoreProjectData, models: ModelData[]): void {
    models?.forEach(model => this.saveModel(model, data.outDir));
  }

  public static saveEndpoints(data: CoreProjectData, endpoints: EndpointData[]): void {
    endpoints?.forEach(endpoint => this.saveEndpoint(endpoint, data.outDir));
  }

  private static createPackageJson(data: CoreProjectData): void {
    const sourcePath = path.join(this.TEMPLATE_DIR, 'package.json.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const outputData = template(data);
    const outputPath = path.join(data.outDir, 'package.json');
    fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
  }

  private static saveModel(model: ModelData, outDir: string): void {
    if (!model) return;
    const sourcePath = path.join(this.TEMPLATE_DIR, 'model.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = `${model.name.toHyphenCase()}.ts`;
    const outputData = template(model);
    const outputPath = path.join(outDir, 'src', 'models', fileName);
    fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
  }

  private static saveEndpoint(endpoint: EndpointData, outDir: string): void {
    if (!endpoint) return;
    const sourcePath = path.join(this.TEMPLATE_DIR, 'endpoint.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = `${endpoint.name.toHyphenCase()}.ts`;
    const outputData = template(endpoint);
    const outputPath = path.join(outDir, 'src', 'api', fileName);
    fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
  }

  private static copyCoreFiles(data: CoreProjectData): void {
    fsx.copySync(this.CORE_DIR, data.outDir);
  }
}
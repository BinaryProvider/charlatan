import fsx from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';
import Prettier from 'prettier';
import { CLI } from './cli';
import './global/string.extensions';
import { EndpointData } from './models/endpoint-data';
import { ModelData } from './models/model-data';
import { ProjectData, ProjectMode, ProjectOptions } from './models/project-data';
import { SchemasData } from './models/schema-data';

export class Project {
  static readonly CORE_DIR = './core';
  static readonly TEMPLATE_DIR = './templates';

  public static async initialize(data: ProjectData): Promise<void> {
    if (data.mode === ProjectMode.Update) {
      return this.updateStructure(data);
    }

    return this.createStructure(data);
  }

  public static async createStructure(data: ProjectData): Promise<void> {
    CLI.note('Creating new project...');

    await fsx.remove(data.outDir);

    await Promise.all([
      fsx.mkdir(data.outDir),
      fsx.mkdir(path.join(data.outDir, 'src')),
      fsx.mkdir(path.join(data.outDir, 'src', 'api')),
      fsx.mkdir(path.join(data.outDir, 'src', 'models'))
    ]);

    // try {
    //   fsx.mkdirSync(data.outDir);
    //   fsx.mkdirSync(path.join(data.outDir, 'src'));
    //   fsx.mkdirSync(path.join(data.outDir, 'src', 'api'));
    //   fsx.mkdirSync(path.join(data.outDir, 'src', 'models'));
    // } catch (error) {
    //   CLI.error(error);
    // }

    return new Promise((resolve) => {
      this.createPackageJson(data);
      this.copyCoreFiles(data);
      resolve();
    });
  }

  public static async updateStructure(data: ProjectData): Promise<void> {
    CLI.note('Updating existing project...');

    await Promise.all([
      fsx.remove(path.join(data.outDir, 'src', 'api')),
      fsx.remove(path.join(data.outDir, 'src', 'models')),
    ]);

    await Promise.all([
      fsx.mkdir(path.join(data.outDir, 'src', 'api')),
      fsx.mkdir(path.join(data.outDir, 'src', 'models'))
    ]);

    return new Promise((resolve) => resolve());
  }

  public static createModels(data: ProjectData, models: ModelData[], options?: ProjectOptions): void {
    models?.forEach(model => this.createModel(model, data.outDir, options));
  }

  public static createEndpoints(data: ProjectData, endpoints: EndpointData[], options?: ProjectOptions): void {
    endpoints?.forEach(endpoint => this.createEndpoint(endpoint, data.outDir, options));
  }

  public static createRC(data: ProjectData, options: ProjectOptions): void {
    if (data.mode === ProjectMode.Update) return;

    const config = JSON.stringify({
      name: data.name,
      version: data.version,
      swagger: data.swagger,
      outDir: path.normalize(path.join(data.outDir, '..')),
      definitions: data.schemas,
      definitionDir: data.schemaDir,
      extensions: data.extensions,
      extensionDir: data.extensionDir,
      options: { ...options }
    });

    const outputData = this.format(config, { parser: 'json'});
    const outputPath = path.join(data.outDir, '.charlatanrc');
  
    try {
      fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
    } catch (error) {
      CLI.error(error);
    }
  }

  public static createSchemas(data: ProjectData, endpoints: EndpointData[]): void {
    if (!endpoints) return;
    const root = path.dirname(require.main.filename);
    const schemaData = this.createSchemaData(endpoints);
    const sourcePath = path.join(root, this.TEMPLATE_DIR, 'schemas.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = 'schemas.ts';
    const outputData = this.format(template(schemaData));
    const outputPath = path.join(data.outDir, 'src', fileName);

    try {
      fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
    } catch (error) {
      CLI.error(error);
    }
  }

  public static async parseExtensions(files: string[]): Promise<unknown[]>{
    return await Promise.all(files.map(file => import(file)));
  }

  public static createExtensions(data: ProjectData, extensions: unknown[]): void {
    const inputData = {
      extensions: {}
    };

    extensions = extensions.map(extension => extension['default']);

    extensions.forEach(extension => {
      const props = Object.keys(extension);
      props.forEach(prop => {
        let value = extension[prop];
        if (typeof value === 'function') {
          value = value + '';
        }
        inputData.extensions[prop] = value;
      });
    });

    const root = path.dirname(require.main.filename);
    const sourcePath = path.join(root, this.TEMPLATE_DIR, 'extensions.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = 'extensions.ts';
    const outputData = this.format(template(inputData));
    const outputPath = path.join(data.outDir, 'src', fileName);

    try {
      fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
    } catch (error) {
      CLI.error(error);
    }
  }

  private static createPackageJson(data: ProjectData): void {
    const root = path.dirname(require.main.filename);
    const sourcePath = path.join(root, this.TEMPLATE_DIR, 'package.json.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const outputData = this.format(template(data), { parser: 'json'});
    const outputPath = path.join(data.outDir, 'package.json');

    try {
      fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
    } catch (error) {
      CLI.error(error);
    }
  }

  private static createModel(model: ModelData, outDir: string, options: ProjectOptions): void {
    if (!model) return;
    const root = path.dirname(require.main.filename);
    const sourcePath = path.join(root, this.TEMPLATE_DIR, 'model.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = this.formatFilename(`${model.name.toHyphenCase()}.ts`, options);
    const outputData = this.format(template(model));
    const outputPath = path.join(outDir, 'src', 'models', fileName);

    try {
      fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
    } catch (error) {
      CLI.error(error);
    }
  }

  private static createEndpoint(endpoint: EndpointData, outDir: string, options: ProjectOptions): void {
    if (!endpoint) return;
    const root = path.dirname(require.main.filename);
    const sourcePath = path.join(root, this.TEMPLATE_DIR, 'endpoint.ts.template');
    const source = fsx.readFileSync(sourcePath, { encoding: 'utf8'});
    const template = handlebars.compile(source);
    const fileName = this.formatFilename(`${endpoint.name.toHyphenCase()}.ts`, options);
    const outputData = this.format(template(endpoint));
    const outputPath = path.join(outDir, 'src', 'api', fileName);

    try {
      fsx.writeFileSync(outputPath, outputData, { encoding: 'utf8' });
    } catch (error) {
      CLI.error(error);
    }
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
    const defaultOptions = { semi: true, singleQuote: true, parser: 'typescript' };
    const formatOptions = { ...defaultOptions, ...options };
    return Prettier.format(input, formatOptions);
  }

  private static copyCoreFiles(data: ProjectData): void {
    const root = path.dirname(require.main.filename);
    const copyPath = path.join(root, this.CORE_DIR);
    fsx.copySync(copyPath, data.outDir);
  }

  private static formatFilename(filename: string, options?: ProjectOptions): string {
    if (!options.file || !options.file['name']) return filename;
    const find = options.file['name'].find;
    const replace = options.file['name'].replace;
    return filename.replace(find, replace);
  }
}
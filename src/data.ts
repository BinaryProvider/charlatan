import fsx from 'fs-extra';
import minimist from 'minimist';
import path from 'path';
import readlineSync from 'readline-sync';
import { format } from 'string-kit';
import { ProjectData, ProjectMode } from './models/project-data';

type RequiredOptions = {
  [name: string]: RequiredOption
}

type RequiredOption = {
    question: string,
    default: string
};

export class Data {
  public static args = minimist(process.argv.slice(2));

  private static readonly REQUIRED_OPTIONS: RequiredOptions = {
    ['name']: {
      question: 'Name of API:',
      default: 'charlatan-api'
    },
    ['version']: {
      question: 'Version',
      default: '1.0.0'
    },
    ['outDir']: {
      question: 'Out dir:',
      default: path.dirname(require.main.filename)
    },
    ['swagger']: {
      question: 'Swagger definition:',
      default: 'https://petstore.swagger.io/v2/swagger.json',
    }
  }

  public static initialize(): ProjectData {
    const mode = this.args['update'] ? ProjectMode.Update : ProjectMode.Create;

    let data = this.loadConfigurationFile();
    data = { ...data, ...this.args };

    const missingProps = this.validate(data);
    const inputProps = this.getInputProps(data, missingProps);
    data = { ...data, ...inputProps };

    this.loadDefinitions(data);
    this.loadExtensions(data);
    this.loadMasterdata(data);

    data.outDir = path.join(data.outDir, data.name);
    data.mode = mode;

    if (missingProps.length > 0) {
      console.log('');
    }

    return data;
  }

  private static loadConfigurationFile(): ProjectData {
    const dir = process.env.INIT_CWD ?? process.cwd();
    const files = fsx.readdirSync(dir);

    let configFile = files.find(file => file === '.charlatanrc');
    if (!configFile) return;

    configFile = fsx.readFileSync(path.join(dir, configFile), { encoding: 'utf8' });

    return JSON.parse(configFile);
  }

  private static validate(data: ProjectData): string[] {
    const existingProps = Object.keys(data);
    const requiredProps = Object.keys(this.REQUIRED_OPTIONS);
    const missingProps = requiredProps.filter(x => !existingProps.includes(x));
    return missingProps;
  }

  private static getInputProps(data: ProjectData, props: string[]): ProjectData {
    props.forEach(prop => {
      const option = this.REQUIRED_OPTIONS[prop];
      data[prop] = this.getInput(option);
    });
    return data;
  }

  private static getInput(option: RequiredOption): string {
    const output = format(`^+${option.question} ^:^-(${option.default}): `);
    const input = readlineSync.question(output);
    return input.length > 0 ? input : option.default;
  }

  private static loadDefinitions(data: ProjectData): void {
    if (!data.schemaDir) return;

    const files = fsx.readdirSync(data.schemaDir)
      .filter(file => {
        const extension = path.extname(file).toLowerCase();
        return extension === '.ts' || extension === '.js';
      })
      .map(file => path.join(data.schemaDir, file));

    data.schemas = [...(data.schemas ?? []), ...files];
  }

  private static loadExtensions(data: ProjectData): void {
    if (!data.extensionDir) return;

    const files = fsx.readdirSync(data.extensionDir)
      .filter(file => {
        const extension = path.extname(file).toLowerCase();
        return extension === '.ts' || extension === '.js';
      })
      .map(file => path.join(data.extensionDir, file));

    data.extensions = [...(data.extensions ?? []), ...files];
  }

  private static loadMasterdata(data: ProjectData): void {
    if (!data.masterdataDir) return;

    const files = fsx.readdirSync(data.masterdataDir)
      .filter(file => {
        const extension = path.extname(file).toLowerCase();
        return extension === '.ts' || extension === '.js';
      })
      .map(file => path.join(data.masterdataDir, file));

    data.masterdata = [...(data.masterdata ?? []), ...files];
  }
}
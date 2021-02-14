import Table from 'cli-table';
import figlet from 'figlet';
import { format } from 'string-kit';
import { version } from './global/version';

export class CLI {
  private static readonly ARG_COLORS = {
    [0]: '^:^M',
    [1]: '^:^c',
    [2]: '^:^y',
    [3]: '^:^G',
    [4]: '^:^B',
  };

  public static splash(): void {
    console.log(format(`^+^_^YCHARLATAN (v${version})`));
    console.log('');
  }

  public static error(
    text: string,
    leadingSpace?: boolean,
    trailingSpace?: boolean
  ): void {
    if (leadingSpace) console.log('');
    console.log(format(`^R^+${text}`));
    if (trailingSpace) console.log('');
  }

  public static success(
    text: string,
    leadingSpace?: boolean,
    trailingSpace?: boolean
  ): void {
    if (leadingSpace) console.log('');
    console.log(format(`^G^+${text}`));
    if (trailingSpace) console.log('');
  }

  public static note(
    text: string,
    leadingSpace?: boolean,
    trailingSpace?: boolean
  ): void {
    if (leadingSpace) console.log('');
    console.log(format(`^b${text}`));
    if (trailingSpace) console.log('');
  }

  public static info(
    text: string,
    leadingSpace?: boolean,
    trailingSpace?: boolean
  ): void {
    if (leadingSpace) console.log('');
    console.log(format(`^w${text}`));
    if (trailingSpace) console.log('');
  }

  public static text(
    text: string,
    leadingSpace?: boolean,
    trailingSpace?: boolean
  ): void {
    if (leadingSpace) console.log('');
    console.log(format(`${text}`));
    if (trailingSpace) console.log('');
  }

  public static help(): void {
    const logo = figlet.textSync('       charlatan       ', {
      font: 'Rounded',
    });
    console.log(format(`^Y^+${logo}`));
    console.log(
      '-----------------------------------------------------------------------------------'
    );
    console.log(`API GENERATOR\t\t\t\t\t\t             Version: ${version}`);
    console.log(
      '-----------------------------------------------------------------------------------'
    );
    console.log('');

    const table = new Table({
      head: ['argument', 'description'],
      colWidths: [35, 45],
    });

    table.push(
      [this.argFormat('--create'), this.descFormat('Create a new project')],
      [this.argFormat('--models'), this.descFormat('Generate models only')],
      [
        this.argFormat('--update'),
        this.descFormat('Update an existing project'),
      ],
      [this.argFormat('--name'), this.descFormat('API name')],
      [this.argFormat('--version'), this.descFormat('API version')],
      [this.argFormat('--outDir'), this.descFormat('Output directory')],
      [
        this.argFormat('--swagger'),
        this.descFormat('Swagger definition (url or file)'),
      ],
      [
        this.argFormat('--port'),
        this.descFormat('The port the API listens to'),
      ],
      [
        this.argFormat('--schemas'),
        this.descFormat('Custom schema definition'),
      ],
      [
        this.argFormat('--schemaDir'),
        this.descFormat('Directory with schema definitions'),
      ],
      [
        this.argFormat('--extensions'),
        this.descFormat('Custom schema extensions'),
      ],
      [
        this.argFormat('--extensionDir'),
        this.descFormat('Directory with schema extensions'),
      ],
      [this.argFormat('--masterdata'), this.descFormat('Master data input')],
      [
        this.argFormat('--masterdataDir'),
        this.descFormat('Directory with master data input'),
      ],
      [this.argFormat('--options'), this.descFormat('Parsing options')],
      [this.argFormat('--options.file'), this.descFormat('File options')],
      [
        this.argFormat('--options.file.name'),
        this.descFormat('Filename options'),
      ],
      [
        this.argFormat('--options.file.name.find'),
        this.descFormat('Filename find (regex)'),
      ],
      [
        this.argFormat('--options.file.name.replace'),
        this.descFormat('Filename replace (string)'),
      ],
      [this.argFormat('--options.model'), this.descFormat('Model options')],
      [
        this.argFormat('--options.model.name'),
        this.descFormat('Model name options'),
      ],
      [
        this.argFormat('--options.model.name.find'),
        this.descFormat('Model name find (regex)'),
      ],
      [
        this.argFormat('--options.model.name.replace'),
        this.descFormat('Model name replace (string)'),
      ],
      [
        this.argFormat('--options.endpoint'),
        this.descFormat('Endpoint options'),
      ],
      [
        this.argFormat('--options.endpoint.name'),
        this.descFormat('Endpoint name options'),
      ],
      [
        this.argFormat('--options.endpoint.name.find'),
        this.descFormat('Endpoint name find (regex)'),
      ],
      [
        this.argFormat('--options.endpoint.name.replace'),
        this.descFormat('Endpoint name replace (string)'),
      ]
    );

    console.log(table.toString());
  }

  public static version(): void {
    console.log(`v${version}`);
  }

  private static argFormat(input: string): string {
    const parts = input
      .split('.')
      .map((part, index) => `${this.ARG_COLORS[index]}${part}`);
    return format(parts.join('.'));
  }

  private static descFormat(input: string): string {
    return format(input);
  }
}

import * as fs from 'fs';

export class Database {
  public static readonly FILE = 'data.json';

  public static get(key: string, filter?: any): any {
    const data = fs.readFileSync(this.FILE, {
      encoding: 'utf-8',
    });

    const result = JSON.parse(data)[key] || [];

    return filter ? filter(result) : result;
  }
}
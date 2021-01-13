import * as fs from 'fs';

export class Database {
  public static readonly FILE = 'data.json';
  public static REPOSITORY: any;

  public static get(key: string, filter?: any): any {
    const result = Database.REPOSITORY[key] || [];
    return filter ? filter(result) : result;
  }

  public static set(key: string, data: any): void {
    Database.REPOSITORY[key] = data;
  }

  public static load(): void {
    Database.REPOSITORY = JSON.parse(fs.readFileSync(Database.FILE, {
      encoding: 'utf-8',
    }));
  }
}
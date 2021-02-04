import * as fs from "fs";

export class Database {
  public static readonly FILE = "data.json";
  public static REPOSITORY: Object;

  private static ROUTER: any;

  public static get(key: string, filter?: any): any {
    const result = Database.REPOSITORY[key] || [];
    return filter ? filter(result) : result;
  }

  public static set(key: string, data: Object): void {
    Database.REPOSITORY[key] = data;
    fs.writeFileSync(
      Database.FILE,
      JSON.stringify(Database.REPOSITORY, null, 1),
      { encoding: "utf-8" }
    );
    Database.ROUTER.db.setState(Database.REPOSITORY);
  }

  public static load(router: any): void {
    Database.ROUTER = router;
    Database.REPOSITORY = JSON.parse(
      fs.readFileSync(Database.FILE, {
        encoding: "utf-8",
      })
    );
  }
}

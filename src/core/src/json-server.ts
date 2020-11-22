import * as fs from 'fs';
import {
  bodyParser, create as createServer, defaults, router as createRouter
} from 'json-server';
import { mocker } from 'mocker-data-generator';
import { Database } from './database';
import { SCHEMAS } from './schemas';

export type JSONServerArguments = {
  port: number;
}

export class JSONServer {
  private server: any;
  private mocker = mocker();
  
  public async start(args: JSONServerArguments): Promise<any> {
    this.applySchemas();

    await this.mocker.build().then(data => {
      fs.writeFileSync(Database.FILE, JSON.stringify(data, null, 1));
    })

    this.server = createServer();

    const router = createRouter(Database.FILE);
    const middlewares = defaults();

    this.applyCustomRoutes();

    this.server.use(bodyParser);
    this.server.use(middlewares);
    this.server.use(router)

    this.server.listen(args.port, () => {
      console.log(`JSON Server is running on http://localhost:${args.port}`);
    });
  }

  private applySchemas(): void {
    SCHEMAS.forEach(schema => {
      this.mocker.schema(schema.name, schema.definition, schema.count)
    })
  }

  private applyCustomRoutes(): void {
    SCHEMAS.forEach(schema => {
      if (!schema.routes) return;

      Object.keys(schema.routes).forEach(route => {
        const handler = schema.routes[route];
        this.server.use(route, handler);
      })
    })
  }
}
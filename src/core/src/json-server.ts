import * as fs from 'fs';
import {
  bodyParser, create as createServer, defaults, router as createRouter
} from 'json-server';
import * as jwt from 'jsonwebtoken';
import { mocker } from 'mocker-data-generator';
import { Database } from './database';
import { Options } from './options';
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

    Database.load();

    this.server = createServer();

    const router = createRouter(Database.FILE);
    const middlewares = defaults();

    this.server.use(bodyParser);
    this.server.use(middlewares);

    this.configureAuth();
    this.applyCustomRoutes();

    this.server.use(router);

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

  private configureAuth(): void {
    if (!Options.auth.enabled) return;

    const unauthorizedErrorMessage = { status: 401, message: 'Unauthorized' };
    const rule = new RegExp(Options.auth.rule);

    this.server.use(rule, (req, res, next) => {
      if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        res.status(401).json(unauthorizedErrorMessage);
        return;
      }

      const token = req.headers.authorization.split(' ')[1];

      try {
        jwt.verify(token, Options.auth.secret);
        req.token = token;
        next();
      } catch (error) {
        res.status(401).json(unauthorizedErrorMessage);
      }
    });
  }
}
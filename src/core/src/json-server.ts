import * as fs from 'fs';
import {
  bodyParser,
  create as createServer,
  defaults,
  router as createRouter,
} from 'json-server';
import * as jwt from 'jsonwebtoken';
import { mocker } from 'mocker-data-generator';
import { Database } from './database';
import { Options } from './options';
import { SCHEMAS } from './schemas';

export type JSONServerArguments = {
  port: number;
};

export class JSONServer {
  private server: any;
  private mocker = mocker();

  public async start(args: JSONServerArguments): Promise<any> {
    this.applySchemas();

    await this.mocker.build().then((data) => {
      fs.writeFileSync(Database.FILE, JSON.stringify(data, null, 1));
    });

    this.server = createServer();

    const router = createRouter(Database.FILE);
    const middlewares = defaults();

    Database.load(router);

    this.server.use(bodyParser);
    this.server.use(middlewares);

    this.server.use(async (req, res, next) => {
      if (req.method === "POST") {
        if (req.url === "/api/reset") {
          this.mocker.reset();

          await this.mocker.build().then((data) => {
            fs.writeFileSync(Database.FILE, JSON.stringify(data, null, 1));
          });

          Database.load(router);
          router.db.setState(Database.REPOSITORY);
          res.status(200).json();
          return;
        }
      }
      next();
    });

    this.configureAuth();
    this.applyCustomRoutes();

    this.server.use(router);

    this.server.listen(args.port, () => {
      console.log(`JSON Server is running on http://localhost:${args.port}`);
    });
  }

  private applySchemas(): void {
    SCHEMAS.forEach((schema) => {
      const count = typeof schema.count === 'number' ? schema.count : (schema.count as Function)();
      this.mocker.schema(schema.name, schema.definition, count);
    });
  }

  private applyCustomRoutes(): void {
    SCHEMAS.forEach((schema) => {
      if (!schema.routes) return;

      Object.keys(schema.routes).forEach((route) => {
        const method = schema.routes[route].method;
        const handler = schema.routes[route].handler;

        if (!method) {
          this.server.use(route, handler);
        } else {
          if (!method) {
            this.server.use(route, handler);
          } else {
            const verb = method.toUpperCase();
            switch (verb) {
              case 'GET':
                this.server.get(route, handler);
                break;
              case 'POST':
                this.server.post(route, handler);
                break;
              case 'UPDATE':
                this.server.update(route, handler);
                break;
              case 'DELETE':
                this.server.delete(route, handler);
                break;
              default:
                this.server.use(route, handler);
                break;
            }
          }
        }
      });
    });
  }

  private configureAuth(): void {
    if (!Options.auth.enabled) return;

    const unauthorizedErrorMessage = { status: 401, message: 'Unauthorized' };
    const rule = new RegExp(Options.auth.rule, 'gi');

    this.server.use(rule, (req, res, next) => {
      if (
        req.headers.authorization === undefined ||
        req.headers.authorization.split(' ')[0] !== 'Bearer'
      ) {
        res.status(401).json(unauthorizedErrorMessage);
        return;
      }

      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.decode(token);
      const method = Options.auth.method ?? 'verify';

      jwt.verify(token, Options.auth.secret, (error, decoded) => {
        if (!error || (method === 'decode' && decodedToken)) {
          req.token = token;
          next();
        }
        res.status(401).json(unauthorizedErrorMessage);
      });
    });
  }
}

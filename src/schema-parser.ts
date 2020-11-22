import { OpenAPI } from 'openapi-types';
import stringifyObject from 'stringify-object';
import { EndpointData } from './models/endpoint-data';

export class SchemaParser {
  static readonly DEFINITION_HANDLERS = {
    ['number']: SchemaParser.randomNumber,
    ['string']: SchemaParser.randomString,
    ['boolean']: SchemaParser.randomBoolean,
    ['array']: SchemaParser.arrayDefinition
  };

  public static createDefinitions(api: OpenAPI.Document, endpoints: EndpointData[]): void {
    endpoints?.forEach(endpoint => {
      endpoint.definition = this.createDefinition(api, endpoint);
    });
  }

  private static createDefinition(api: OpenAPI.Document, endpoint: EndpointData): string {
    const routes = endpoint.routes.filter(route => route.methods.find(method => method.verb === 'GET' && method.response !== undefined));

    routes.forEach(route => {
      route.methods = route.methods.filter(method => method.verb === 'GET' && method.response !== undefined);
    });

    const response = routes[0]?.methods[0]?.response;
    if (!response) return null;

    const definition = Object.assign({});
    const properties = Object.keys(response);

    properties.forEach(key => {
      const property = response[key];
      const type = property?.type;
      const createPropertyDefinition = SchemaParser.DEFINITION_HANDLERS[type] ?? SchemaParser.genericDefinition;
      definition[key] = createPropertyDefinition(property);
    });

    return stringifyObject(definition, { indent: '    ' });
  }

  private static genericDefinition(property: unknown, isArrayProperty?: boolean): unknown {
    return SchemaParser.randomString(property, isArrayProperty);
  }

  private static arrayDefinition(property: unknown, num?: number) {
    const items = property['items'];
    const type = items?.type;
    const handler = SchemaParser.DEFINITION_HANDLERS[type] ?? SchemaParser.genericDefinition;
    return [{
      ...handler(property, true),
      length: num ?? 10,      
    }];
  }

  private static randomNumber(property: unknown, isArrayProperty?: boolean): unknown {
    return {
      chance: 'integer({"min": 1, "max": 99999})'
    };
  }

  private static randomString(property: unknown, isArrayProperty?: boolean): unknown {
    return isArrayProperty ? {
      faker: 'lorem.words()'
    } : {
      eval: 'faker.lorem.words()'
    };
  }

  private static randomBoolean(property: unknown, isArrayProperty?: boolean): unknown {
    return {
      chance: 'bool()'
    };
  }
}
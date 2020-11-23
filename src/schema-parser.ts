import stringifyObject from 'stringify-object';
import { EndpointData } from './models/endpoint-data';

export class SchemaParser {
  static readonly DEFINITION_HANDLERS = {
    ['number']: SchemaParser.randomNumber,
    ['string']: SchemaParser.randomString,
    ['boolean']: SchemaParser.randomBoolean,
    ['array']: SchemaParser.arrayDefinition
  };

  public static createDefinitions(endpoints: EndpointData[], customDefinitions: any[]): void {
    this.setDefaultDefinitionIndeces(customDefinitions);
  
    endpoints?.forEach(async endpoint => {
      const customDefinition = this.parseCustomDefinition(endpoint, customDefinitions);

      if (customDefinition) {
        this.applyCustomDefinition(endpoint, customDefinition);
      } else {
        this.createDefinition(endpoint);
      }
    });
  }

  public static async parseCustomDefinitions(files: string[]): Promise<unknown[]>{
    return await Promise.all(files.map(file => import(file)));
  }

  private static setDefaultDefinitionIndeces(customDefinitions: any[]): void {
    customDefinitions.map(definitions => {
      Object.keys(definitions).forEach((key, index) => {
        const definition = definitions[key];
        definition.index = definition.index ?? index + 1;
      });
    });
  }

  private static createDefinition(endpoint: EndpointData): void {
    const routes = endpoint.routes.filter(route => route.methods.find(method => method.verb.toLowerCase() === 'get' && method.response !== undefined));

    console.log(endpoint);
    
    routes.forEach(route => {
      console.log(route);
      route.methods = route.methods.filter(method => method.verb.toLowerCase() === 'get' && method.response !== undefined);
    });

    const response = routes[0]?.methods[0]?.response;
    const definition = Object.assign({});
    const properties = response ? Object.keys(response) : [];

    if (!response || properties.length === 0) {
      endpoint.count = 0;
      return null;
    }

    properties.forEach(key => {
      const property = response[key];
      const type = property?.type;
      const createPropertyDefinition = SchemaParser.DEFINITION_HANDLERS[type] ?? SchemaParser.genericDefinition;
      definition[key] = createPropertyDefinition(property);
    });

    endpoint.definition = SchemaParser.stringifyDefinition(definition);
  }

  private static stringifyDefinition(definition: unknown): string {
    return stringifyObject(definition, { indent: '    ' });
  }

  private static applyCustomDefinition(endpoint: EndpointData, customDefinition: any): void {
    endpoint.index = customDefinition.index ?? endpoint.index;
    endpoint.count = customDefinition.count ?? endpoint.count;
    endpoint.definition = SchemaParser.stringifyDefinition(customDefinition.definition);
  }

  private static parseCustomDefinition(endpoint: EndpointData, customDefinitions: unknown[]): unknown {
    const filteredDefinitions = customDefinitions.find(definition => Object.keys(definition).includes(endpoint.name));
    return filteredDefinitions ? filteredDefinitions[endpoint.name] : undefined;
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

  private static randomNumber(): unknown {
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

  private static randomBoolean(): unknown {
    return {
      chance: 'bool()'
    };
  }
}
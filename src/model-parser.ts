import { OpenAPI } from 'openapi-types';
import './global/string.extensions';
import { ModelData, ModelProperty } from './models/model-data';
import { ProjectOptions } from './models/project-data';

export class ModelParser {
  public static parseModels(api: OpenAPI.Document, options?: ProjectOptions): ModelData[] {
    const definitions = api['definitions'];
    const components = api['components'];
    const schemas = components?.schemas ?? [];
    const models = [...this.extractModels(schemas), ...this.extractModels(definitions)];

    this.formatModels(models, options);

    return models;
  }

  private static extractModels(section: unknown): ModelData[] {
    const models = [];

    Object.keys(section ?? [])?.forEach(definition => {
      const name = definition;
      const object = section[name];
      const model = this.parseModel(name, object);
      models.push(model);
    });

    return models;
  }

  private static parseModel(name: string, object: unknown): ModelData {
    const model: ModelData = {
      name: name,
      properties: []
    };

    const properties = Object.keys(object['properties'] ?? []);

    properties?.forEach(propertyKey => {
      const property: ModelProperty = {
        name: propertyKey.toCamelCase(),
        type: this.mapType(object['properties'][propertyKey].type)
      };

      model.properties.push(property);
    });

    return model;
  }

  private static mapType(type: string): string {
    const map = {
      string: 'string',
      boolean: 'boolean',
      integer: 'number',
      array: 'any[]',
      object: 'any',
    };
  
    return map[type] ?? 'any';
  }

  private static formatModels(models: ModelData[], options?: ProjectOptions) {
    if (!options) return;

    models.forEach(model => {
      this.formatModelName(model, options);
    });
  }

  private static formatModelName(model: ModelData, options: ProjectOptions) {
    if (!options.model || !options.model['name']) return;
    const find = options.model['name'].find;
    const replace = options.model['name'].replace;
    model.name = model.name.replace(find, replace);
  }
}
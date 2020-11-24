import SwaggerParser from '@apidevtools/swagger-parser';
import fsx from 'fs-extra';
import minimist from 'minimist';
import { OpenAPI } from 'openapi-types';
import path from 'path';
import { CoreProject } from './core-project';
import { EndpointParser } from './endpoint-parser';
import { ModelParser } from './model-parser';
import { CoreProjectData } from './models/core-project-data';
import { SchemaParser } from './schema-parser';

const args = minimist(process.argv.slice(2));

const data: CoreProjectData = {
  name: args['apiName'] ?? 'charlatan-api',
  version: args.version ?? '1.0.0',
  outDir: args['outDir'] ?? 'out',
  swagger: args['swagger'] ?? 'https://petstore.swagger.io/v2/swagger.json',
  // swagger: './temp/swagger.json',
  // swagger: 'https://petstore.swagger.io/v2/swagger.json',
  // swagger: 'https://raw.githubusercontent.com/fannheyward/Bookstore/master/pb/book.swagger.json',
  // definitions: ['../temp/definitions.ts', '../temp/test.ts'],
  definitions: [],
  options: {
    model: {
      name: {
        find: 'DTO',
        replace: ''
      }
    },
  },
};

args?.definition?.forEach(file => {
  data.definitions.push(file);
});

if (args?.definitionDir) {
  const dir = args.definitionDir;

  const files = fsx.readdirSync(dir)
    .filter(file => path.extname(file).toLowerCase() === '.ts')
    .map(file => path.join(dir, file));

  data.definitions.push(...files);
}

SwaggerParser.dereference(data.swagger, async (error: Error, api: OpenAPI.Document) => {
  if (error) {
    console.log(error);
    return;
  }

  const options = data?.options ?? Object.assign({});
  const models = ModelParser.parseModels(api, options);
  const endpoints = EndpointParser.parseEndpoints(api, options);
  const customDefinitions = await SchemaParser.parseCustomDefinitions(data.definitions);

  SchemaParser.createSchemaDefinitions(endpoints, customDefinitions);

  CoreProject.initialize(data);
  CoreProject.createModels(data, models, options);
  CoreProject.createEndpoints(data, endpoints, options);
  CoreProject.createSchemas(data, endpoints);
});
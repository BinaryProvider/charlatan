#!/usr/bin/env node

import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPI } from 'openapi-types';
import { CLI } from './cli';
import { Data } from './data';
import { EndpointParser } from './endpoint-parser';
import { ModelParser } from './model-parser';
import { Project } from './project';
import { SchemaParser } from './schema-parser';


if (Data.args['help']) {
  CLI.help();
  process.exit();
}

CLI.splash();

const data = Data.initialize();

CLI.note('Parsing Swagger definition...');

SwaggerParser.dereference(data.swagger, async (error: Error, api: OpenAPI.Document) => {
  if (error) {
    CLI.error(error.message);
    return;
  }

  const options = data?.options ?? Object.assign({});
  const models = ModelParser.parseModels(api, options);
  const endpoints = EndpointParser.parseEndpoints(api, options);
  const customDefinitions = await SchemaParser.parseCustomDefinitions(data.definitions ?? []);

  SchemaParser.createSchemaDefinitions(endpoints, customDefinitions);

  Project.initialize(data);
  Project.createModels(data, models, options);
  Project.createEndpoints(data, endpoints, options);
  Project.createSchemas(data, endpoints);

  CLI.success('------------------------------', true);
  CLI.success('API generated successfully!', true);
  CLI.text(`^+Location: ^:${data.outDir}`, true);
  CLI.success('------------------------------', true, true);
});


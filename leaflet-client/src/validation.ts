import Ajv, { JSONSchemaType } from 'ajv';
import { Feature } from 'geojson';
import { State } from './state';

export const ajv = new Ajv();
ajv.addFormat('date-time', {
  validate: (dateTime: string) => dateTime !== null,
});
ajv.addFormat('date', {
  validate: (date: string) => date !== null,
});
/* ajv.addKeyword({
  keyword: 'mandatoryboundaryfeature',
  // TODO: do some actual validation here when we know what this keyword means
  validate: (schema: any) => schema !== null,
  schemaType: 'boolean',
  type: 'object',
}); */

export const findSchemaByTitle = (title: string): JSONSchemaType<any> | undefined => {
  return State.schema?.properties.features.items.anyOf.find((item: any) => item.title === title);
};

/**
 * Get {@link Ajv} validation function based on feature type.
 * Schema is cached for later use
 *
 * @param feature
 * @returns validate function or null if no schema is found for the feature
 */
export const getValidation = (feature: Feature) => {
  const { featuretype } = feature.properties!;

  const validate = ajv.getSchema(featuretype);

  if (validate) {
    return validate;
  }

  const relevantSchema = findSchemaByTitle(feature.properties!.featuretype);

  if (!relevantSchema) {
    return null;
  }

  ajv.addSchema(relevantSchema, featuretype);
  return ajv.getSchema(featuretype);
};

import { getFeatureSchema } from '../../validation';
import { JSONSchema4 } from 'json-schema';

export const handleOpenCreateFeatureModal = () => {
  const featureTypeInput = document.querySelector('[name="feature-type"]') as HTMLInputElement;
  featureTypeInput.onchange = () => renderPropertyInputs(featureTypeInput.value);
};

const renderPropertyInputs = (featureType: string) => {
  const inputs = document.querySelector('#choose-feature-properties') as HTMLDivElement;
  inputs.innerHTML = '';

  const { schema } = getFeatureSchema(featureType);

  const { properties, required } = schema?.properties.properties as JSONSchema4;

  Object.entries(properties!)
    .filter(([propertyName]) => !['identifikasjon', 'featuretype', 'oppdateringsdato'].includes(propertyName))
    .forEach(([propertyName, property]) => getPropertyInput(propertyName, property, required as string[]));

  return inputs;
};

const getPropertyInput = (propertyName: string, property: JSONSchema4, required: string[] | undefined) => {
  let debugInfo = '';

  if (property.type === 'object') {
    debugInfo += `type of ${propertyName} is object`;
    Object.entries(property.properties!).forEach(([nestedPropertyName, nestedProperty]) =>
      getPropertyInput(nestedPropertyName, nestedProperty, property.required as string[] | undefined),
    );
  } else if (property.type === 'array') {
    debugInfo += `type of ${propertyName} is array`;
  } else {
    debugInfo += `type of ${propertyName} is ${property.type}`;
    if (property.oneOf) {
      const possibleValues = (property.oneOf as { const: string; description: string; title: string }[])
        .map((possibleValue) => possibleValue.const)
        .reduce((possibleValues, value) => (possibleValues ? `${possibleValues}, ${value}` : value), '');
      debugInfo += `, can be one of: ${possibleValues}`;
    }
  }

  if (required && required.includes(propertyName)) {
    debugInfo += ', REQUIRED';
  }

  console.log(debugInfo);
};

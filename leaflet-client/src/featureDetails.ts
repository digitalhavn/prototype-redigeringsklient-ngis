import { Feature } from 'geojson';
import { schemas } from './main';
import Ajv from 'ajv';

export const findSchemaByTitle = (title: string) => {
  const schema = schemas.find((schema: any) =>
    schema.properties.features.items.anyOf.find((item: any) => item.title === title),
  );

  if (schema) {
    const matchingItem = schema.properties.features.items.anyOf.find((item: any) => item.title === title);
    return matchingItem || null; // Return the matching item or null if not found
  }

  return null;
};
const handleSaveButtonClick = (feature: Feature, form: HTMLFormElement) => {
  const relevantSchema = findSchemaByTitle(feature.properties!.featuretype);
  delete relevantSchema.properties.properties.properties.datafangstdato;
  delete relevantSchema.properties.properties.properties.oppdateringsdato;
  delete relevantSchema.properties.properties.properties.sertifiseringsdato;
  delete relevantSchema.mandatoryboundaryfeature;

  const featureProperties = feature.properties;
  for (const prop in featureProperties) {
    if (!(typeof form[prop] === 'undefined')) {
      const parsedValue = parseFloat(form[prop].value);
      if (!isNaN(parsedValue)) {
        featureProperties[prop] = parsedValue;
      } else {
        featureProperties[prop] = form[prop].value;
      }
    }
  }

  console.log(feature);
  const ajv = new Ajv();
  const validate = ajv.compile(relevantSchema);
  if (validate(feature)) {
    console.log('Data is valid');
  } else {
    console.log('Validation errors: ', validate.errors);
  }
  handleCancelButtonClick();
};

const handleCancelButtonClick = () => {
  const editablePage = document.getElementById('markerInfo');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
};

export const onMarkerClick = (e: { target: { feature: Feature } }) => {
  // Get the div where you want to display the form
  const markerInfoDiv = document.getElementById('markerInfo');
  const featureProperties = e.target.feature.properties;

  // Clear any existing content in the div
  markerInfoDiv!.innerHTML = '';

  // Create a form element
  const form = document.createElement('form');

  // Iterate through feature properties
  for (const prop in featureProperties) {
    if (
      ![
        'avgrensesAvKaiområdeGrense',
        'geometry_properties',
        'avgrensesAvLastbegrensningsområdeGrense',
        'kvalitet',
        'identifikasjon',
        'ISPSHavneanlegg',
        'avgrensesAvHavneanleggGrense',
      ].includes(prop)
    ) {
      // Create a label for the property
      const label = document.createElement('label');
      label.textContent = `${prop}:`;

      if (
        ['ISPS', 'energikilde', 'mobil', 'datafangstdato', 'oppdateringsdato', 'kaiId', 'objektLøpenummer'].includes(
          prop,
        ) ||
        Array.isArray(featureProperties[prop])
      ) {
        // Create a non-editable display field (e.g., a <span>)
        const displayField = document.createElement('span');
        displayField.textContent = featureProperties[prop];

        // Append label and display field to the form
        form.appendChild(label);
        form.appendChild(displayField);
      } else {
        // Create an input field for other properties
        const input = document.createElement('input');
        input.type = 'text';
        input.name = prop;
        input.value = featureProperties[prop];

        // Append label and input to the form
        form.appendChild(label);
        form.appendChild(input);
      }
    }
  }

  // Create "Save" button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.type = 'button';
  saveButton.id = 'save';

  // Create "Cancel" button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.type = 'button';
  cancelButton.id = 'cancel';

  // Add event listener to the "Save" button
  saveButton.addEventListener('click', () => {
    // Handle saving the edited data (pass the form as an argument)
    handleSaveButtonClick(e.target.feature, form);
  });

  // Add event listener to the "Cancel" button
  cancelButton.addEventListener('click', handleCancelButtonClick);

  // Append the form and buttons to the div
  markerInfoDiv!.appendChild(form);
  markerInfoDiv!.appendChild(saveButton);
  markerInfoDiv!.appendChild(cancelButton);

  // Display the div
  markerInfoDiv!.style.display = 'block';
};

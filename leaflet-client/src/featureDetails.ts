import { Feature } from 'geojson';
import { schemas } from './main';
import { updateFeatureProperties } from './ngisClient';
import Ajv from 'ajv';
import cloneDeep from 'lodash/cloneDeep';

const showUpdateMessage = () => {
  const updateMessage = document.getElementById('updateMessage');
  if (updateMessage) {
    updateMessage.style.display = 'block'; // Show the div

    // Add the 'show' class to trigger the animation
    updateMessage.classList.add('show');

    setTimeout(() => {
      // Remove the 'show' class to prevent animation when hiding
      updateMessage.classList.remove('show');
      updateMessage.style.display = 'none'; // Hide the div after 2 seconds
    }, 2000); // 2000 milliseconds (2 seconds)
  }
};

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
const handleSaveButtonClick = async (
  e: { target: { feature: Feature } },
  form: HTMLFormElement,
  responseField: HTMLDivElement,
) => {
  const feature = e.target.feature;
  const uuid = feature.properties!.datasetId;
  const featureCopy = cloneDeep(feature);
  delete feature.properties!.datasetId;

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

  const ajv = new Ajv();
  const validate = ajv.compile(relevantSchema);
  if (validate(feature)) {
    handleCancelButtonClick();
    console.log('Data is valid');
    await updateFeatureProperties(feature, uuid);
    feature.properties!.datasetId = uuid;
    showUpdateMessage();
  } else {
    (feature as Feature).properties!.datasetId = uuid;
    console.log('Validation errors: ', validate.errors);
    const errorMessages = validate
      .errors!.map((error) => {
        if (error.keyword === 'const') {
          return `${error.keyword} must be equal to ${error.params.allowedValue}`;
        } else {
          return `${error.message}`;
        }
      })
      .join(', ');
    responseField.style.color = 'red'; // Set text color to red
    responseField.textContent = `Validation errors: ${errorMessages}`;
    e.target.feature = featureCopy;
  }
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
  const relevantSchema = findSchemaByTitle(featureProperties!.featuretype);
  // Clear any existing content in the div
  markerInfoDiv!.innerHTML = '';

  // Create a form element
  const form = document.createElement('form');
  const responseField = document.createElement('div'); // Create a response field

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
        'datasetId',
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
        if (relevantSchema && relevantSchema.properties.properties.properties[prop].oneOf) {
          // Create a dropdown list (select element) for the property
          const select = document.createElement('select');
          select.name = prop;

          // Add an option for each allowed value
          for (const allowedValue of relevantSchema.properties.properties.properties[prop].oneOf) {
            const option = document.createElement('option');
            option.value = allowedValue.const;
            option.textContent = allowedValue.const;
            select.appendChild(option);
          }

          // Set the selected value based on the feature's current value
          select.value = featureProperties[prop].toString();

          // Append the label and select element to the form
          form.appendChild(label);
          form.appendChild(select);
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
    handleSaveButtonClick(e, form, responseField);
  });

  // Add event listener to the "Cancel" button
  cancelButton.addEventListener('click', handleCancelButtonClick);

  // Append the form and buttons to the div
  markerInfoDiv!.appendChild(form);
  markerInfoDiv!.appendChild(saveButton);
  markerInfoDiv!.appendChild(cancelButton);
  markerInfoDiv!.appendChild(responseField); // Append the response field

  // Display the div
  markerInfoDiv!.style.display = 'block';
};

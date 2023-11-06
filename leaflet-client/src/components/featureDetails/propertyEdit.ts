import { deleteLayer, updateLayer } from '../../main';
import { getAndLockFeature, putFeature, updateFeatureProperties } from '../../ngisClient';
import cloneDeep from 'lodash/cloneDeep';
import { renderGeometry } from './geometryEdit';
import { handleCancelButtonClick } from '.';
import { NGISFeature } from '../../types/feature';
import { IGNORED_PROPS, READ_ONLY_PROPS } from '../../config';
import { findSchemaByTitle, getFeatureSchema } from '../../validation';
import { makeRequest } from '../../util';

const handleSaveButtonClick = async (feature: NGISFeature, form: HTMLFormElement, responseField: HTMLDivElement) => {
  const featureCopy = cloneDeep(feature);

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

  const { validate } = getFeatureSchema(feature.properties!.featuretype);
  validate && console.log(validate.schema);
  if (!validate || validate(feature)) {
    await makeRequest(async () => {
      await updateFeatureProperties(feature.properties);
      updateLayer(feature);
    });
  } else {
    console.log('Validation errors: ', validate.errors);
    const errorMessages = validate
      .errors!.map((error) => {
        console.log(error);
        if (error.keyword === 'const') {
          return `${error.instancePath.split('/')[2]} must be equal to ${error.params.allowedValue}`;
        } else {
          return `${error.instancePath.split('/')[2]} ${error.message}`;
        }
      })
      .join(', ');
    responseField.style.color = 'red'; // Set text color to red
    responseField.textContent = `Validation errors: ${errorMessages}`;
    feature.properties = featureCopy.properties;
  }
};

const handleDeleteButtonClick = async (feature: NGISFeature) => {
  await makeRequest(async () => {
    await getAndLockFeature(feature.properties!.identifikasjon.lokalId);
    await putFeature(feature, feature.geometry.coordinates, 'Erase');

    deleteLayer(feature);
    handleCancelButtonClick();
  });
};

export const renderProperties = (feature: NGISFeature, contentDiv: HTMLDivElement) => {
  // Clear any existing content in the div
  contentDiv.innerHTML = '';

  const propsHeader = document.createElement('h3');
  propsHeader.textContent = `${feature.properties!.featuretype}`;
  contentDiv.append(propsHeader);

  // Create a form element
  const form = document.createElement('form');
  const responseField = document.createElement('div'); // Create a response field

  const featureProperties = feature.properties;
  const relevantSchema = findSchemaByTitle(featureProperties!.featuretype);

  // Iterate through feature properties
  for (const prop in featureProperties) {
    if (!IGNORED_PROPS.includes(prop)) {
      // Create a label for the property
      const label = document.createElement('label');
      label.textContent = `${prop}:`;
      if (
        READ_ONLY_PROPS.includes(prop) ||
        Array.isArray(featureProperties[prop]) ||
        (relevantSchema && relevantSchema.properties.properties.properties[prop].readOnly)
      ) {
        // Create a non-editable display field (e.g., a <span>)
        const displayField = document.createElement('span');
        displayField.textContent =
          prop === 'identifikasjon' ? featureProperties[prop].lokalId : featureProperties[prop];

        // Append label and display field to the form
        form.append(label, displayField);
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
          form.append(label, select);
        } else {
          // Create an input field for other properties
          const input = document.createElement('input');
          input.type = 'text';
          input.name = prop;
          input.value = featureProperties[prop];

          // Append label and input to the form
          form.append(label, input);
        }
      }
    }
  }

  contentDiv.append(form);

  if (feature.geometry.type !== 'Polygon') {
    const editGeometriesBtn = document.createElement('button');
    editGeometriesBtn.type = 'button';
    editGeometriesBtn.id = 'renderGeometryButton';
    editGeometriesBtn.textContent = 'Edit geometry';
    editGeometriesBtn.className = 'link';

    editGeometriesBtn.addEventListener('click', () => renderGeometry(feature, contentDiv));

    contentDiv.append(editGeometriesBtn);
  }

  // Create "Save" button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.type = 'button';
  saveButton.id = 'save';
  saveButton.className = 'default-button';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.type = 'button';
  deleteButton.id = 'delete';
  deleteButton.className = 'default-button';
  deleteButton.style.background = 'red';

  // Add event listener to the "Save" button
  saveButton.addEventListener('click', () => {
    // Handle saving the edited data (pass the form as an argument)
    handleSaveButtonClick(feature, form, responseField);
  });

  deleteButton.addEventListener('click', () => handleDeleteButtonClick(feature));

  contentDiv.append(saveButton, deleteButton, responseField);
};

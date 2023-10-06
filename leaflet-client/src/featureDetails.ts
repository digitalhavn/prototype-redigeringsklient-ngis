import { Feature } from 'geojson';

const handleSaveButtonClick = () => {
  console.log('Saved');
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

  // Create and populate form elements based on feature properties
  for (const prop in featureProperties) {
    // Create a label for the property
    if (prop !== 'identifikasjon' && prop !== 'kvalitet') {
      const label = document.createElement('label');
      label.textContent = `${prop}:`;
      label.style.color = 'black';
      label.style.fontSize = '16px';

      // Create an input field for the property
      const input = document.createElement('input');
      input.type = 'text';
      input.name = prop;
      input.value = featureProperties[prop];

      // Create a line break for spacing
      const br = document.createElement('br');

      // Append the label, input, and line break to the div
      markerInfoDiv!.appendChild(label);
      markerInfoDiv!.appendChild(input);
      markerInfoDiv!.appendChild(br);
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

  // Add event listeners to the buttons (you can define the event handlers)
  saveButton.addEventListener('click', handleSaveButtonClick);
  cancelButton.addEventListener('click', handleCancelButtonClick);

  // Append the buttons to the div
  markerInfoDiv!.appendChild(saveButton);
  markerInfoDiv!.appendChild(cancelButton);

  // Display the div
  markerInfoDiv!.style.display = 'block';
};

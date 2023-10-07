import { Feature, GeoJsonProperties, Geometry, Position } from 'geojson';

export const onMarkerClick = (e: { target: { feature: Feature } }) => {
  const { properties, geometry } = e.target.feature;
  // Get the div where you want to display the form
  const markerInfoDiv = document.getElementById('markerInfo')! as HTMLDivElement;
  // Clear any existing content in the div
  markerInfoDiv.innerHTML = '';

  renderProperties(properties, markerInfoDiv);
  ['Point', 'LineString'].includes(geometry.type) && renderGeometry(geometry, markerInfoDiv);

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
  markerInfoDiv.appendChild(saveButton);
  markerInfoDiv.appendChild(cancelButton);

  // Display the div
  markerInfoDiv.style.display = 'block';
};

const handleSaveButtonClick = () => {
  console.log('Saved');
};

const handleCancelButtonClick = () => {
  const editablePage = document.getElementById('markerInfo');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
};

// Only renders coordinates of points and linestrings
const renderGeometry = (geometry: Geometry, markerInfoDiv: HTMLDivElement) => {
  const coordsHeader = document.createElement('h3');
  coordsHeader.textContent = 'Koordinater';
  markerInfoDiv.append(coordsHeader);

  const table = document.createElement('table');
  const tableHeader = document.createElement('tr');

  const latHeader = document.createElement('td');
  latHeader.textContent = 'Breddegrad';
  const longHeader = document.createElement('td');
  longHeader.textContent = 'Lengdegrad';
  const altHeader = document.createElement('td');
  altHeader.textContent = 'Høyde';

  tableHeader.append(latHeader, longHeader, altHeader);
  table.append(tableHeader);
  markerInfoDiv.append(table);

  const addPosition = ([long, lat, alt]: Position) => {
    const tableRow = document.createElement('tr');

    const latData = document.createElement('td');
    latData.contentEditable = 'true';
    latData.textContent = lat.toString();
    const longData = document.createElement('td');
    longData.contentEditable = 'true';
    longData.textContent = long.toString();
    const altData = document.createElement('td');
    altData.contentEditable = 'true';
    altData.textContent = alt.toString();

    tableRow.append(latData, longData, altData);
    table.append(tableRow);
  };

  switch (geometry.type) {
    case 'Point':
      addPosition(geometry.coordinates);
      break;
    case 'LineString':
      geometry.coordinates.forEach(addPosition);

      const addPositionBtn = document.createElement('button');
      addPositionBtn.textContent = '+ Legg til posisjon';
      addPositionBtn.type = 'button';
      addPositionBtn.id = 'addPositionBtn';
      addPositionBtn.addEventListener('click', () => addPosition([0, 0, 0]));
      markerInfoDiv.append(addPositionBtn);
      markerInfoDiv.append(document.createElement('hr'));
  }
};

const renderProperties = (properties: GeoJsonProperties, markerInfoDiv: HTMLDivElement) => {
  const propsHeader = document.createElement('h3');
  propsHeader.textContent = 'Attributter';
  markerInfoDiv.append(propsHeader);

  for (const prop in properties) {
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
      input.value = properties[prop];

      // Create a line break for spacing
      const br = document.createElement('br');

      // Append the label, input, and line break to the div
      markerInfoDiv.appendChild(label);
      markerInfoDiv.appendChild(input);
      markerInfoDiv.appendChild(br);
      markerInfoDiv.appendChild(br);
    }
  }
};

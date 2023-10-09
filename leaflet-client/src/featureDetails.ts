import { Feature, GeoJsonProperties, Geometry, LineString, Point, Polygon, Position } from 'geojson';
import { getAndLockFeature, updateFeature } from './ngisClient';
import { deleteLayer, updateLayer } from './main';

export const onMarkerClick = (e: { target: { feature: Feature<Point | LineString | Polygon, GeoJsonProperties> } }) => {
  const { feature } = e.target;
  const { properties, geometry } = feature;
  // Get the div where you want to display the form
  const markerInfoDiv = document.getElementById('markerInfo')! as HTMLDivElement;
  // Clear any existing content in the div
  markerInfoDiv.innerHTML = '';

  renderProperties(properties, markerInfoDiv);

  if (geometry.type !== 'Polygon') {
    const geometryDiv = renderGeometry(geometry);

    const editGeometriesBtn = document.createElement('input');
    editGeometriesBtn.type = 'checkbox';
    editGeometriesBtn.id = 'isEditGeometryActive';
    editGeometriesBtn.checked = false;

    const editGeometriesLabel = document.createElement('label');
    editGeometriesLabel.textContent = 'Rediger koordinater';
    editGeometriesLabel.htmlFor = 'isEditGeometryActive';

    editGeometriesBtn.addEventListener('change', () => {
      geometryDiv.style.display = editGeometriesBtn.checked ? 'block' : 'none';
    });

    markerInfoDiv.append(editGeometriesBtn, editGeometriesLabel, document.createElement('br'), geometryDiv);
  }

  // Create "Save" button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Lagre';
  saveButton.type = 'submit';
  saveButton.id = 'save';

  // Create "Cancel" button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Avbryt';
  cancelButton.type = 'button';
  cancelButton.id = 'cancel';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Slett objekt';
  deleteButton.type = 'button';
  deleteButton.id = 'delete';
  deleteButton.style.color = 'red';

  // Add event listeners to the buttons (you can define the event handlers)
  saveButton.addEventListener('click', (e) => handleSaveButtonClick(e, feature));
  cancelButton.addEventListener('click', handleCancelButtonClick);
  deleteButton.addEventListener('click', () => handleDeleteButtonClick(feature));

  // Append the buttons to the div
  markerInfoDiv.append(document.createElement('hr'), saveButton, cancelButton, deleteButton);

  // Display the div
  markerInfoDiv.style.display = 'block';
};

const handleSaveButtonClick = async (
  e: MouseEvent,
  feature: Feature<Point | LineString | Polygon, GeoJsonProperties>,
) => {
  e.preventDefault();

  const geometryEditBtn = document.querySelector('#isEditGeometryActive') as HTMLInputElement;

  if (geometryEditBtn.checked) {
    const geometry: Position[] = [];
    const table = document.querySelector('#geometryTable')! as HTMLTableElement;

    for (let i = 1, row; (row = table.rows[i]); i++) {
      geometry[i - 1] = [];
      for (let j = 0, col; (col = row.cells[j]); j++) {
        geometry[i - 1][j] = !col.textContent ? 0 : +col.textContent;
      }
    }

    let editedGeometry: Position | Position[];

    feature.geometry.type === 'Point' ? (editedGeometry = geometry[0]) : (editedGeometry = geometry);

    const featureCollection = await getAndLockFeature(
      feature.properties!.datasetId,
      feature.properties!.identifikasjon.lokalId,
    );
    console.log(featureCollection);

    feature.geometry.coordinates = editedGeometry;
    const saveResponse = await updateFeature(feature, 'Replace');
    console.log(saveResponse);

    if (saveResponse.features_replaced > 0) {
      updateLayer(feature);
      console.info('Feature updated');
    }
  } else {
    console.log('Edit attributes only');
  }
};

const handleCancelButtonClick = () => {
  const editablePage = document.getElementById('markerInfo');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
};

const handleDeleteButtonClick = async (feature: Feature) => {
  const markerInfoDiv = document.querySelector('#markerInfo')! as HTMLDivElement;

  const featureCollection = await getAndLockFeature(
    feature.properties!.datasetId,
    feature.properties!.identifikasjon.lokalId,
  );
  console.log(featureCollection);

  const saveResponse = await updateFeature(feature, 'Erase');
  console.log(saveResponse);

  if (saveResponse.features_erased > 0) {
    deleteLayer(feature);
    markerInfoDiv.style.display = 'none';
    console.info('Feature was deleted');
  } else {
    console.error('Feature was not deleted');
  }
};

// Only renders coordinates of points and linestrings
const renderGeometry = (geometry: Geometry) => {
  const geometryDiv = document.createElement('div');
  geometryDiv.style.display = 'none';
  const coordsHeader = document.createElement('h3');
  coordsHeader.textContent = 'Koordinater';
  geometryDiv.append(coordsHeader);

  const table = document.createElement('table');
  table.id = 'geometryTable';
  const tableHeader = document.createElement('tr');

  const longHeader = document.createElement('th');
  longHeader.textContent = 'Lengdegrad';
  const latHeader = document.createElement('th');
  latHeader.textContent = 'Breddegrad';
  const altHeader = document.createElement('th');
  altHeader.textContent = 'Høyde';

  tableHeader.append(longHeader, latHeader, altHeader);
  table.append(tableHeader);
  geometryDiv.append(table);

  const addPosition = ([long, lat, alt]: Position) => {
    const tableRow = document.createElement('tr');

    const longData = document.createElement('td');
    longData.contentEditable = 'true';
    longData.textContent = long.toFixed(6).toString();
    const latData = document.createElement('td');
    latData.contentEditable = 'true';
    latData.textContent = lat.toFixed(6).toString();
    const altData = document.createElement('td');
    altData.contentEditable = 'true';
    altData.textContent = alt.toFixed(6).toString();

    tableRow.append(longData, latData, altData);
    table.append(tableRow);
  };

  const removePosition = (index: number) => {
    table.deleteRow(index);
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

      const removePositionBtn = document.createElement('button');
      removePositionBtn.textContent = '- Fjern posisjon';
      removePositionBtn.type = 'button';
      removePositionBtn.id = 'removePositionBtn';
      removePositionBtn.addEventListener('click', () => removePosition(table.rows.length - 1));

      geometryDiv.append(addPositionBtn, removePositionBtn);
  }

  return geometryDiv;
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

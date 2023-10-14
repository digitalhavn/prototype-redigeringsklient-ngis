import { Position } from 'geojson';
import { getAndLockFeature, updateFeature } from '../../ngisClient';
import { updateLayer } from '../../main';
import { renderProperties } from './propertyEdit';
import { NGISFeature } from '../../types/feature';
import { setLoading } from '../../util';
import { showUpdateMessage } from '../alerts/update';

export const handleGeometryEdit = async (e: Event, feature: NGISFeature) => {
  setLoading(true);
  e.preventDefault();

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

  await getAndLockFeature(feature.properties!.datasetId, feature.properties!.identifikasjon.lokalId);

  const saveResponse = await updateFeature(feature, editedGeometry, 'Replace');
  feature.geometry.coordinates = editedGeometry;

  if (saveResponse.features_replaced > 0) {
    updateLayer(feature);
    showUpdateMessage();
  }
  setLoading(false);
};

export const renderGeometry = (feature: NGISFeature, contentDiv: HTMLDivElement) => {
  const { geometry } = feature;
  contentDiv.innerHTML = '';

  const coordsHeader = document.createElement('h3');
  coordsHeader.textContent = 'Koordinater';
  contentDiv.append(coordsHeader);

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
  contentDiv.append(table);

  switch (geometry.type) {
    case 'Point':
      addPosition(geometry.coordinates, table);
      break;
    case 'LineString':
      geometry.coordinates.forEach((coordinate) => addPosition(coordinate, table));

      const addPositionBtn = document.createElement('button');
      addPositionBtn.textContent = '+ Legg til posisjon';
      addPositionBtn.type = 'button';
      addPositionBtn.id = 'addPositionBtn';
      addPositionBtn.addEventListener('click', () => addPosition([0, 0, 0], table));

      const removePositionBtn = document.createElement('button');
      removePositionBtn.textContent = '- Fjern posisjon';
      removePositionBtn.type = 'button';
      removePositionBtn.id = 'removePositionBtn';
      removePositionBtn.addEventListener('click', () => removePosition(table.rows.length - 1, table));

      contentDiv.append(addPositionBtn, removePositionBtn);
  }

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.id = 'editGeoBtn';
  editBtn.textContent = 'Save';
  editBtn.addEventListener('click', (e) => handleGeometryEdit(e, feature));

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.id = 'backToProps';
  backBtn.textContent = 'Back';
  backBtn.addEventListener('click', () => renderProperties(feature, contentDiv));

  contentDiv.append(editBtn, backBtn);
};

const addPosition = ([long, lat, alt]: Position, table: HTMLTableElement) => {
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

const removePosition = (index: number, table: HTMLTableElement) => {
  table.deleteRow(index);
};

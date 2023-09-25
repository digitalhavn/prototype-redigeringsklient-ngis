import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS } from './config.js';
import L from 'leaflet';
import { GeoJsonObject } from 'geojson';
import { getDatasets, getFeatureCollections } from './ngis-client.js';

const displayFeatureCollection = (featureCollection: GeoJsonObject[]) => {
  L.geoJSON(featureCollection, {
    coordsToLatLng: (coords) => {
      return L.latLng(coords);
    },
    onEachFeature(feature, layer) {
      layer.bindPopup(feature.properties.featuretype);
    },
  }).addTo(map);
};

const map = L.map('map').setView(START_LOCATION, 15); // Creating the map object

// Adding base maps
const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', MAP_OPTIONS).addTo(map);
const standardMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
const wmsLayer = L.tileLayer.wms('https://openwms.statkart.no/skwms1/wms.havnedata');

// Creating marker layers with options
const OsloHavn = L.marker([59.902205, 10.740768300000013], { title: 'Oslo' }).bindPopup('Oslo havn');
const BergenHavn = L.marker([60.39207, 5.31195], { title: 'Bergen' }).bindPopup('Bergen havn');
// Adding marker layers to a feature group
L.layerGroup([OsloHavn, BergenHavn]).addTo(map);
const baseMaps = {
  'OpenStreetMap.HOT': osmHOT,
  Standard: standardMap,
  WMS: wmsLayer,
};
L.control.layers(baseMaps).addTo(map);

const datasets = await getDatasets();
const featureCollections = await getFeatureCollections(datasets);
featureCollections.forEach(displayFeatureCollection);

// Save button click event handler
document.getElementById('saveButton')?.addEventListener('click', () => {
  // Assuming 'marker' is declared and initialized somewhere in your code

  // Update the marker's information with edited values
  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const descriptionInput = document.getElementById('description') as HTMLInputElement | null;

  if (nameInput && descriptionInput) {
    //@ts-ignore
    marker.name = nameInput.value;
    //@ts-ignore
    marker.description = descriptionInput.value;
  }

  // Hide the editable page and return to view mode
  const editablePage = document.getElementById('editablePage');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
});

// Cancel button click event handler
document.getElementById('cancelButton')?.addEventListener('click', () => {
  // Hide the editable page and discard any edits
  const editablePage = document.getElementById('editablePage');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
});

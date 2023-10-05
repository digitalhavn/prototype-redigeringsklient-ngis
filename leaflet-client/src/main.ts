import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS } from './config.js';
import L from 'leaflet';
import { FeatureCollection } from 'geojson';
import { getDatasets, getFeatureCollections } from './ngisClient.js';

const displayFeatureCollection = (featureCollection: FeatureCollection) => {
  L.geoJSON(featureCollection, {
    coordsToLatLng: (coords) => {
      return L.latLng(coords);
    },
    onEachFeature(feature, layer) {
      layer.bindPopup(feature.properties.featuretype);
    },
  }).addTo(map);
};

const handleCancelButtonClick = () => {
  const editablePage = document.getElementById('markerInfo');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
};

const onMarkerClick = (e: { target: { feature: Feature } }) => {
  // Get the div where you want to display the form
  const markerInfoDiv = document.getElementById('markerInfo');
  const featureProperties = e.target.feature.properties;
  // Clear any existing content in the div
  markerInfoDiv!.innerHTML = '';

  // Create and populate form elements based on feature properties
  for (const prop in featureProperties) {
    // Create a label for the property
    if (prop === 'identifikasjon' || prop === 'kvalitet') {
    } else {
      const label = document.createElement('label');
      label.textContent = `${prop}:`;
      label.style.color = 'black'; // Change 'black' to your desired text color
      label.style.fontSize = '16px'; // Change '16px' to your desired font size

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

const GEO_JSON_STYLE_OPTIONS: Record<string, PathOptions> = {
  LineString: {
    color: 'red',
    weight: 3,
  },
  Polygon: {
    fillColor: 'blue',
    color: 'black',
    weight: 2,
  },
};

const addToOrCreateLayer = (feature: Feature) => {
  const objectType: string = feature.properties!.featuretype;
  if (!layers[objectType]) {
    layers[objectType] = L.geoJson(undefined, {
      style: () => {
        return GEO_JSON_STYLE_OPTIONS[feature.geometry.type];
      },
      onEachFeature: (_, layer) => {
        layer.on('click', onMarkerClick);
      },
      coordsToLatLng: (coords) => {
        return L.latLng(coords);
      },
    });
  }
  layers[objectType].addData(feature);
};

const layers: Record<string, L.GeoJSON> = {};

const map = L.map('map').setView(START_LOCATION, 15); // Creating the map object

// Adding base maps
const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', MAP_OPTIONS).addTo(map);
const standardMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
const wmsLayer = L.tileLayer.wms('https://openwms.statkart.no/skwms1/wms.havnedata');

const baseMaps = {
  'OpenStreetMap.HOT': osmHOT,
  Standard: standardMap,
  WMS: wmsLayer,
};

const datasets = await getDatasets();
const featureCollections = await getFeatureCollections(datasets);
featureCollections.forEach((featureCollection: FeatureCollection) => {
  featureCollection.features.forEach(addToOrCreateLayer);
});
L.control.layers(baseMaps, layers).addTo(map);

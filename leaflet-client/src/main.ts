import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, WMS_PROXY_URL } from './config.js';
import L from 'leaflet';
import { Feature } from 'geojson';
import { getDatasets, getFeatureCollections, getSchema } from './ngis-client.js';
import Ajv, { ErrorObject } from 'ajv';

interface Layers {
  [key: string]: any; // This specifies that the object can have any string key with any value type.
}
const findSchemaByTitle = (title: string) => {
  const schema = schemas.find((schema) =>
    schema.properties.features.items.anyOf.find((item: any) => item.title === title),
  );

  if (schema) {
    const matchingItem = schema.properties.features.items.anyOf.find((item: any) => item.title === title);
    return matchingItem || null; // Return the matching item or null if not found
  }

  return null;
};
const handleSaveButtonClick = (feature: { properties: any }) => {
  const relevantSchema = findSchemaByTitle(feature.properties.featuretype);
  console.log(relevantSchema);
};
const handleCancelButtonClick = () => {
  const editablePage = document.getElementById('markerInfo');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
};

const onMarkerClick = (e: { target: { feature: { properties: any } } }) => {
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
  saveButton.addEventListener('click', () => handleSaveButtonClick(e.target.feature));
  cancelButton.addEventListener('click', handleCancelButtonClick);

  // Append the buttons to the div
  markerInfoDiv!.appendChild(saveButton);
  markerInfoDiv!.appendChild(cancelButton);

  // Display the div
  markerInfoDiv!.style.display = 'block';
};
const getOrCreateLayer = (feature: Feature) => {
  const objectType: string = feature.properties!.featuretype;
  if (!layers[objectType]) {
    if (feature.geometry.type === 'Point') {
      layers[objectType] = L.geoJson(undefined, {
        pointToLayer: function (feature) {
          // Create a marker for each point feature
          return L.marker([feature.geometry.coordinates[0], feature.geometry.coordinates[1]]).on(
            'click',
            onMarkerClick,
          );
        },
        coordsToLatLng: (coords) => {
          return L.latLng(coords);
        },
      }); // .addTo(map);
    }
    if (feature.geometry.type === 'Polygon') {
      layers[objectType] = L.geoJson(undefined, {
        style: function () {
          // Define styles for polygons
          return { fillColor: 'blue', color: 'black', weight: 2 };
        },
        onEachFeature: function (_feature, layer) {
          // Add click event handling for polygons
          layer.on('click', onMarkerClick);
        },
        coordsToLatLng: (coords) => {
          return L.latLng(coords);
        },
      });
    }
    if (feature.geometry.type === 'LineString') {
      layers[objectType] = L.geoJson(undefined, {
        style: function () {
          // Define styles for polygons
          return { color: 'red', weight: 3 };
        },
        onEachFeature: function (_feature, layer) {
          // Add click event handling for polygons
          layer.on('click', onMarkerClick);
        },
        coordsToLatLng: (coords) => {
          return L.latLng(coords);
        },
      });
    }
  }
  return layers[objectType];
};
const layers: Layers = {};

const map = L.map('map').setView(START_LOCATION, 15); // Creating the map object

// Adding base maps
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', MAP_OPTIONS).addTo(map);

const wmsLayer = L.tileLayer.wms(`${WMS_PROXY_URL}`, {
  //@ts-ignore
  service: 'WMS',
  version: '1.3.0',
  request: 'GetMap',
  format: 'image/png',
  layers: 'havnedata',
  CRS: 'EPSG:4326',
  bbox: '57.021168,0.228508,71.516049,37.230461',
  width: 400,
  height: 300,
  updateWhenIdle: true,
  transparent: true,
});

const datasets = await getDatasets();
const schemas = await getSchema(datasets);
console.log(schemas);
const featureCollection = await getFeatureCollections(datasets);
featureCollection.forEach((feature: Feature) => {
  const layer = getOrCreateLayer(feature);
  layer.addData(feature);
});
const loading = document.getElementById('loading-container')!;
loading.style.display = 'none';
L.control.layers(undefined, layers).addTo(map);
wmsLayer.addTo(map);

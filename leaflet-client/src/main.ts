import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, NGIS_PROXY_URL } from './config.js';
import L from 'leaflet';

//FUNCTIONS
const getDatasets = async () => {
  console.log('Loading datasets...');
  const response = await fetch(`${NGIS_PROXY_URL}/datasets`);
  const dataSets = await response.json();
  console.log(dataSets);
  const finalResponse = await getObjectData(dataSets);
  console.log(finalResponse);
  finalResponse.forEach(createLayer);
};

const getObjectData = async (dataSets: any[]) => {
  console.log('Loading features...');
  const promises = dataSets.map(async (item: { id: string }) => {
    const response = await fetch(
      `${NGIS_PROXY_URL}/datasets/${item.id}/features?crs_EPSG=4258&limit=100&references=all`,
    );
    return response.json();
  });

  return await Promise.all(promises);
};

interface FeatureCollection {
  features: any[];
}

const createLayer = (feature_collection: FeatureCollection) => {
  console.log(feature_collection);
  const newLayer: L.Layer[] | undefined = [];
  feature_collection.features.forEach((item) => {
    console.log(item);
    if (!item.geometry?.coordinates) {
      console.log('No coordinates');
      console.log(item);
    } else {
      const newMarker = L.marker([item.geometry.coordinates[0], item.geometry.coordinates[1]], {
        title: item.properties.featuretype,
      }).bindPopup(item['name']);
      newMarker.on('click', () => {
        console.log('Klikket på marker');

        // Populate the editable page with marker's information
        const nameInput = document.getElementById('name') as HTMLInputElement | null;
        if (nameInput) {
          //@ts-ignore
          nameInput.value = newMarker.title;
        }

        // Switch to edit mode
        const editablePage = document.getElementById('editablePage');
        if (editablePage) {
          editablePage.style.display = 'block';
        }
      });
      newLayer.push(newMarker);
    }
  });
  layerControl.addOverlay(L.layerGroup(newLayer), (Math.random() + 1).toString(36).substring(7));
};

getDatasets();

const map = L.map('map').setView(START_LOCATION, 15); // Creating the map object

// Adding base maps
const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', MAP_OPTIONS).addTo(map);
const standardMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

// Creating marker layers with options
const OsloHavn = L.marker([59.902205, 10.740768300000013], {
  title: 'Oslo',
}).bindPopup('Oslo havn');
const BergenHavn = L.marker([60.39207, 5.31195], { title: 'Bergen' }).bindPopup('Bergen havn');
// Adding marker layers to a feature group
const cities = L.layerGroup([OsloHavn, BergenHavn]).addTo(map);
const baseMaps = {
  'OpenStreetMap.HOT': osmHOT,
  Standard: standardMap,
};
const overlayMaps = {
  Cities: cities,
};
const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

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

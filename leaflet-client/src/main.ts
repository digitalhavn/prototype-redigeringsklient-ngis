import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS, WMS_PROXY_URL } from './config.js';
import L from 'leaflet';
import { Feature } from 'geojson';
import { getDatasets, getFeaturesForDatasets, getSchema } from './ngisClient';
import { onMarkerClick } from './featureDetails.js';

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
export const schemas = await getSchema(datasets);
const featuresForDatasets = await getFeaturesForDatasets(datasets);
console.log(featuresForDatasets);
featuresForDatasets.forEach((datasetFeatures) => {
  datasetFeatures.featureCollection.features.forEach((feature: Feature) => {
    feature.properties!.datasetId = datasetFeatures.datasetId;
    addToOrCreateLayer(feature);
  });
});
const loading = document.getElementById('loading-container')!;
loading.style.display = 'none';
wmsLayer.addTo(map);
L.control.layers(undefined, layers).addTo(map);

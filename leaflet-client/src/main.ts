import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS } from './config.js';
import L from 'leaflet';
import { Feature } from 'geojson';
import { getDatasets, getFeaturesForDatasets } from './ngisClient';
import { onMarkerClick } from './featureDetails.js';

const addToOrCreateLayer = (feature: Feature) => {
  const objectType: string = feature.properties!.featuretype;
  if (layers[objectType] === undefined) {
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
const featuresForDatasets = await getFeaturesForDatasets(datasets);
featuresForDatasets.forEach((datasetFeatures) => {
  datasetFeatures.featureCollection.features.forEach((feature: Feature) => {
    (feature as Record<any, any>).datasetId = datasetFeatures.datasetId;
    addToOrCreateLayer(feature);
  });
});
L.control.layers(baseMaps, layers).addTo(map);

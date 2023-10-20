import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS } from './config.js';
import L, { Layer } from 'leaflet';
import { Feature } from 'geojson';
import { getDatasets, getFeaturesForDatasets } from './ngisClient';
import { onMarkerClick } from './featureDetails.js';

export const addToOrCreateLayer = (feature: Feature) => {
  const objectType: string = feature.properties!.featuretype;
  if (layers[objectType] === undefined) {
    layers[objectType] = L.geoJson(undefined, {
      style: () => {
        return GEO_JSON_STYLE_OPTIONS[feature.geometry.type];
      },
      onEachFeature: (feature, layer) => {
        featuresMap[feature.properties.identifikasjon.lokalId] = layer;
        layer.on('click', onMarkerClick);
      },
      coordsToLatLng: (coords) => {
        return L.latLng(coords);
      },
    });
  }
  layers[objectType].addData(feature);
};

export const updateLayer = (updatedFeature: Feature) => {
  deleteLayer(updatedFeature);
  addToOrCreateLayer(updatedFeature);
};

export const deleteLayer = (deletedFeature: Feature) => {
  const deletedLayer = featuresMap[deletedFeature.properties!.identifikasjon.lokalId];
  layers[deletedFeature.properties!.featuretype].removeLayer(deletedLayer);
};

const layers: Record<string, L.GeoJSON> = {};

// Maps feature local ID to leaflet layer in order to
// update and delete already created layers
const featuresMap: Record<string, Layer> = {};

const map = L.map('map').setView(START_LOCATION, 15); // Creating the map object

// Adding base maps
const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  ...MAP_OPTIONS,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
});

const statKart = L.tileLayer(
  `https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norgeskart_bakgrunn&zoom={z}&x={x}&y={y}`,
  {
    ...MAP_OPTIONS,
    detectRetina: true,
    attribution: '<a href="https://www.kartverket.no/">Kartverket</a>',
    subdomains: ['', '2', '3'],
  },
).addTo(map);
const baseMaps = {
  GoogleSat: googleSat,
  StatKart: statKart,
};
map.on('zoomend', () => {
  const currentZoom = map.getZoom();
  if (currentZoom < 19) {
    map.addLayer(statKart);
    map.removeLayer(googleSat);
  } else if (currentZoom >= 19) {
    map.addLayer(googleSat);
    map.removeLayer(statKart);
  }
});
const datasets = await getDatasets();
const featuresForDatasets = await getFeaturesForDatasets(datasets);
featuresForDatasets.forEach((datasetFeatures) => {
  datasetFeatures.featureCollection.features.forEach((feature: Feature) => {
    feature.properties!.datasetId = datasetFeatures.datasetId;
    addToOrCreateLayer(feature);
  });
});
L.control.layers(baseMaps, layers).addTo(map);

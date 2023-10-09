import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS, POLLING_INTERVAL } from './config.js';
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
const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', MAP_OPTIONS).addTo(map);
const standardMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
const wmsLayer = L.tileLayer.wms('https://openwms.statkart.no/skwms1/wms.havnedata');

const baseMaps = {
  'OpenStreetMap.HOT': osmHOT,
  Standard: standardMap,
  WMS: wmsLayer,
};

const controlLayers = L.control.layers(baseMaps).addTo(map);

const fetchData = async () => {
  console.log('Refetch');

  const datasets = await getDatasets();
  const featuresForDatasets = await getFeaturesForDatasets(datasets);

  Object.keys(layers).forEach((key) => {
    controlLayers.removeLayer(layers[key]);
    layers[key].clearLayers();
  });

  featuresForDatasets.forEach((datasetFeatures) => {
    datasetFeatures.featureCollection.features.forEach((feature: Feature) => {
      feature.properties!.datasetId = datasetFeatures.datasetId;
      addToOrCreateLayer(feature);
    });
  });

  Object.entries(layers).forEach(([key, value]) => {
    controlLayers.addOverlay(value, key).addTo(map);
  });

  setTimeout(fetchData, POLLING_INTERVAL);
};

fetchData();

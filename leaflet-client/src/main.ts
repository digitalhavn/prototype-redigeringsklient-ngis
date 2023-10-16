import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS } from './config.js';
import L, { Layer, WMSOptions } from 'leaflet';
import { Feature } from 'geojson';
import { onMarkerClick } from './components/featureDetails/index.js';
import { findPath, setLoading } from './util.js';
import { getDatasets, getFeaturesForDatasets, getSchema } from './ngisClient.js';
import { handleOpenCreateFeatureModal } from './components/createFeature/index.js';

const addToOrCreateLayer = (feature: Feature) => {
  const objectType: string = feature.properties!.featuretype;
  if (!layers[objectType]) {
    layers[objectType] = L.geoJson(undefined, {
      style: () => {
        return GEO_JSON_STYLE_OPTIONS[feature.geometry.type];
      },
      onEachFeature: (feature, layer) => {
        featuresMap[feature.properties.identifikasjon.lokalId] = layer;
        layer.on('click', onMarkerClick);
      },
      pointToLayer: (feature) => {
        const path = findPath(feature);
        const customIcon = L.icon({
          iconUrl: `/havnesymboler/${path}`,
          iconSize: [15, 15],
        });
        const [lng, lat] = feature.geometry.coordinates;
        return L.marker([lng, lat], { icon: customIcon });
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
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', MAP_OPTIONS).addTo(map);

const wmsLayer = L.tileLayer
  .wms('https://openwms.statkart.no/skwms1/wms.havnedata', {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetMap',
    format: 'image/png',
    layers: 'havnedata',
    CRS: 'EPSG:4326',
    bbox: '57.021168,0.228508,71.516049,37.230461',
    tileSize: 1024,
    updateWhenIdle: false,
    transparent: true,
    crossOrigin: true,
  } as WMSOptions)
  .addTo(map);

const datasets = await getDatasets();
export const schemas = await getSchema(datasets);
const featuresForDatasets = await getFeaturesForDatasets(datasets);

featuresForDatasets.forEach((datasetFeatures) => {
  datasetFeatures.featureCollection.features.forEach((feature: Feature) => {
    feature.properties!.datasetId = datasetFeatures.datasetId;
    addToOrCreateLayer(feature);
  });
});
setLoading(false);

wmsLayer.addTo(map);
L.control.layers(undefined, layers).addTo(map);

const modal = document.querySelector('[data-modal]') as HTMLDialogElement;

modal.showModal();

modal.addEventListener('click', (e) => {
  const dialogBounds = modal.getBoundingClientRect();
  if (
    e.clientX < dialogBounds.left ||
    e.clientX > dialogBounds.right ||
    e.clientY < dialogBounds.top ||
    e.clientY > dialogBounds.bottom
  ) {
    modal.close();
  }
});

handleOpenCreateFeatureModal();

import './style.css';
import L, { Layer, WMSOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './components/layerControl/layerControl.css';
import './components/multiselect/multiselect.css';
import './components/featureDetails/featureDetails.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS, NGIS_DEFAULT_DATASET } from './config.js';
import { Feature } from 'geojson';
import { onMarkerClick } from './components/featureDetails';
import { findPath, setLoading } from './util.js';
import { getDataset, getDatasetFeatures, getDatasets, getSchema } from './ngisClient.js';
import { State } from './state.js';
import { renderDatasetOptions } from './components/header.js';
import { renderCreateFeature } from './components/createFeature';
import { generateLayerControl } from './components/layerControl/generateLayerControl.js';
import drawLocales from 'leaflet-draw-locales';

drawLocales('norwegian');

export const addToOrCreateLayer = (feature: Feature) => {
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

export const toggleLayer = (checkbox: HTMLInputElement) => {
  if (checkbox.checked) {
    map.addLayer(layers[checkbox.value]);
  } else {
    map.removeLayer(layers[checkbox.value]);
  }
};

export const layers: Record<string, L.GeoJSON> = {};

// Maps feature local ID to leaflet layer in order to
// update and delete already created layers
const featuresMap: Record<string, Layer> = {};

export const map = L.map('map').setView(START_LOCATION, 15); // Creating the map object

const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  ...MAP_OPTIONS,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
});

const OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', MAP_OPTIONS).addTo(map);
const baseMaps = {
  GoogleSat: googleSat,
  OpenStreetMap: OpenStreetMap,
};

export const flyToActive = () => {
  const { ur, ll } = State.activeDataset?.bbox!;
  map.flyToBounds([ur, ll], { duration: 1 });
};

const depthWMS = new L.TileLayer.WMS('https://wms.geonorge.no/skwms1/wms.dybdedata2', {
  service: 'WMS',
  version: '1.3.0',
  request: 'GetMap',
  format: 'image/png',
  layers: 'Dybdedata2',
  CRS: 'EPSG:4326',
  bbox: '57.021168,0.228508,71.516049,37.230461',
  tileSize: 1024,
  updateWhenIdle: false,
  transparent: true,
  crossOrigin: true,
} as WMSOptions).addTo(map);

const symbolWMS = L.tileLayer
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

map.on('zoomend', () => {
  const currentZoom = map.getZoom();
  if (currentZoom < 19) {
    map.addLayer(OpenStreetMap);
    map.removeLayer(googleSat);
    depthWMS.bringToFront();
    symbolWMS.bringToFront();
  } else if (currentZoom >= 19) {
    map.addLayer(googleSat);
    map.removeLayer(OpenStreetMap);
    depthWMS.bringToFront();
    symbolWMS.bringToFront();
  }
});

L.control.layers(baseMaps).addTo(map);
depthWMS.bringToFront();
symbolWMS.bringToFront();

setLoading(true);
const datasets = await getDatasets();
State.setDatasets(datasets);
State.setActiveDataset(datasets.find(({ name }) => name === NGIS_DEFAULT_DATASET) ?? datasets[0]);

const featureTypes: [string, string][] = [];

export const fetchData = async () => {
  setLoading(true);

  Object.keys(layers).forEach((key) => {
    featureTypes.splice(0, featureTypes.length);
    layers[key].clearLayers();
  });

  State.setActiveDataset(await getDataset());
  State.setSchema(await getSchema());

  const datasetFeatures = await getDatasetFeatures();
  datasetFeatures.features.forEach((feature) => {
    featureTypes.push([feature.properties!.featuretype, feature.geometry.type]);
    addToOrCreateLayer(feature);
  });
  generateLayerControl(featureTypes);

  setLoading(false);
};

await fetchData();
renderDatasetOptions();
renderCreateFeature();

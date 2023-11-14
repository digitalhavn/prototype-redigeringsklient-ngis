import './style.css';
import './components/alerts/alerts.css';
import L, { Layer, WMSOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './components/layerControl/layerControl.css';
import './components/multiselect/multiselect.css';
import './components/featureDetails/featureDetails.css';
import './components/header/header.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS, NGIS_DEFAULT_DATASET } from './config.js';
import { Feature } from 'geojson';
import { onMarkerClick } from './components/featureDetails';
import { findPath, makeRequest } from './util.js';
import { getDataset, getDatasetFeatures, getDatasets, getSchema } from './ngisClient.js';
import { State } from './state.js';
import { renderDatasetOptions } from './components/header/header.js';
import { renderCreateFeature } from './components/createFeature';
import { generateLayerControl } from './components/layerControl/generateLayerControl.js';
import { renderSearch } from './components/search/search.js';
import drawLocales from 'leaflet-draw-locales';
import { updateEditedFeatures } from './components/featureDetails/interactiveGeometry.js';

drawLocales('norwegian');

export const addToOrCreateLayer = (feature: Feature, makeDraggable: boolean = false) => {
  feature.properties!.draggable = makeDraggable;
  const objectType: string = feature.properties!.featuretype;
  if (!layers[objectType]) {
    layers[objectType] = L.geoJson(undefined, {
      style: () => {
        return GEO_JSON_STYLE_OPTIONS[feature.geometry.type];
      },
      pointToLayer: (feature) => {
        const path = findPath(feature);
        const customIcon = L.icon({
          iconUrl: `/havnesymboler/${path}`,
          iconSize: [15, 15],
        });
        const [lng, lat] = feature.geometry.coordinates;
        const marker = L.marker([lng, lat], { icon: customIcon, draggable: feature.properties!.draggable });
        delete feature.properties!.draggable;
        marker.on('dragend', (event) => {
          updateEditedFeatures(event);
        });
        return marker;
      },
      onEachFeature: (feature: Feature, layer: L.Layer) => {
        featuresMap[feature.properties!.identifikasjon.lokalId] = layer;
        layer.on('click', onMarkerClick);
      },
      coordsToLatLng: (coords) => {
        return L.latLng(coords);
      },
    });
  }
  layers[objectType].addData(feature);
};

export const updateLayer = (updatedFeature: Feature, makeDraggable: boolean = false) => {
  deleteLayer(updatedFeature);
  addToOrCreateLayer(updatedFeature, makeDraggable);
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

export const map = L.map('map', { zoomControl: false }).setView(START_LOCATION, 15); // Creating the map object

L.control
  .zoom({
    position: 'topright',
  })
  .addTo(map);

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
L.control.layers(baseMaps).addTo(map).setPosition('topright');

depthWMS.bringToFront();
symbolWMS.bringToFront();

renderSearch();

const featureTypes: [string, string][] = [];

await makeRequest(async () => {
  const datasets = await getDatasets();
  State.setDatasets(datasets);
  State.setActiveDataset(datasets.find(({ name }) => name === NGIS_DEFAULT_DATASET) ?? datasets[0]);
}, false);

export const fetchData = async () => {
  Object.keys(layers).forEach((key) => {
    featureTypes.splice(0, featureTypes.length);
    layers[key].clearLayers();
  });

  await makeRequest(async () => {
    const [dataset, schema, datasetFeatures] = await Promise.all([getDataset(), getSchema(), getDatasetFeatures()]);

    State.setActiveDataset(dataset);
    State.setSchema(schema);

    datasetFeatures.features.forEach((feature) => {
      featureTypes.push([feature.properties!.featuretype, feature.geometry.type]);
      addToOrCreateLayer(feature);
    });

    generateLayerControl(featureTypes);
  }, false);
};

if (State.datasets.length > 0) {
  await fetchData();
  renderDatasetOptions();
  renderCreateFeature();
}

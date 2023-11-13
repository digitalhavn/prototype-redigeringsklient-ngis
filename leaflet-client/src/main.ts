import './style.css';
import './components/alerts/alerts.css';
import L, { Layer, WMSOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './components/layerControl/layerControl.css';
import './components/header/header.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS, NGIS_DEFAULT_DATASET } from './config.js';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { onMarkerClick } from './components/featureDetails';
import { getDataset, getDatasetFeatures, getDatasets, getSchema } from './ngisClient.js';
import { State } from './state.js';
import { renderDatasetOptions } from './components/header/header.js';
import { renderCreateFeature } from './components/createFeature';
import { generateLayerControl } from './components/layerControl/generateLayerControl.js';
import { renderSearch } from './components/search/search.js';
import drawLocales from 'leaflet-draw-locales';
import { isEditable, updateEditedFeatures } from './components/featureDetails/interactiveGeometry.js';
import { findPath, makeRequest } from './util.js';

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
let unusedLayers: string[] = ['Fender'];
export const toggleLayer = (checkbox: HTMLInputElement) => {
  if (checkbox.checked) {
    map.addLayer(layers[checkbox.value]);
    unusedLayers = unusedLayers.filter((el) => {
      return el !== checkbox.value;
    });
  } else {
    map.removeLayer(layers[checkbox.value]);
    unusedLayers.push(checkbox.value);
  }
};

const showVisibleFeatures = (bounds: L.LatLngBounds) => {
  console.log(unusedLayers);
  featureTypes.length = 0;
  currentFeatures.forEach((feature) => {
    deleteLayer(feature);
  });
  State.datasetFeatures.features.forEach((feature: Feature) => {
    if (isWithinBounds(feature, bounds)) {
      currentFeatures.push(feature);
      featureTypes.push([feature.properties!.featuretype, feature.geometry.type]);
      addToOrCreateLayer(feature, isEditable);
    }
  });
  generateLayerControl(featureTypes);
  Object.keys(layers).forEach((layerName: string) => {
    if (!unusedLayers.includes(layerName)) {
      layers[layerName].addTo(map);
    }
  });
};
const hideFeatures = () => {
  Object.keys(layers).forEach((layerName: string) => {
    layers[layerName].removeFrom(map);
  });
};
const isWithinBounds = (feature: Feature, latLngBounds: L.LatLngBounds) => {
  const bufferPercentage = 20;
  if (feature.geometry.type === 'Point') {
    const { coordinates } = feature.geometry;
    return latLngBounds.pad(bufferPercentage / 100).contains(L.latLng(coordinates[0], coordinates[1]));
  } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
    const { coordinates } = feature.geometry;
    for (const coord of coordinates) {
      const lat = typeof coord === 'number' ? coord : (coord[1] as number);
      const lng = typeof coord === 'number' ? coord : (coord[0] as number);
      if (!latLngBounds.pad(bufferPercentage / 100).contains(L.latLng(lat, lng))) {
        return false;
      }
    }
    return true;
  }
  return false;
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
  if (map.getZoom() > 15) {
    showVisibleFeatures(map.getBounds());
  } else {
    hideFeatures();
  }
});

L.control.layers(baseMaps).addTo(map).setPosition('topright');

depthWMS.bringToFront();
symbolWMS.bringToFront();

renderSearch();

export const featureTypes: [string, string][] = [];

export const currentFeatures: Feature<Geometry, GeoJsonProperties>[] = [];

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
    State.setDatasetFeatures(datasetFeatures);

    datasetFeatures.features.forEach((feature) => {
      if (isWithinBounds(feature, map.getBounds())) {
        currentFeatures.push(feature);
        featureTypes.push([feature.properties!.featuretype, feature.geometry.type]);
        addToOrCreateLayer(feature);
      }
    });

    generateLayerControl(featureTypes);
  }, false);
};

if (State.datasets.length > 0) {
  await fetchData();
  renderDatasetOptions();
  renderCreateFeature();
  map.on('dragend', () => {
    if (map.getZoom() > 15) {
      showVisibleFeatures(map.getBounds());
    } else {
      hideFeatures();
    }
  });
}

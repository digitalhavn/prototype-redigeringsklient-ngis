import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, GEO_JSON_STYLE_OPTIONS, WMS_PROXY_URL } from './config.js';
import L from 'leaflet';
import { Feature } from 'geojson';
import { getDatasets, getFeaturesForDatasets, getSchema } from './ngisClient';
import { onMarkerClick } from './featureDetails.js';
const findPath = (feature: Feature) => {
  const featuretype = feature.properties!.featuretype;
  let path = '';
  let moveable = '';
  if (['Drivstofftilkobling', 'Kran'].includes(featuretype)) {
    if (feature.properties!.mobil) {
      moveable = 'mobil';
    } else {
      moveable = 'fast';
    }
    path = `${featuretype}/${featuretype} - ${moveable}/${featuretype}_${moveable}.png`;
  } else if (featuretype === 'Beredskapspunkt') {
    if (
      ['brannslange', 'samlingsplass', 'brannhydrant', 'førstehjelp', 'branslukningsapparat'].includes(
        feature.properties!.beredskapstype[0],
      )
    ) {
      path = 'Beredskapspunkt - Annen/Beredskapspunkt - Annen/beredskapspunkt---annen.png';
    } else {
      path = `${featuretype} - ${feature.properties!.beredskapstype}/${featuretype} - ${
        feature.properties!.beredskapstype
      }/${featuretype}---${feature.properties!.beredskapstype}.png`;
    }
  } else if (featuretype === 'Havnesensor') {
    path = `${featuretype}/${featuretype} ${feature.properties!.sensortype}/${featuretype}_${
      feature.properties!.sensortype
    }.png`;
  } else if (featuretype === 'VAUttak') {
    path = `Vanntilkobling/Vanntilkobling ${feature.properties!.VAuttakstype}/Vanntilkobling_${
      feature.properties!.VAuttakstype
    }.png`;
  } else {
    path = `${featuretype}/${featuretype}/${featuretype}.png`;
  }
  const modifiedpath = path.replace(/ø/g, 'o');
  return modifiedpath;
};
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
      pointToLayer: (feature) => {
        const path = findPath(feature);
        const customIcon = L.icon({
          iconUrl: `./havnesymboler/${path}`,
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

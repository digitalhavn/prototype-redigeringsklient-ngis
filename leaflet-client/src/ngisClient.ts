import { Feature, FeatureCollection, GeoJsonProperties, Position } from 'geojson';
import { NGIS_PROXY_URL } from './config';
import { Dataset } from './types/dataset';
import axios from 'axios';
import { EditFeaturesSummary } from './types/editFeaturesSummary';
import { JSONSchemaType } from 'ajv';
import { State } from './state';
import { NGISFeature } from './types/feature';
import { showUpdateMessage } from './components/alerts/update';
import { setLoading } from './util';

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await axios.get(`${NGIS_PROXY_URL}/datasets`);
  return response.data;
};

export const getDataset = async (): Promise<Dataset> => {
  const response = await axios.get(`${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}?crs_EPSG=4258`);
  return response.data;
};

export const getDatasetFeatures = async (): Promise<FeatureCollection> => {
  const response = await axios.get(
    `${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/features?crs_EPSG=4258&references=all`,
  );
  return response.data;
};

export const getSchema = async (): Promise<JSONSchemaType<any>> => {
  const response = await axios.get(`${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/schema`);
  return response.data;
};

export const updateFeatureProperties = async (properties: GeoJsonProperties) => {
  const response = await axios.put(
    `${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/features/${properties!.identifikasjon.lokalId}/attributes`,
    properties,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const getAndLockFeature = async (localId: string): Promise<FeatureCollection> => {
  const response = await axios.get(
    `${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/features/${localId}?crs_EPSG=4258&references=all&locking_type=user_lock`,
  );
  return response.data;
};

export const deleteLocks = async (): Promise<FeatureCollection> => {
  const response = await axios.delete(
    `${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/locks?locking_type=user_lock`,
  );
  return response.data;
};

export const lockDataset = async (): Promise<FeatureCollection> => {
  const response = await axios.get(
    `${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/features?crs_EPSG=4258&locking_type=user_lock`,
  );
  return response.data;
};

export const putFeature = async (
  feature: Feature,
  coordinates: Position | Position[] | Position[][],
  action: 'Create' | 'Replace' | 'Erase',
): Promise<EditFeaturesSummary> => {
  const payload = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4258',
      },
    },
    features: [
      {
        type: 'Feature',
        geometry: { ...feature.geometry, coordinates },
        properties: feature.properties,
        update: { action },
      },
    ],
  };

  const response = await axios.post(
    `${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/features?crs_EPSG=4258&locking_type=user_lock`,
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const updateFeatures = async (features: NGISFeature[]) => {
  setLoading(true);
  await lockDataset();
  const featuresWithUpdate = features.map((feature) => {
    return {
      type: 'Feature',
      geometry: { ...feature.geometry },
      properties: feature.properties,
      update: { action: 'Replace' },
    };
  });
  const payload = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4258',
      },
    },
    features: featuresWithUpdate,
  };
  if (featuresWithUpdate.length > 0) {
    console.log('hello');

    try {
      await axios.post(
        `${NGIS_PROXY_URL}/datasets/${State.activeDataset?.id}/features?crs_EPSG=4258&locking_type=user_lock`,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      );
      await deleteLocks();
      showUpdateMessage();
    } catch (error) {
      console.log(error);
    }
  }
  setLoading(false);
};

import { Feature, FeatureCollection, Position } from 'geojson';
import { NGIS_PROXY_URL } from './config';
import { Dataset } from './types/dataset';
import axios from 'axios';
import { EditFeaturesSummary } from './types/editFeaturesSummary';
import { JSONSchemaType } from 'ajv';
import { NGISFeature } from './types/feature';
import { cloneDeep } from 'lodash';
import { showUpdateMessage } from './components/alerts/update';

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await axios.get(`${NGIS_PROXY_URL}/datasets`);
  return response.data;
};

export const getFeaturesForDatasets = async (
  datasets: Dataset[],
): Promise<{ featureCollection: FeatureCollection; datasetId: string }[]> => {
  return await Promise.all(
    datasets.map(async (dataset) => {
      const response = await axios.get(
        `${NGIS_PROXY_URL}/datasets/${dataset.id}/features?crs_EPSG=4258&references=all`,
      );
      return { featureCollection: response.data, datasetId: dataset.id };
    }),
  );
};

export const getSchema = async (datasets: Dataset[]): Promise<JSONSchemaType<any>[]> => {
  const schemas = await Promise.all(
    datasets.map(async (item: { id: string }) => {
      const response = await fetch(`${NGIS_PROXY_URL}/datasets/${item.id}/schema`);
      return response.json();
    }),
  );
  return schemas;
};

export const updateFeatureProperties = async (feature: Feature) => {
  const { datasetId, ...payload } = feature.properties as any;
  const response = await axios.put(
    `${NGIS_PROXY_URL}/datasets/${datasetId}/features/${feature.properties!.identifikasjon.lokalId}/attributes`,
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const getAndLockFeature = async (datasetId: string, localId: string): Promise<FeatureCollection> => {
  const response = await axios.get(
    `${NGIS_PROXY_URL}/datasets/${datasetId}/features/${localId}?crs_EPSG=4258&references=all&locking_type=user_lock`,
  );
  return response.data;
};
export const deleteLocks = async (datasetId: string): Promise<FeatureCollection> => {
  const response = await axios.delete(`${NGIS_PROXY_URL}/datasets/${datasetId}/locks?locking_type=user_lock`);
  return response.data;
};
export const lockDataset = async (datasetId: string): Promise<FeatureCollection> => {
  const response = await axios.get(
    `${NGIS_PROXY_URL}/datasets/${datasetId}/features?crs_EPSG=4258&locking_type=user_lock`,
  );
  return response.data;
};
export const updateFeature = async (
  feature: Feature,
  coordinates: Position | Position[] | Position[][],
  action: 'Create' | 'Replace' | 'Erase',
): Promise<EditFeaturesSummary> => {
  const { datasetId, ...properties } = feature.properties as any;
  const payload = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4258',
      },
    },
    features: [{ type: 'Feature', geometry: { ...feature.geometry, coordinates }, properties, update: { action } }],
  };

  const response = await axios.post(
    `${NGIS_PROXY_URL}/datasets/${datasetId}/features?crs_EPSG=4258&locking_type=user_lock`,
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const updateFeatures = async (features: NGISFeature[]) => {
  const datasetId = cloneDeep(features[0].properties!.datasetId);
  lockDataset(datasetId);
  const featuresWithUpdate = features.map((feature) => {
    // eslint-disable-next-line no-unused-vars
    const { datasetId, ...properties } = feature.properties as any;
    return {
      type: 'Feature',
      geometry: { ...feature.geometry },
      properties,
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
    const response = await axios.post(
      `${NGIS_PROXY_URL}/datasets/${datasetId}/features?crs_EPSG=4258&locking_type=user_lock`,
      payload,
      { headers: { 'Content-Type': 'application/json' } },
    );
    deleteLocks(datasetId);
    showUpdateMessage();
    return response.data;
  }
};

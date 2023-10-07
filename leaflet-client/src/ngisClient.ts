import { Feature, FeatureCollection } from 'geojson';
import { NGIS_PROXY_URL } from './config';
import { Dataset } from './models/dataset';
import axios from 'axios';
import { EditFeaturesSummary } from './models/editFeaturesSummary';

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
        `${NGIS_PROXY_URL}/datasets/${dataset.id}/features?crs_EPSG=4258&references=all&limit=100`,
      );
      return { featureCollection: response.data, datasetId: dataset.id };
    }),
  );
};

export const getAndLockFeature = async (datasetId: string, localId: string): Promise<FeatureCollection> => {
  const response = await axios.get(
    `${NGIS_PROXY_URL}/datasets/${datasetId}/features/${localId}?crs_EPSG=4258&references=all&locking_type=user_lock`,
  );
  return response.data;
};

export const updateFeature = async (
  datasetId: string,
  feature: Feature,
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
    features: [{ ...feature, update: { action } }],
  };

  const response = await axios.post(
    `${NGIS_PROXY_URL}/datasets/${datasetId}/features?crs_EPSG=4258&locking_type=user_lock`,
    JSON.stringify(payload),
  );
  return response.data;
};

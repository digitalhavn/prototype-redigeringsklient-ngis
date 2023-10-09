import { Feature, FeatureCollection } from 'geojson';
import { NGIS_PROXY_URL } from './config';
import { Dataset } from './models/dataset';
import axios from 'axios';

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
export const getSchema = async (datasets: Dataset[]) => {
  const schemas = await Promise.all(
    datasets.map(async (item: { id: string }) => {
      const response = await fetch(`${NGIS_PROXY_URL}/datasets/${item.id}/schema`);
      return response.json();
    }),
  );
  return schemas;
};

export const updateFeatureProperties = async (feature: Feature, datasetID: string) => {
  const payload = feature.properties;
  const response = await axios.put(
    `${NGIS_PROXY_URL}/datasets/${datasetID}/features/${feature.properties!.identifikasjon.lokalId}/attributes`,
    payload,
  );
  return response.data;
};

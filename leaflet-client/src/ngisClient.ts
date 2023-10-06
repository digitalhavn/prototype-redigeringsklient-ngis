import { FeatureCollection } from 'geojson';
import { NGIS_PROXY_URL } from './config';
import { Dataset } from './models/dataset';
import axios from 'axios';

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await axios.get(`${NGIS_PROXY_URL}/datasets`);
  return response.data;
};

export const getFeatureCollections = async (datasets: Dataset[]): Promise<FeatureCollection[]> => {
  return await Promise.all(
    datasets.map(async (item: { id: string }) => {
      const response = await axios.get(`${NGIS_PROXY_URL}/datasets/${item.id}/features?crs_EPSG=4258&references=all`);
      return response.data;
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

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
      const response = await axios.get(`${NGIS_PROXY_URL}/datasets/${item.id}/features?crs_EPSG=4326&limit=100`);
      return response.data;
    }),
  );
};

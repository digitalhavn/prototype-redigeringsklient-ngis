import { NGIS_PROXY_URL } from './config';
import { Dataset } from './models/dataset';
import axios from 'axios';

export const getDatasets = async () => {
  const response = await axios.get(`${NGIS_PROXY_URL}/datasets`);
  return response.data;
};

export const getFeatureCollections = async (datasets: Dataset[]) => {
  const objectsData = await Promise.all(
    datasets.map(async (item: { id: string }) => {
      const response = await axios.get(`${NGIS_PROXY_URL}/datasets/${item.id}/features?crs_EPSG=4258&references=all`);
      return response.data;
    }),
  );
  const mergedResults = objectsData.flatMap((data) => data.features);
  console.log(mergedResults);
  return mergedResults;
};

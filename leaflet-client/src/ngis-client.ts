import { NGIS_PROXY_URL } from './config';

export const getDatasets = async () => {
  const response = await fetch(`${NGIS_PROXY_URL}/datasets`);
  return await response.json();
};

export const getFeatureCollections = async (datasets: { access: string; id: string; name: string }[]) => {
  const objectsData = await Promise.all(
    datasets.map(async (item: { id: string }) => {
      const response = await fetch(`${NGIS_PROXY_URL}/datasets/${item.id}/features?crs_EPSG=4258&references=all`);
      return response.json();
    }),
  );
  const mergedResults = objectsData.flatMap((data) => data.features);
  console.log(mergedResults);
  return mergedResults;
};

export const getSchema = async (datasets: { access: string; id: string; name: string }[]) => {
  const schemas = await Promise.all(
    datasets.map(async (item: { id: string }) => {
      const response = await fetch(`${NGIS_PROXY_URL}/datasets/${item.id}/schema`);
      return response.json();
    }),
  );
  return schemas;
};

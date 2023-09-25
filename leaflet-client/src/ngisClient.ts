import { NGIS_PROXY_URL } from './config';

export const getDatasets = async () => {
  const response = await fetch(`${NGIS_PROXY_URL}/datasets`);
  return await response.json();
};

export const getFeatureCollections = async (datasets: { access: string; id: string; name: string }[]) => {
  return await Promise.all(
    datasets.map(async (item: { id: string }) => {
      const response = await fetch(`${NGIS_PROXY_URL}/datasets/${item.id}/features?crs_EPSG=4326&limit=100`);
      return response.json();
    }),
  );
};

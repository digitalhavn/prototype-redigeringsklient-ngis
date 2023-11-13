/* eslint-disable camelcase */
import { Feature, FeatureCollection, GeoJsonProperties, Position } from 'geojson';
import { DEFAULT_HTTP_TIMEOUT, NGIS_PROXY_URL } from './config';
import { Dataset } from './types/dataset';
import axios from 'axios';
import { EditFeaturesSummary } from './types/editFeaturesSummary';
import { JSONSchemaType } from 'ajv';
import { State } from './state';
import { NGISFeature } from './types/feature';

axios.defaults.timeout = DEFAULT_HTTP_TIMEOUT;

const getURL = (path: string, query?: Record<string, string>) => {
  const url = new URL(path, NGIS_PROXY_URL);
  query &&
    Object.entries(query).forEach(([name, value]) => {
      url.searchParams.append(name, value);
    });
  return url.toString();
};

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await axios.get(getURL('datasets'));
  return response.data;
};

export const getDataset = async (): Promise<Dataset> => {
  const response = await axios.get(getURL(`datasets/${State.activeDataset?.id}`, { crs_EPSG: '4258' }));
  return response.data;
};

export const getDatasetFeatures = async (bboxQuery: string, nonPointsFilter?: string): Promise<FeatureCollection> => {
  const query: Record<string, string> = { crs_EPSG: '4258', bbox: bboxQuery, references: 'direct' };
  if (nonPointsFilter) query['query'] = `in(*,${nonPointsFilter})`;

  const response = await axios.get(getURL(`datasets/${State.activeDataset?.id}/features`, query));
  return response.data;
};

export const getSchema = async (): Promise<JSONSchemaType<any>> => {
  const response = await axios.get(getURL(`datasets/${State.activeDataset?.id}/schema`));
  return response.data;
};

export const updateFeatureProperties = async (properties: GeoJsonProperties) => {
  const response = await axios.put(
    getURL(`datasets/${State.activeDataset?.id}/features/${properties!.identifikasjon.lokalId}/attributes`),
    properties,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const getAndLockFeature = async (localId: string): Promise<FeatureCollection> => {
  const response = await axios.get(
    getURL(`datasets/${State.activeDataset?.id}/features/${localId}`, {
      crs_EPSG: '4258',
      references: 'all',
      locking_type: 'user_lock',
    }),
  );
  return response.data;
};

export const getAndLockFeatures = async (localIds: string[]): Promise<FeatureCollection> => {
  const localIdStrings = localIds.join(',');
  const response = await axios.get(
    getURL(`datasets/${State.activeDataset?.id}/features`, {
      query: `in(*/identifikasjon/lokalid,${localIdStrings})`,
      crs_EPSG: '4258',
      locking_type: 'user_lock',
    }),
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
    getURL(`datasets/${State.activeDataset?.id}/features`, { crs_EPSG: '4258', locking_type: 'user_lock' }),
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const updateFeatures = async (features: NGISFeature[]) => {
  const localIdStrings = features.map((feature) => feature.properties!.identifikasjon.lokalId);

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

  await getAndLockFeatures(localIdStrings);
  const response = await axios.post(
    getURL(`datasets/${State.activeDataset?.id}/features`, { crs_EPSG: '4258', locking_type: 'user_lock' }),
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );

  return response.data;
};

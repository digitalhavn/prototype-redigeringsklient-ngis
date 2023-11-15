import { JSONSchemaType } from 'ajv';
import { Dataset } from './types/dataset';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

interface IState {
  isLoading: boolean;
  datasets: Dataset[];
  activeDataset?: Dataset;
  schema?: JSONSchemaType<any>;
  datasetFeatures: FeatureCollection<Geometry, GeoJsonProperties>;
  setLoading: Function;
  setDatasets: Function;
  setActiveDataset: Function;
  setSchema: Function;
  setDatasetFeatures: Function;
}

export const State: IState = {
  isLoading: false,
  datasets: [],
  activeDataset: undefined,
  schema: undefined,
  datasetFeatures: {
    type: 'FeatureCollection',
    features: [],
  },
  setLoading: (loading: boolean) => (State.isLoading = loading),
  setDatasets: (datasets: Dataset[]) => (State.datasets = datasets),
  setActiveDataset: (dataset: Dataset) => (State.activeDataset = dataset),
  setSchema: (schema: JSONSchemaType<any>) => (State.schema = schema),
  setDatasetFeatures: (datasetFeatures: FeatureCollection<Geometry, GeoJsonProperties>) =>
    (State.datasetFeatures = datasetFeatures),
};

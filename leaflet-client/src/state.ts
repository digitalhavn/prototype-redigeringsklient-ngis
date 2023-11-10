import { JSONSchemaType } from 'ajv';
import { Dataset } from './types/dataset';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

interface IState {
  datasets: Dataset[];
  activeDataset?: Dataset;
  schema?: JSONSchemaType<any>;
  datasetFeatures: FeatureCollection<Geometry, GeoJsonProperties>;
  setDatasets: Function;
  setActiveDataset: Function;
  setSchema: Function;
  setDatasetFeatures: Function;
}

export const State: IState = {
  datasets: [],
  activeDataset: undefined,
  schema: undefined,
  datasetFeatures: {
    type: 'FeatureCollection',
    features: [],
  },
  setDatasets: (datasets: Dataset[]) => (State.datasets = datasets),
  setActiveDataset: (dataset: Dataset) => (State.activeDataset = dataset),
  setSchema: (schema: JSONSchemaType<any>) => (State.schema = schema),
  setDatasetFeatures: (datasetFeatures: FeatureCollection<Geometry, GeoJsonProperties>) =>
    (State.datasetFeatures = datasetFeatures),
};

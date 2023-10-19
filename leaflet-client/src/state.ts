import { JSONSchemaType } from 'ajv';
import { Dataset } from './types/dataset';

interface IState {
  datasets: Dataset[];
  activeDataset?: Dataset;
  schema?: JSONSchemaType<any>;
  setDatasets: Function;
  setActiveDataset: Function;
  setSchema: Function;
}

export const State: IState = {
  datasets: [],
  activeDataset: undefined,
  schema: undefined,
  setDatasets: (datasets: Dataset[]) => (State.datasets = datasets),
  setActiveDataset: (dataset: Dataset) => (State.activeDataset = dataset),
  setSchema: (schema: JSONSchemaType<any>) => (State.schema = schema),
};

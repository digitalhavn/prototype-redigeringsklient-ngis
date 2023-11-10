import axios from 'axios';
import { Feature } from 'geojson';
import { JSONSchema4 } from 'json-schema';
import { showErrorMessage, showInfoMessage, showSuccessMessage } from './components/alerts/alerts';
import { TIMEOUT_WARNING } from './config';

/**
 * Find path to custom marker icon based on feature type and status.
 *
 * @param feature - feature to get custom icon from
 * @returns path to custom icon as a string
 */
export const findPath = (feature: Feature) => {
  const { featuretype, status } = feature.properties!;
  const basePath = `${featuretype}/${featuretype}`;

  if (status === 'ikkeIBruk') {
    return 'ikke-i-bruk.png';
  }

  switch (featuretype) {
    case 'Beredskapspunkt':
      const beredskapstype = feature.properties!.beredskapstype[0];
      if (
        [
          'båtshake',
          'brannslange',
          'branslukningsapparat',
          'nødplakatinfopunkt',
          'oljelenser',
          'redningsbøye',
          'stige',
        ].includes(beredskapstype)
      ) {
        return `${basePath}_${beredskapstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'Havnesensor':
      const { sensortype } = feature.properties!;
      if (['kamera', 'strøm', 'temperatur', 'værstasjon', 'vannstand', 'vind'].includes(sensortype)) {
        return `${basePath}_${sensortype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'VAUttak':
      const { VAuttakstype } = feature.properties!;
      if (['ferskvann', 'gråvann', 'svartvann'].includes(VAuttakstype)) {
        return `${basePath}_${VAuttakstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'ElKobling':
      const { ElAnleggstype } = feature.properties!;
      if (['ladeanlegg', 'landstrøm', 'strømskap'].includes(ElAnleggstype)) {
        return `${basePath}_${ElAnleggstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'Drivstofftilkobling':
    case 'Kran':
      return `${basePath}_${feature.properties!.mobil ? 'mobil' : 'fast'}.png`;
    case 'Fortøyningsinnretning':
      return `${basePath}_${feature.properties!.fortøyningstype === 'bøye' ? 'bøye' : 'annen'}.png`;
    case 'Fender':
      return `${basePath}_${feature.properties!.fendertype === 'flytefender' ? 'flytende' : 'annen'}.png`;
    case 'Toalett':
    case 'Avfallspunkt':
      return `${basePath}.png`;
    default:
      return 'Annet.png';
  }
};

/**
 * Toggle loading spinner
 *
 * @param isLoading - true = show spinner, false = hide spinner
 */
export const setLoading = (isLoading: boolean) => {
  const loader = document.querySelector('#loading-container') as HTMLDivElement;
  loader.style.display = isLoading ? 'block' : 'none';
};

/**
 * If property type is "object", return a fieldset with nested properties.
 * If property type is "array", return a fieldset with checkboxes for all possibilities.
 * If property type is "boolean", return a checkbox.
 * If property schema has oneOf, return select with possible options.
 * Else return a regular {@link HTMLInputElement}
 *
 * @param propertyName name of property
 * @param propertySchema JSON schema for property
 * @param required list of required properties
 * @param properties properties to edit
 * @returns input based on property type
 */
export const getPropertyInput = (
  propertyName: string,
  propertySchema: JSONSchema4,
  required: string[] | undefined,
  properties: any,
): HTMLElement => {
  const tooltip = document.createElement('span');
  tooltip.className = 'tips';
  tooltip.textContent = propertySchema.description!;

  if (propertySchema.type === 'object') {
    properties[propertyName] = {};

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = propertyName;
    legend.append(tooltip);

    fieldset.append(legend);

    Object.entries(propertySchema.properties!).forEach(([nestedPropertyName, nestedProperty]) =>
      fieldset.append(
        getPropertyInput(
          nestedPropertyName,
          nestedProperty,
          propertySchema.required as string[] | undefined,
          properties[propertyName],
        ),
      ),
    );
    return fieldset;
  }

  if (propertySchema.type === 'array') {
    properties[propertyName] = [];

    // Create checkboxes
    const possibleValues = (propertySchema.items as JSONSchema4)?.oneOf;

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = propertyName;
    legend.append(tooltip);

    if (required && required.includes(propertyName)) {
      const req = document.createElement('span');
      req.className = 'req';
      req.textContent = '*';
      legend.append(req);
    }

    fieldset.append(legend);

    (possibleValues as { const: string; title: string }[]).forEach((possibleValue) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = possibleValue.const;
      checkbox.id = checkbox.name = `${propertyName}-${possibleValue.const}`;
      checkbox.onchange = () => {
        if (checkbox.checked && !properties[propertyName].includes(possibleValue.const)) {
          properties[propertyName] = [...properties[propertyName], possibleValue.const];
        } else if (!checkbox.checked && properties[propertyName].includes(possibleValue.const)) {
          properties[propertyName] = properties[propertyName].filter((value: string) => value !== possibleValue.const);
        }
      };

      const label = document.createElement('label');
      label.htmlFor = `${propertyName}-${possibleValue.const}`;
      label.textContent = possibleValue.title;

      fieldset.append(checkbox, label);
    });
    return fieldset;
  }

  const label = document.createElement('label');
  label.textContent = propertyName;
  label.htmlFor = propertyName;
  label.append(tooltip);

  let input: HTMLInputElement | HTMLSelectElement | undefined = undefined;

  if (propertySchema.type === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = properties[propertyName] = false;
    input.name = input.id = propertyName;
  } else if (propertySchema.oneOf) {
    // Create select
    const possibleValues = propertySchema.oneOf ?? (propertySchema.items as JSONSchema4).oneOf;
    input = document.createElement('select');
    input.name = input.id = propertyName;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Velg ${propertyName}`;
    defaultOption.selected = true;
    defaultOption.disabled = true;
    input.append(defaultOption);

    (possibleValues as { const: string; title: string }[]).forEach((possibleValue) => {
      const option = document.createElement('option');
      option.value = possibleValue.const;
      option.textContent = possibleValue.title;
      input?.append(option);
    });
  } else {
    // Create input
    input = document.createElement('input');
    input.type = ['number', 'integer'].includes(propertySchema.type as string)
      ? 'number'
      : propertySchema.format && propertySchema.format === 'date'
      ? 'date'
      : 'text';
    input.name = input.id = propertyName;
  }

  input.onchange = () => {
    if (!input?.value) {
      delete properties[propertyName];
    } else if (input?.type === 'number') {
      properties[propertyName] = parseInt(input.value, 10);
    } else if (propertySchema.type === 'boolean') {
      properties[propertyName] = (input as HTMLInputElement).checked;
    } else {
      properties[propertyName] = input.value;
    }
  };
  input?.value !== ''
    ? (properties[propertyName] =
        propertySchema.type === 'boolean' ? (input as HTMLInputElement).checked : input?.value)
    : delete properties[propertyName];

  if (propertySchema.type !== 'boolean' && required && required.includes(propertyName)) {
    input.required = true;

    const req = document.createElement('span');
    req.className = 'req';
    req.textContent = '*';
    label.append(req);
  }

  const inputDiv = document.createElement('div');
  inputDiv.append(label, input);
  return inputDiv;
};

//Code below is a lot cleaner but typescript complains
/*
export const isWithinBounds = (feature: Feature, latLngBounds: L.LatLngBounds) => {
  if (feature.geometry.coordinates && ['Point', 'LineString', 'Polygon'].includes(feature.geometry.type)) {
    const { coordinates } = feature.geometry;
    switch (feature.geometry.type) {
      case 'Point':
        return latLngBounds.contains(L.latLng(coordinates[0], coordinates[1]));

      case 'LineString':
      case 'Polygon':
        for (const coord of coordinates) {
          if (!latLngBounds.contains(L.latLng(coord[1], coord[0]))) {
            return false;
          }
        }
        return true;

      default:
        return false;
    }
  }
  return false;
};
*/
/**
 * Extract error message from a http error to display in the UI
 *
 * @param error - error response
 * @returns list of strings or {@link HTMLElement} containing the error message
 */
export const getErrorMessage = (error: unknown): (string | Node)[] => {
  if (axios.isAxiosError(error)) {
    const { code, response } = error;
    if (code === 'ECONNABORTED') {
      return ['Forespørselen ble avbrutt fordi det tok for lang tid...'];
    } else if (response?.status === axios.HttpStatusCode.BadRequest) {
      console.error(response.data);
      const { errors, title }: { errors: { lokalid: string; reason: string }[]; title: string } = response.data;
      const errorMessage: (string | HTMLElement)[] = [`${title}:`];
      errors.forEach(({ lokalid, reason }) => {
        const newError = document.createElement('div');
        newError.textContent = `lokalid ${lokalid.slice(0, 7)}... - ${reason}`;
        errorMessage.push(newError);
      });
      return errorMessage;
    } else if (response?.status && response.status >= axios.HttpStatusCode.InternalServerError) {
      return [`${response.status}: Noe gikk galt med tjeneren. Prøv på nytt senere...`];
    } else {
      return ['Noe gikk galt...'];
    }
  } else {
    return [JSON.stringify(error)];
  }
};

/**
 * Util function for handling loading, errors, and success for a request.
 * Will also show a info toast if request takes longer than expected.
 *
 * @param request - request function
 * @param showSuccess - whether or not a toast message should be shown when request completes successfully
 * @param onError - function to run on error (in addition to error toast)
 * @param successMessage - custom success message
 * @param errorMessage - custom error message
 */
export const makeRequest = async (
  request: () => Promise<void>,
  showSuccess: boolean = true,
  onError?: () => void,
  successMessage?: string,
  errorMessage?: string,
) => {
  setLoading(true);
  const timeoutWarningID = setTimeout(() => {
    showInfoMessage('Forespørselen tar lengere tid enn forventet. Vennligst vent...');
  }, TIMEOUT_WARNING);

  try {
    await request();
    showSuccess && showSuccessMessage(successMessage);
  } catch (error) {
    showErrorMessage(error, errorMessage);
    onError?.();
  }

  clearTimeout(timeoutWarningID);
  setLoading(false);
};

import { getErrorMessage } from '../../util';

export const showErrorMessage = (error: unknown, defaultMessage?: string) => {
  console.log(error);

  const alert = createAlert();
  alert.style.background = '#CC0000';
  alert.append(defaultMessage ?? getErrorMessage(error));
};

export const showInfoMessage = (message: string) => {
  const alert = createAlert();
  alert.style.background = '#1E92F4';
  alert.append(message);
};

export const showSuccessMessage = (message: string = 'Endringer lagret') => {
  const alert = createAlert();

  const checkmark = document.createElement('span');
  checkmark.innerHTML = '&#10004;';

  alert.style.background = '#4BB543';
  alert.append(checkmark, message);
};

const createAlert = () => {
  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.classList.add('show');

  setTimeout(() => {
    alert.classList.remove('show');
  }, 5000);

  document.querySelector('body')?.append(alert);

  return alert;
};

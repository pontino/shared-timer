/* tslint:disable:no-string-literal */
export const environment = {
  production: true,
  apiUrl: window['env']?.['apiUrl'] || '',
  autodetectBaseUrl: window['env']?.['autodetectBaseUrl'] === 'true'
};

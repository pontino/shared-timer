import { environment } from '../environments/environment';

export const getEnvironment = () => {
  const ret = environment;
  if (ret.autodetectBaseUrl) {
    ret.apiUrl = location.protocol + '//' + location.host;
  }
  return ret;
};

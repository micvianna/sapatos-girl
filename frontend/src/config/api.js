const configuredApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const apiUrlWithoutTrailingSlash = configuredApiUrl.replace(/\/+$/, '');

export const API_URL = apiUrlWithoutTrailingSlash.endsWith('/api')
  ? apiUrlWithoutTrailingSlash
  : `${apiUrlWithoutTrailingSlash}/api`;

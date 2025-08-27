function path(root: string, sublink: string) {
  return `${root}${sublink}/`;
}

// export const ROOTS_AUTH = 'https://attraction.somos.srl/api/auth';
export const ROOTS_AUTH = 'http://127.0.0.1:8000/api/auth';
export const ENDPOINTS_AUTH = {
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  setPassword: path(ROOTS_AUTH, '/setPassword'),
  profile: path(ROOTS_AUTH, '/profile'),
  refresh: path(ROOTS_AUTH, '/token/refresh'),
  logout: path(ROOTS_AUTH, '/logout'),
  forgotPassword: path(ROOTS_AUTH, '/password-reset'),
  resetPassword: path(ROOTS_AUTH, '/password-reset-confirm'),
};


export const ROOTS_TRIPS = 'http://127.0.0.1:8000/api/auth';
// export const ROOTS_TRIPS = 'https://attraction.somos.srl/api/auth';
export const ENDPOINTS_TRIPS = {
  planTrip: path(ROOTS_TRIPS, '/plan-trip'),
  getAllStops: path(ROOTS_TRIPS, '/stops'),
  favorites: path(ROOTS_TRIPS, '/places'),
  searchHistory: path(ROOTS_TRIPS, '/search'),
};
export const ROOTS_LOCATIONS = 'http://127.0.0.1:8000/api/auth';
// const ROOTS_LOCATIONS = 'https://attraction.somos.srl/api/auth';
export const ENDPOINTS_LOCATIONS = {
  getAllLocations: path(ROOTS_LOCATIONS, '/places'),
  addLocation: path(ROOTS_LOCATIONS, '/stops'),
  deleteLocation: path(ROOTS_LOCATIONS, '/places'),
};

// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = 'http://maas.somos.srl/auth';
const ROOTS_ROUTES = 'http://maas.somos.srl';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/signin'),
  register: path(ROOTS_AUTH, '/signup'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
};
export const PATH_ROUTES = {
  root: ROOTS_ROUTES,
  dashboard: path(ROOTS_ROUTES, '/tripplanner'),
};

export const PATH_PAGE = {
  maintenance: '/maintenance',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/',
};
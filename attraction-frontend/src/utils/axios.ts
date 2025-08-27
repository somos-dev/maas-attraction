import { ROOTS_AUTH } from '@/routes/api_endpoints';
import axios from 'axios';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: ROOTS_AUTH || '' });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    //return Promise.reject((error.response && error.response.data) || 'Something went wrong');
    Promise.reject(error)
);
export default axiosInstance;

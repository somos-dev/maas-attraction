import Axios from 'axios';
import { useEnqueueSnackbar } from './useEnqueueSnackbar';
import useLocales from './useLocales';

export function useErrorHandler() {
  const { translate } = useLocales();
  const { showErrorMessage } = useEnqueueSnackbar();

  const handleError = (error: any) => {
    //console.log(JSON.stringify(error));
    ////Just to handle the error when it is throw by a request cancellation
    if (Axios.isCancel(error)) {
      return console.log('Building Request canceled');
    }
    //GENERIC ERROR, INTERNAL SERVER ERROR OR NO HTTP ERROR
    let errorMessage = translate('INTERNAL_SERVER_ERROR');
    if (error?.statusCode) {
      if (error?.statusCode === 401) {
        console.log('HTTP__________________________401');
        errorMessage = translate('AUTH_UNAUTHORIZED');
      } else if (error?.statusCode === 403) {
        console.log('HTTP__________________________403');
        errorMessage = translate('AUTH_FORBIDDEN');
      } else if (error?.statusCode === 408) {
        console.log('TIMEOUT ERROR SERVER SIDE______________________________');
        errorMessage = translate('REQUEST_TIMEOUT');
      } else if (error?.errorCode) {
        console.log('HTTP ERROR WITH BACKEND ERRORS CODE__________________', error?.errorCode);
        errorMessage = translate(error?.errorCode);
      }
    } else {
      if (error.code === 'ECONNABORTED') {
        console.log('TIMEOUT ERROR AXIOS______________________________');
        errorMessage = translate('REQUEST_TIMEOUT');
      } else if (error.message === 'Network Error') {
        console.log('Network Error_______________________');
        errorMessage = translate('NETWORK_ERROR');
      }
    }
    showErrorMessage(errorMessage);
  };

  return handleError;
}

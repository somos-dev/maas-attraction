import { jwtDecode } from 'jwt-decode';
import { PATH_AUTH } from '../routes/paths';
import axios from './axios';
import { useRoutesStore } from '@/store/routesStore';
import { useLocationStore } from '@/store/locationStore';
import { useMapStore } from '@/store/mapStore';
import { useStopsStore } from '@/store/stopsStore';

// ----------------------------------------------------------------------

const isValidToken = (accessToken: string): boolean => {
  if (!accessToken) {
    return false;
  }
  
  try {
    const decoded = jwtDecode<{ exp: number }>(accessToken);
    const currentTime = Date.now() / 1000;
    
    // Add a small buffer (30 seconds) to consider token as expired before actual expiration
    return decoded.exp > (currentTime + 30);
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

const setSession = (accessToken: string | null, refreshToken?: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
  
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

// Helper function to get tokens from localStorage safely
const getStoredTokens = () => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

// Helper function to clear all auth data
const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  delete axios.defaults.headers.common.Authorization;
};
const clearStoreData = () => {
  if (typeof window !== 'undefined') {
    useRoutesStore.getState().reset();
    useLocationStore.getState().reset();
    useMapStore.getState().reset();
    useStopsStore.getState().reset();
  }
};

export { isValidToken, setSession, getStoredTokens, clearAuthData, clearStoreData };
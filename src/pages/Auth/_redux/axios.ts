import axios from 'axios';
import { API_URL } from '../../../redux/urls';
import { store } from '../../../redux/store';

const BASE_URL = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
BASE_URL.interceptors.request.use(
  (config) => {
    const { user: user }: any = store.getState();
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user?.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default BASE_URL;
// apiClient.ts (thay thế file hiện tại)
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Methods } from './typings';
import { useUserStore } from '../states/user';
import { BASE_URL } from './APIConfig';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
});

// Chuẩn hoá token: bỏ prefix "Bearer "
const normalizeToken = (raw?: string | null) => {
  if (!raw) return '';
  return raw.replace(/^Bearer\s+/i, '').trim();
};

// ✅ Luôn gắn token trước mỗi request
axiosInstance.interceptors.request.use(
  async (config) => {
    // 1) lấy từ Zustand trước
    let token = useUserStore.getState().token || '';

    // 2) fallback sang AsyncStorage nếu Zustand chưa có
    if (!token) {
      try {
        token = (await AsyncStorage.getItem('token')) || '';
      } catch {}
    }

    token = normalizeToken(token);

    if (!config.headers) config.headers = {};
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else {
      delete (config.headers as any).Authorization;
    }

    // Log nhẹ để kiểm tra interceptor có chạy và có token không
    console.log(
      '[axios:req]',
      config.method?.toUpperCase(),
      config.baseURL,
      config.url,
      'auth:',
      token ? 'YES' : 'NO'
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Dọn token nếu gặp 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      console.warn('[axios:res] 401 → clearing token');
      try { await AsyncStorage.removeItem('token'); } catch {}
      useUserStore.getState().setToken('');
    }
    return Promise.reject(error);
  }
);

// -------- fetchers --------
export const fetcherAxios = async ({
  url,
  method,
  data,
}: {
  url: string;
  method: Methods;
  data?: any;
}) => {
  switch (method) {
    case Methods.GET:
      return axiosInstance.get(url, { params: data });
    case Methods.POST:
      return axiosInstance.post(url, data);
    case Methods.PUT:
      return axiosInstance.put(url, data);
    case Methods.PATCH:
      return axiosInstance.patch(url, data);
    case Methods.DELETE:
      // nếu cần gửi body cho DELETE
      return axiosInstance.request({ url, method: 'DELETE', data });
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

export const fetcher = async (url: string, method: Methods, data?: any) => {
  try {
    console.log('🚀 [fetcher]', method, url);
    const res = await fetcherAxios({ url, method, data });
    return res.data;
  } catch (e) {
    const err = e as AxiosError;
    throw err.response ?? e;
  }
};

// ✅ Gọi hàm này NGAY SAU khi login/signup để đảm bảo interceptor đọc được token mới
export const persistAuthToken = async (token: string) => {
  const t = normalizeToken(token);
  useUserStore.getState().setToken(t);
  try {
    await AsyncStorage.setItem('token', t);
  } catch {}
};

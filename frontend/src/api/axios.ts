// frontend/src/api/axios.ts
/**
 * Глобальный экземпляр Axios:
 *  • автоматически подставляет Bearer-токен;
 *  • ловит 401/419, запрашивает /auth/refresh, пере-отправляет исходный запрос;
 *  • хранит токены в localStorage (можно заменить на secure-cookie).
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/* ------------------------------------------------------------------ */
/*  helpers                                                           */
/* ------------------------------------------------------------------ */

const getTokens = (): Tokens | null => {
  const raw = localStorage.getItem('authTokens');
  return raw ? (JSON.parse(raw) as Tokens) : null;
};

const setTokens = (tokens: Tokens) =>
  localStorage.setItem('authTokens', JSON.stringify(tokens));

const clearTokens = () => localStorage.removeItem('authTokens');

/* ------------------------------------------------------------------ */
/*  Axios instance                                                    */
/* ------------------------------------------------------------------ */

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/* ------------------------------------------------------------------ */
/*  Request-interceptor: Bearer token                                 */
/* ------------------------------------------------------------------ */

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const tokens = getTokens();
  if (tokens?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

/* ------------------------------------------------------------------ */
/*  Response-interceptor: refresh-flow                                */
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

/** Повторяем запросы, ожидавшие новый access-token */
const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token),
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError<any>) => {
    const originalConfig = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // если не 401/419 или уже пробовали refresh — пропускаем дальше
    if (
      !error.response ||
      ![401, 419].includes(error.response.status) ||
      originalConfig._retry
    ) {
      return Promise.reject(error);
    }

    /* ---------- Refresh-flow ---------- */
    if (!isRefreshing) {
      isRefreshing = true;
      originalConfig._retry = true;

      try {
        const stored = getTokens();
        if (!stored?.refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<Tokens>(
          `${API_URL}/auth/refresh`,
          { refreshToken: stored.refreshToken },
          { withCredentials: true },
        );

        // сохраняем новые токены
        setTokens(data);
        processQueue(null, data.accessToken);
        isRefreshing = false;

        // проставляем заголовок и повторяем оригинальный запрос
        if (originalConfig.headers)
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalConfig);
      } catch (err) {
        processQueue(err as AxiosError, null);
        clearTokens();
        isRefreshing = false;
        // выбрасываем пользователя на /login
        window.location.replace('/login');
        return Promise.reject(err);
      }
    }

    /* пока refresh в работе — кладём запрос в очередь */
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token: string) => {
          if (originalConfig.headers)
            originalConfig.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalConfig));
        },
        reject: (err) => {
          reject(err);
        },
      });
    });
  },
);

/* ------------------------------------------------------------------ */
/*  export                                                            */
/* ------------------------------------------------------------------ */

export default api;
export { getTokens, setTokens, clearTokens };

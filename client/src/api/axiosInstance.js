import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error) => {
  refreshQueue.forEach((callback) => callback(error));
  refreshQueue = [];
};

// Routes that don't require a session — no point force-redirecting to /login
// if we're already sitting on one of these, since that's what caused the loop.
const PUBLIC_PATHS = ['/login', '/signup', '/verify-otp'];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Never attempt refresh for these three — they're either the refresh
      // call itself, or an initial "am I logged in" check where a 401 is a
      // perfectly normal, expected outcome (not a session that just expired).
      if (
        originalRequest.url.includes('/auth/refresh-token') ||
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/me')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((err) => {
            if (err) reject(err);
            else resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post('/auth/refresh-token');
        isRefreshing = false;
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // Only force a hard redirect if we're not already on a public page —
        // this is the exact check that prevents the infinite reload loop.
        if (!PUBLIC_PATHS.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
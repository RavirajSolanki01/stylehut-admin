import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
  AxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  withAuth?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://stylehut-be.vercel.app/api",
  timeout: 10000,
});

// ✅ Safe & Type-Safe Request Interceptor
apiClient.interceptors.request.use(
  (config): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("authToken");

    // Safely cast to custom type to access withAuth
    const customConfig = config as CustomAxiosRequestConfig;

    if (
      customConfig.withAuth &&
      token &&
      config.headers instanceof AxiosHeaders
    ) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (
      config.headers instanceof AxiosHeaders &&
      !isFormData &&
      !config.headers.has("Content-Type")
    ) {
      config.headers.set("Content-Type", "application/json");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      if (typeof window !== "undefined") {
        toast.error("You are unauthorized person to perform this task");
        localStorage.clear();
        window.location.href = "/auth/login";
        return;
      }
      return;
    } else {
      return Promise.reject(error);
    }
  },
);

// ✅ Base API methods
const apiService = {
  get: <T>(
    url: string,
    config?: CustomAxiosRequestConfig,
  ): Promise<{ data: T; status: number }> =>
    apiClient.get<T>(url, config).then((res) => ({
      data: res.data,
      status: res.status,
    })),

  post: <T>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<{ data: T; status: number }> =>
    apiClient.post<T>(url, data, config).then((res) => ({
      data: res.data,
      status: res.status,
    })),

  put: <T>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<{ data: T; status: number }> =>
    apiClient.put<T>(url, data, config).then((res) => ({
      data: res.data,
      status: res.status,
    })),

  delete: <T>(
    url: string,
    config?: CustomAxiosRequestConfig,
  ): Promise<{ data: T; status: number }> =>
    apiClient.delete<T>(url, config).then((res) => ({
      data: res.data,
      status: res.status,
    })),

  patch: <T>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<{ data: T; status: number }> =>
    apiClient.patch<T>(url, data, config).then((res) => ({
      data: res.data,
      status: res.status,
    })),
};

export default apiService;

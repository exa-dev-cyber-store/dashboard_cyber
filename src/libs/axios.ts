import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export function getStoredToken(): string {
    if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
        const local = localStorage.getItem("token");
        if (local) return local;
    }
    return "";
}

export function getStoredRefreshToken(): string {
    if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)refreshToken=([^;]*)/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
        const local = localStorage.getItem("refreshToken");
        if (local) return local;
    }
    return "";
}

export function setStoredTokens(accessToken: string, refreshToken?: string): void {
    if (typeof document !== "undefined") {
        const isSecure = window.location.protocol === "https:";
        const expiresAccess = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
        document.cookie = `token=${encodeURIComponent(accessToken)}; path=/; SameSite=Lax; expires=${expiresAccess}${isSecure ? "; Secure" : ""}`;

        if (refreshToken) {
            const expiresRefresh = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; SameSite=Lax; expires=${expiresRefresh}${isSecure ? "; Secure" : ""}`;
        }
    }
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("token", accessToken);
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }
    }
}

export function clearStoredTokens(): void {
    if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "admin_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("admin_name");
    }
}

export const axiosInstanceData = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export const axiosInstancePostDataProducts = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

// Request interceptor to attach access token if missing or stale
const setupRequestInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        const existing = config.headers?.Authorization as string | undefined;
        if (!existing || existing === "Bearer " || existing === "Bearer undefined" || existing === "Bearer null") {
            const token = getStoredToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    });
};

setupRequestInterceptor(axiosInstanceData);
setupRequestInterceptor(axiosInstancePostDataProducts);

// Refresh Token Lock & Queued Request Interceptor
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

const setupResponseInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const status = error.response ? error.response.status : null;

            // Avoid loops on refresh endpoint itself or auth routes
            if (
                status !== 401 ||
                originalRequest?._retry ||
                originalRequest?.url?.includes("/auth/refresh") ||
                originalRequest?.url?.includes("/auth/login")
            ) {
                return Promise.reject(error);
            }

            const refreshToken = getStoredRefreshToken();
            if (!refreshToken) {
                clearStoredTokens();
                if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return instance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh endpoint with raw axios
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                }, {
                    withCredentials: true,
                });

                const payload = res.data?.data || res.data;
                const newAccessToken = payload?.accessToken || payload?.token;
                const newRefreshToken = payload?.refreshToken || refreshToken;

                if (!newAccessToken) {
                    throw new Error("Missing new access token in refresh response");
                }

                setStoredTokens(newAccessToken, newRefreshToken);
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return instance(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                clearStoredTokens();
                if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
    );
};

setupResponseInterceptor(axiosInstanceData);
setupResponseInterceptor(axiosInstancePostDataProducts);
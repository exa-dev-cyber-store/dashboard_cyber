import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export function getStoredToken(): string {
    if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
    }
    return "";
}


export function getStoredRefreshToken(): string {
    return "";
}

export function setStoredTokens(accessToken: string): void {
    if (typeof document !== "undefined") {
        const isSecure = window.location.protocol === "https:";
        const expiresAccess = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
        document.cookie = `token=${encodeURIComponent(accessToken)}; path=/; SameSite=Lax; expires=${expiresAccess}${isSecure ? "; Secure" : ""}`;
    }
    // Purge any legacy items from localStorage
    if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
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
                // Call refresh endpoint with raw axios; browser automatically attaches httpOnly refreshToken cookie
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true,
                });

                const payload = res.data?.data || res.data;
                const newAccessToken = payload?.accessToken || payload?.token;

                if (!newAccessToken) {
                    throw new Error("Missing new access token in refresh response");
                }

                setStoredTokens(newAccessToken);
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
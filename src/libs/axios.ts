import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

function getStoredToken(): string {
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

export const axiosInstanceData = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstanceData.interceptors.request.use((config) => {
    const existing = config.headers?.Authorization as string | undefined;
    if (!existing || existing === "Bearer " || existing === "Bearer undefined" || existing === "Bearer null") {
        const token = getStoredToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const axiosInstancePostDataProducts = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

axiosInstancePostDataProducts.interceptors.request.use((config) => {
    const existing = config.headers?.Authorization as string | undefined;
    if (!existing || existing === "Bearer " || existing === "Bearer undefined" || existing === "Bearer null") {
        const token = getStoredToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
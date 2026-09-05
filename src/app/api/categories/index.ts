import { axiosInstanceData } from "@/libs/axios";

export const getCategory = async () => {
    return await axiosInstanceData.get(`/api/categories`).then(res => {
        const data = res.data;
        return Array.isArray(data) ? data : (data?.data || data?.categories || []);
    });
};
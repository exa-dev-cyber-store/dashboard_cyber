import { axiosInstanceData } from '@/libs/axios';

export interface CreateVoucherPayload {
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  isPublic?: boolean;
  isActive?: boolean;
  validUntil: string;
  usageLimit?: number;
}

export const getVouchers = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  visibility: string = 'all',
  status: string = 'all',
  token: string
) => {
  const skip = (page - 1) * limit;
  const url = `/api/vouchers?limit=${limit}&skip=${skip}&q=${encodeURIComponent(
    search
  )}&visibility=${visibility}&status=${status}`;
  return await axiosInstanceData
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const createVoucher = async (
  data: CreateVoucherPayload,
  token: string
) => {
  return await axiosInstanceData
    .post('/api/vouchers', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const updateVoucher = async (
  id: string,
  data: Partial<CreateVoucherPayload>,
  token: string
) => {
  return await axiosInstanceData
    .put(`/api/vouchers/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const deleteVoucher = async (id: string, token: string) => {
  return await axiosInstanceData
    .delete(`/api/vouchers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

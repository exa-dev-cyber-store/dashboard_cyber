import { axiosInstanceData } from '@/libs/axios';

export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  role: string = 'all',
  token: string
) => {
  const skip = (page - 1) * limit;
  const url = `/api/users?limit=${limit}&skip=${skip}&q=${encodeURIComponent(search)}&role=${role}`;
  return await axiosInstanceData
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const updateUserRole = async (
  id: string,
  role: 'admin' | 'user',
  token: string
) => {
  return await axiosInstanceData
    .put(
      `/api/users/${id}/role`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => res.data);
};

export const deleteUser = async (id: string, token: string) => {
  return await axiosInstanceData
    .delete(`/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

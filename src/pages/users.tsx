import { useState, useEffect, useCallback } from "react";
import { getUsers, updateUserRole, deleteUser } from "@/app/api/users";
import { DashboardUser, UserListResponse } from "@/types";
import formatDate from "@/libs/formatDate";
import {
  IconUsers,
  IconShieldLock,
  IconUserCheck,
  IconSearch,
  IconFilter,
  IconRotate,
  IconTrash,
  IconEdit,
  IconX,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCookies } from "react-cookie";

export default function Users() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalAdmins: 0,
    totalRegularUsers: 0,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage] = useState(1);

  // Role Edit Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DashboardUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [cookies] = useCookies(["token"]);
  const token = cookies.token || localStorage.getItem("token") || "";

  const fetchUsersData = useCallback(async () => {
    setLoading(true);
    try {
      const response: { success: boolean; data: UserListResponse; message: string } =
        await getUsers(currentPage, 15, search, roleFilter, token);
      if (response && response.data) {
        setUsers(response.data.users || []);
        setStats({
          total: response.data.total || 0,
          totalAdmins: response.data.totalAdmins || 0,
          totalRegularUsers: response.data.totalRegularUsers || 0,
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memuat daftar pengguna", {
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, roleFilter, token]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const handleOpenRoleModal = (user: DashboardUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await updateUserRole(selectedUser._id, newRole, token);
      toast.success(`Role pengguna ${selectedUser.name} berhasil diubah menjadi ${newRole}`, {
        theme: "dark",
      });
      setRoleModalOpen(false);
      fetchUsersData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengubah role pengguna", {
        theme: "dark",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteModal = (user: DashboardUser) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete._id, token);
      toast.success(`Pengguna ${userToDelete.name} berhasil dihapus`, {
        theme: "dark",
      });
      setDeleteModalOpen(false);
      fetchUsersData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus pengguna", {
        theme: "dark",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <IconUsers className="w-7 h-7 text-cyan-400" />
            User Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola akun pengguna terdaftar, atur hak akses role, dan kelola izin administrator.
          </p>
        </div>
        <button
          onClick={() => fetchUsersData()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/70 text-sm font-medium transition-all"
        >
          <IconRotate className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconUsers className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <IconUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Users
              </p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconShieldLock className="w-16 h-16 text-purple-400" />
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <IconShieldLock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Administrators
              </p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.totalAdmins}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconUserCheck className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IconUserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Regular Customers
              </p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.totalRegularUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email user..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <IconFilter className="w-4 h-4" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Administrator</option>
            <option value="user">Customer (User)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Terdaftar Sejak</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <IconRotate className="w-5 h-5 animate-spin text-cyan-400" />
                      <span>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const initials = user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "U";

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 font-mono">
                              ID: {user._id.substring(user._id.length - 6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <IconShieldLock className="w-3.5 h-3.5 text-purple-400" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <IconUserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Customer
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {user.createdAt ? formatDate(user.createdAt) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors border border-slate-700"
                            title="Ubah Role"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-slate-700"
                            title="Hapus Pengguna"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Edit Modal */}
      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <IconShieldLock className="w-5 h-5 text-cyan-400" />
                Ubah Role Pengguna
              </h3>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white text-sm">{selectedUser.name}</p>
              <p className="font-mono text-slate-400">{selectedUser.email}</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Pilih Role Baru:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewRole("user")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    newRole === "user"
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="font-bold text-xs flex items-center justify-between">
                    Customer (User)
                    {newRole === "user" && <IconCheck className="w-4 h-4 text-emerald-400" />}
                  </span>
                  <span className="text-[11px] text-slate-400">Akses belanja publik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRole("admin")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    newRole === "admin"
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-300"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="font-bold text-xs flex items-center justify-between">
                    Administrator
                    {newRole === "admin" && <IconCheck className="w-4 h-4 text-purple-400" />}
                  </span>
                  <span className="text-[11px] text-slate-400">Akses penuh dashboard</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <IconAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hapus Pengguna?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Apakah Anda yakin ingin menghapus akun{" "}
              <span className="font-semibold text-white">{userToDelete.name}</span> ({userToDelete.email})?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Pengguna"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

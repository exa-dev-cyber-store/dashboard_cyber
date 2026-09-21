import { useState, useEffect, useCallback } from "react";
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  CreateVoucherPayload,
} from "@/app/api/vouchers";
import { DashboardVoucher } from "@/types";
import formatDate from "@/libs/formatDate";
import { formatRupiah, formatCurrencyInput, parseCurrencyInput } from "@/libs/formatRupiah";
import {
  IconTicket,
  IconPlus,
  IconCopy,
  IconCheck,
  IconWorld,
  IconBrandInstagram,
  IconSearch,
  IconFilter,
  IconRotate,
  IconTrash,
  IconX,
  IconDice,
  IconAlertTriangle,
  IconPower,
} from "@tabler/icons-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCookies } from "react-cookie";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState<DashboardVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalPublic: 0,
    totalPrivate: 0,
  });

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage] = useState(1);

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<DashboardVoucher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateVoucherPayload>({
    code: "",
    title: "",
    discountType: "percentage",
    discountValue: 10,
    minPurchase: 0,
    maxDiscount: 0,
    isPublic: true,
    isActive: true,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: 0,
  });

  const [cookies] = useCookies(["token"]);
  const token = cookies.token || "";

  const fetchVouchersData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVouchers(
        currentPage,
        20,
        search,
        visibilityFilter,
        statusFilter,
        token
      );
      if (response && response.data) {
        setVouchers(response.data.vouchers || []);
        setStats({
          total: response.data.total || 0,
          totalPublic: response.data.totalPublic || 0,
          totalPrivate: response.data.totalPrivate || 0,
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memuat daftar voucher", {
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, visibilityFilter, statusFilter, token]);

  useEffect(() => {
    fetchVouchersData();
  }, [fetchVouchersData]);

  // Generate random voucher code
  const handleRandomizeCode = () => {
    const prefixes = formData.isPublic ? ["CYBER", "APPLE", "PROMO", "DEAL"] : ["IGFEED", "TIKTOK", "SECRET", "EXCLUSIVE"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, code: `${prefix}${randomNum}` }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode "${code}" berhasil disalin ke clipboard!`, {
      theme: "dark",
      autoClose: 2000,
    });
  };

  const handleToggleActive = async (voucher: DashboardVoucher) => {
    try {
      await updateVoucher(voucher._id, { isActive: !voucher.isActive }, token);
      toast.success(
        `Voucher ${voucher.code} berhasil di-${!voucher.isActive ? "aktifkan" : "nonaktifkan"}`,
        { theme: "dark" }
      );
      fetchVouchersData();
    } catch (err: any) {
      toast.error("Gagal mengubah status voucher", { theme: "dark" });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) {
      toast.error("Kode dan judul voucher wajib diisi!", { theme: "dark" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createVoucher(
        {
          ...formData,
          code: formData.code.trim().toUpperCase(),
          discountValue: Number(formData.discountValue),
          minPurchase: Number(formData.minPurchase || 0),
          maxDiscount: Number(formData.maxDiscount || 0),
          usageLimit: Number(formData.usageLimit || 0),
        },
        token
      );

      toast.success(`Voucher "${formData.code.toUpperCase()}" berhasil dibuat!`, {
        theme: "dark",
      });
      setCreateModalOpen(false);
      setFormData({
        code: "",
        title: "",
        discountType: "percentage",
        discountValue: 10,
        minPurchase: 0,
        maxDiscount: 0,
        isPublic: true,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        usageLimit: 0,
      });
      fetchVouchersData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal membuat voucher baru", {
        theme: "dark",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!voucherToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVoucher(voucherToDelete._id, token);
      toast.success(`Voucher ${voucherToDelete.code} berhasil dihapus`, {
        theme: "dark",
      });
      setDeleteModalOpen(false);
      fetchVouchersData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus voucher", {
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
            <IconTicket className="w-7 h-7 text-amber-400" />
            Voucher & Promo Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Buat dan kelola voucher diskon. Pisahkan antara promo publik toko dengan voucher khusus feed media sosial.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchVouchersData()}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/70 text-sm font-medium transition-all"
            title="Refresh Data"
          >
            <IconRotate className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={() => {
              setCreateModalOpen(true);
              handleRandomizeCode();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <IconPlus className="w-4 h-4" />
            Generate Voucher Baru
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconTicket className="w-16 h-16 text-amber-400" />
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <IconTicket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Vouchers
              </p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconWorld className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <IconWorld className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                🌐 Promo Publik (FE)
              </p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.totalPublic}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconBrandInstagram className="w-16 h-16 text-fuchsia-400" />
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
              <IconBrandInstagram className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                📱 Khusus Feed Sosmed
              </p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.totalPrivate}</p>
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
            placeholder="Cari kode atau judul voucher..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <IconFilter className="w-4 h-4" />
            <span>Tipe:</span>
          </div>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="all">Semua Visibilitas</option>
            <option value="public">🌐 Promo Publik Toko</option>
            <option value="private">📱 Khusus Feed Sosmed (Private)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Kode & Judul Voucher</th>
                <th className="px-6 py-4">Potongan</th>
                <th className="px-6 py-4">Visibilitas</th>
                <th className="px-6 py-4">Syarat & Limit</th>
                <th className="px-6 py-4">Masa Berlaku</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <IconRotate className="w-5 h-5 animate-spin text-amber-400" />
                      <span>Memuat data voucher...</span>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada voucher yang ditemukan. Klik &quot;Generate Voucher Baru&quot; untuk menambahkan.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const isExpired = new Date() > new Date(v.validUntil);

                  return (
                    <tr
                      key={v._id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 tracking-wider">
                              {v.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(v.code)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Salin Kode"
                            >
                              <IconCopy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{v.title}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.discountType === "percentage" ? (
                          <div>
                            <span className="text-base font-bold text-emerald-400">
                              {v.discountValue}% OFF
                            </span>
                            {v.maxDiscount && v.maxDiscount > 0 ? (
                              <p className="text-[11px] text-slate-500">
                                Maks. {formatRupiah(v.maxDiscount)}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-base font-bold text-emerald-400">
                            {formatRupiah(v.discountValue)}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.isPublic ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            <IconWorld className="w-3.5 h-3.5 text-cyan-400" />
                            Publik (FE Toko)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                            <IconBrandInstagram className="w-3.5 h-3.5 text-fuchsia-400" />
                            Khusus Sosmed Feed
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        <div>
                          <span>Min: {v.minPurchase > 0 ? formatRupiah(v.minPurchase) : "Rp 0"}</span>
                          <p className="text-[11px] text-slate-500">
                            Terpakai: {v.usedCount} / {v.usageLimit === 0 ? "∞" : v.usageLimit}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className={isExpired ? "text-red-400 font-semibold" : "text-slate-400"}>
                          {formatDate(v.validUntil)}
                        </span>
                        {isExpired && (
                          <span className="block text-[10px] text-red-500 font-bold uppercase">
                            Expired
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleActive(v)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            v.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300"
                          }`}
                        >
                          <IconPower className="w-3.5 h-3.5" />
                          {v.isActive ? "Aktif" : "Mati"}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setVoucherToDelete(v);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-slate-700"
                          title="Hapus Voucher"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Voucher Generator Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <IconTicket className="w-5 h-5 text-amber-400" />
                Generate Voucher Promo Baru
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Visibility Setting (CRITICAL USER REQUEST) */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <label className="text-xs font-bold text-white block">
                  Visibilitas & Jalur Promosi:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: true })}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formData.isPublic
                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <IconWorld className="w-4 h-4 text-cyan-400" /> 🌐 Publik (FE Toko)
                      </span>
                      {formData.isPublic && <IconCheck className="w-4 h-4 text-cyan-400" />}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Otomatis muncul di keranjang belanja pembeli untuk langsung dipakai.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: false })}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      !formData.isPublic
                        ? "bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-300"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <IconBrandInstagram className="w-4 h-4 text-fuchsia-400" /> 📱 Khusus Sosmed
                      </span>
                      {!formData.isPublic && <IconCheck className="w-4 h-4 text-fuchsia-400" />}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tidak tampil di web. Eksklusif untuk dibagikan di feed Instagram/TikTok!
                    </span>
                  </button>
                </div>
              </div>

              {/* Code & Randomizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Kode Voucher</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. CYBER20"
                      className="w-full uppercase font-mono px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold tracking-wider outline-none focus:border-amber-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleRandomizeCode}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                      title="Acak Kode"
                    >
                      <IconDice className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Judul / Deskripsi Promo</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Diskon 20% Akhir Pekan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Tipe Potongan</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
                  >
                    <option value="percentage">Persentase Diskon (%)</option>
                    <option value="fixed">Potongan Tetap (Nominal Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">
                    {formData.discountType === "percentage" ? "Nilai Diskon (%)" : "Nominal Potongan (Rp)"}
                  </label>
                  {formData.discountType === "percentage" ? (
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={formData.discountValue || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, discountValue: Number(e.target.value) })
                        }
                        min={1}
                        max={100}
                        placeholder="e.g. 20"
                        className="w-full pr-8 pl-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold outline-none focus:border-amber-500"
                        required
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-400 select-none">%</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-amber-400 select-none">Rp</span>
                      <input
                        type="text"
                        value={formatCurrencyInput(formData.discountValue)}
                        onChange={(e) =>
                          setFormData({ ...formData, discountValue: parseCurrencyInput(e.target.value) })
                        }
                        placeholder="e.g. 500.000"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">
                    Minimal Pembelian (Rp)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-amber-400 select-none">Rp</span>
                    <input
                      type="text"
                      value={formatCurrencyInput(formData.minPurchase)}
                      onChange={(e) =>
                        setFormData({ ...formData, minPurchase: parseCurrencyInput(e.target.value) })
                      }
                      placeholder="0 = Tanpa minimal"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">
                    Maks. Diskon (Rp, Opsional)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-amber-400 select-none">Rp</span>
                    <input
                      type="text"
                      value={formatCurrencyInput(formData.maxDiscount)}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: parseCurrencyInput(e.target.value) })
                      }
                      placeholder="0 = Tanpa batas maksimal"
                      disabled={formData.discountType === "fixed"}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium outline-none focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Quota & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">
                    Batas Kuota Pemakaian (Usage Limit)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: Number(e.target.value) })
                    }
                    placeholder="0 = Tidak terbatas"
                    min={0}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Berlaku Sampai</label>
                  <input
                    type="date"
                    value={typeof formData.validUntil === "string" ? formData.validUntil : ""}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Buat Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && voucherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <IconAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hapus Voucher?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Apakah Anda yakin ingin menghapus voucher{" "}
              <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                {voucherToDelete.code}
              </span>{" "}
              ({voucherToDelete.title})?
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Voucher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

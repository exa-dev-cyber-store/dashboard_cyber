import React, { useState, useEffect } from "react";
import {
  IconBell,
  IconTicket,
  IconSend,
  IconDeviceMobile,
  IconBrandApple,
  IconBrandAndroid,
  IconBrowser,
  IconSparkles,
  IconClock,
  IconUsers,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { axiosInstanceData } from "@/libs/axios";

interface Voucher {
  _id: string;
  code: string;
  discount: number;
  isActive: boolean;
  name?: string;
  expiresAt?: string;
}

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  user?: { name?: string; email?: string } | null;
  data?: {
    voucherCode?: string;
    discount?: number;
    link?: string;
    orderId?: string;
  };
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [previewPlatform, setPreviewPlatform] = useState<"ios" | "android" | "web">("ios");

  // Form State
  const [title, setTitle] = useState("🎉 Voucher Baru Tersedia: Diskon 25%!");
  const [body, setBody] = useState("Gunakan kode CYBER25 saat checkout untuk potongan harga belanja produk Apple idamanmu.");
  const [type, setType] = useState<"voucher" | "promo" | "delivery" | "announcement">("voucher");
  const [target, setTarget] = useState<"all" | "user">("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedVoucherCode, setSelectedVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number | undefined>(25);
  const [deepLink, setDeepLink] = useState("/shop");

  // Data State
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load active vouchers for selector
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axiosInstanceData.get("/api/vouchers");
        const list = res.data?.data?.vouchers || res.data?.vouchers || res.data?.data || [];
        if (Array.isArray(list)) {
          setVouchers(list);
        }
      } catch (err) {
        console.warn("Could not fetch vouchers list", err);
      }
    };
    fetchVouchers();
  }, []);

  // Load history when switching to history tab
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await axiosInstanceData.get("/api/notifications/broadcast-history");
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setHistory(list);
      }
    } catch (err) {
      console.warn("Could not fetch broadcast history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  // Preset Template Handler
  const applyPreset = (presetType: "voucher" | "flash" | "delivery" | "general") => {
    if (presetType === "voucher") {
      setType("voucher");
      setTitle("🎟️ Voucher Baru Spesial Menantimu!");
      setBody("Klaim voucher diskon sekarang juga sebelum masa promo berakhir. Berlaku di semua kategori!");
      setDeepLink("/shop");
    } else if (presetType === "flash") {
      setType("promo");
      setTitle("⚡ Cyber Apple Flash Sale Dimulai!");
      setBody("Dapatkan penawaran terbatas untuk iPhone, MacBook, dan iPad dengan cashback spesial hari ini saja!");
      setDeepLink("/shop");
    } else if (presetType === "delivery") {
      setType("delivery");
      setTitle("🚚 Pesanan Anda Sedang Dikirim!");
      setBody("Paket Anda telah diserahkan ke kurir dan sedang dalam perjalanan ke alamat tujuan Anda.");
      setDeepLink("/account/order");
    } else {
      setType("announcement");
      setTitle("📢 Pengumuman Toko Cyber Apple");
      setBody("Nikmati pengalaman berbelanja produk Apple resmi terbaru dengan fitur Sign in with Apple!");
      setDeepLink("/");
    }
  };

  // Handle Voucher Selection
  const handleVoucherSelect = (code: string) => {
    setSelectedVoucherCode(code);
    const found = vouchers.find((v) => v.code === code);
    if (found) {
      setDiscountAmount(found.discount);
      setTitle(`🎉 Voucher Baru: Potongan ${found.discount}% [${found.code}]`);
      setBody(`Gunakan kode promo ${found.code} untuk mendapatkan diskon ${found.discount}% belanja produk Apple favoritmu.`);
      setType("voucher");
      setDeepLink("/shop");
    }
  };

  // Dispatch Broadcast
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Judul dan pesan notifikasi wajib diisi", { theme: "dark" });
      return;
    }

    setIsSending(true);
    try {
      await axiosInstanceData.post("/api/notifications/broadcast", {
        title,
        body,
        type,
        target,
        userId: target === "user" ? targetUserId : undefined,
        voucherCode: selectedVoucherCode || undefined,
        discount: discountAmount,
        link: deepLink,
      });

      toast.success("🚀 Push Notification berhasil dikirim ke perangkat!", {
        theme: "dark",
        position: "top-right",
      });

      if (activeTab === "history") {
        fetchHistory();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim push notification";
      toast.error(msg, { theme: "dark" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-neutral-100">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#101422] via-[#0b0e17] to-[#07090e] border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Push Notification Service Online
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <IconBell className="w-6 h-6" />
              </span>
              Push Notifications & Broadcast
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Kirim notifikasi push instan ke seluruh pengguna aplikasi Web dan Mobile (iPhone & Android). Cocok untuk broadcast voucher baru, flash sale, dan pembaruan pesanan.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900/80 p-1.5 rounded-2xl border border-neutral-800 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "compose"
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Compose Broadcast
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Broadcast Logs
            </button>
          </div>
        </div>
      </div>

      {activeTab === "compose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Broadcast Composer */}
          <div className="lg:col-span-7 bg-[#0d101a] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <IconSparkles className="w-5 h-5 text-amber-400" />
                Buat Notifikasi Kustom
              </h2>
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                Multi-Platform Push
              </span>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">
                Template Cepat
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("voucher")}
                  className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-left transition-all text-xs group"
                >
                  <span className="text-amber-400 font-bold block group-hover:scale-105 transition-transform">
                    🎟️ Voucher Baru
                  </span>
                  <span className="text-[10px] text-neutral-500">Klaim promo voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("flash")}
                  className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-rose-500/40 text-left transition-all text-xs group"
                >
                  <span className="text-rose-400 font-bold block group-hover:scale-105 transition-transform">
                    ⚡ Flash Sale
                  </span>
                  <span className="text-[10px] text-neutral-500">Penawaran kilat</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("delivery")}
                  className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/40 text-left transition-all text-xs group"
                >
                  <span className="text-cyan-400 font-bold block group-hover:scale-105 transition-transform">
                    🚚 Pengiriman
                  </span>
                  <span className="text-[10px] text-neutral-500">Status paket pesanan</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("general")}
                  className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 text-left transition-all text-xs group"
                >
                  <span className="text-purple-400 font-bold block group-hover:scale-105 transition-transform">
                    📢 Pengumuman
                  </span>
                  <span className="text-[10px] text-neutral-500">Info sistem toko</span>
                </button>
              </div>
            </div>

            {/* Voucher Picker Integration */}
            {vouchers.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <IconTicket className="w-4 h-4" /> Pilih Voucher Aktif untuk Diiklankan:
                  </label>
                  <span className="text-[10px] text-neutral-400">Otomatis mengisi teks</span>
                </div>
                <select
                  value={selectedVoucherCode}
                  onChange={(e) => handleVoucherSelect(e.target.value)}
                  className="w-full bg-[#111420] border border-amber-500/30 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400"
                >
                  <option value="">-- Pilih Voucher dari Database --</option>
                  {vouchers.map((v) => (
                    <option key={v._id} value={v.code}>
                      Kode: {v.code} (Diskon {v.discount}%) {v.isActive ? "🟢 Aktif" : "⚪ Nonaktif"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              {/* Target Audience */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">
                  Target Penerima Notifikasi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTarget("all")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      target === "all"
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <IconUsers className="w-4 h-4" />
                    Semua Pengguna (Broadcast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget("user")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      target === "user"
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <IconAlertCircle className="w-4 h-4" />
                    Pengguna Tertentu (Spesifik)
                  </button>
                </div>
                {target === "user" && (
                  <input
                    type="text"
                    placeholder="Masukkan ID User (MongoDB ObjectId)"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full mt-2 bg-[#111420] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-400"
                    required
                  />
                )}
              </div>

              {/* Title */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Judul Notifikasi
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {title.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={70}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: 🎉 Voucher Spesial Siap Digunakan!"
                  required
                  className="w-full bg-[#111420] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-400"
                />
              </div>

              {/* Message Body */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Isi Pesan Notifikasi
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {body.length}/150
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={180}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Tuliskan pesan promosi atau pemberitahuan di sini..."
                  required
                  className="w-full bg-[#111420] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Deep Link URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Action Link / Deep Link URL
                </label>
                <input
                  type="text"
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  placeholder="/shop atau /account/order"
                  className="w-full bg-[#111420] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Send Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <IconRefresh className="w-4 h-4 animate-spin" /> Mengirim Notifikasi ke Semua Perangkat...
                    </>
                  ) : (
                    <>
                      <IconSend className="w-4 h-4" /> Kirim Push Notification Sekarang
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Interactive Device Mockup */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                <IconDeviceMobile className="w-4 h-4 text-cyan-400" />
                Live Device Preview
              </span>

              {/* Platform Switcher */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setPreviewPlatform("ios")}
                  className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                    previewPlatform === "ios"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-neutral-500 hover:text-white"
                  }`}
                  title="Apple iOS"
                >
                  <IconBrandApple className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewPlatform("android")}
                  className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                    previewPlatform === "android"
                      ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                      : "text-neutral-500 hover:text-white"
                  }`}
                  title="Android"
                >
                  <IconBrandAndroid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewPlatform("web")}
                  className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                    previewPlatform === "web"
                      ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                      : "text-neutral-500 hover:text-white"
                  }`}
                  title="Web Browser"
                >
                  <IconBrowser className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mockup Container */}
            <div className="bg-[#0b0d14] border border-neutral-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[380px]">
              {previewPlatform === "ios" && (
                <div className="w-full max-w-xs space-y-4 animate-fadeIn">
                  {/* iOS Dynamic Island */}
                  <div className="w-28 h-6 bg-black rounded-full mx-auto flex items-center justify-between px-2.5 border border-neutral-800">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[9px] text-cyan-400 font-bold">CYBER</span>
                  </div>

                  {/* iOS Lock Screen Notification Banner */}
                  <div className="w-full bg-white/15 backdrop-blur-2xl rounded-2xl p-3.5 border border-white/20 text-white shadow-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-black flex items-center justify-center p-0.5">
                          <IconBrandApple className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[11px] font-semibold tracking-tight text-white/90">
                          CYBER APPLE
                        </span>
                      </div>
                      <span className="text-[10px] text-white/60">Now</span>
                    </div>

                    <p className="text-xs font-bold text-white leading-tight">
                      {title || "Judul Notifikasi"}
                    </p>
                    <p className="text-[11px] text-white/80 leading-snug line-clamp-2">
                      {body || "Isi pesan notifikasi akan tampil di sini..."}
                    </p>
                  </div>

                  <p className="text-center text-[10px] text-neutral-500">
                    Tampilan pada Apple iPhone (iOS Lock Screen & Banner)
                  </p>
                </div>
              )}

              {previewPlatform === "android" && (
                <div className="w-full max-w-xs space-y-3 animate-fadeIn">
                  <div className="w-full bg-[#1c2233] rounded-xl p-3.5 border border-neutral-700 text-white shadow-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center text-black font-black text-[8px]">
                          C
                        </div>
                        <span className="text-[11px] text-cyan-400 font-medium">Cyber Store • Just now</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {title || "Judul Notifikasi"}
                    </p>
                    <p className="text-[11px] text-neutral-300 leading-snug">
                      {body || "Isi pesan notifikasi Android..."}
                    </p>
                  </div>
                  <p className="text-center text-[10px] text-neutral-500">
                    Tampilan pada Android Notification Shade
                  </p>
                </div>
              )}

              {previewPlatform === "web" && (
                <div className="w-full max-w-xs space-y-3 animate-fadeIn">
                  <div className="w-full bg-[#141824] rounded-2xl p-4 border border-cyan-500/30 text-white shadow-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <IconBell className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white">Cyber Apple Store</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">eka-dev.cloud</span>
                    </div>
                    <p className="text-xs font-semibold text-cyan-300">
                      {title || "Judul Notifikasi"}
                    </p>
                    <p className="text-[11px] text-neutral-300 leading-snug">
                      {body || "Pesan push notification desktop / web browser..."}
                    </p>
                  </div>
                  <p className="text-center text-[10px] text-neutral-500">
                    Tampilan pada Web Browser (Chrome / Safari Web Push)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History & Logs Tab */
        <div className="bg-[#0d101a] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <IconClock className="w-5 h-5 text-cyan-400" />
                Riwayat Pengiriman Notifikasi
              </h2>
              <p className="text-xs text-neutral-400">
                Log notifikasi yang pernah dikirim ke pelanggan
              </p>
            </div>
            <button
              onClick={fetchHistory}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
            >
              <IconRefresh className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              Memuat riwayat pengiriman notifikasi...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              Belum ada riwayat notifikasi yang tersimpan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Judul & Pesan</th>
                    <th className="py-3 px-4">Target</th>
                    <th className="py-3 px-4">Waktu Dikirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {history.map((item) => (
                    <tr key={item._id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            item.type === "voucher"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : item.type === "delivery"
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                          }`}
                        >
                          {item.type === "voucher" && "🎟️ Voucher"}
                          {item.type === "delivery" && "🚚 Delivery"}
                          {item.type === "promo" && "⚡ Promo"}
                          {item.type !== "voucher" && item.type !== "delivery" && item.type !== "promo" && "📢 Info"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <p className="font-bold text-white truncate">{item.title}</p>
                        <p className="text-neutral-400 text-[11px] truncate">{item.body}</p>
                        {item.data?.voucherCode && (
                          <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Code: {item.data.voucherCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-300">
                        {item.user ? (
                          <span className="text-cyan-400 font-mono text-[11px]">
                            User: {item.user?.name || item.user?.email || "ID"}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px] font-semibold">
                            🌐 All Users (Broadcast)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 text-[11px]">
                        {new Date(item.createdAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

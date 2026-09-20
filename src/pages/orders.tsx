import Pagination from "@/components/pagination";
import useUpdateOrders from "@/components/useUpdateOrders";
import useFetchOrders from "@/hooks/useFetchOrders";
import formatDate from "@/libs/formatDate";
import { formatRupiah } from "@/libs/formatRupiah";
import { Order } from "@/types";
import { TableSkeleton } from "@/components/ui/Skeleton";
import OrderDetailModal from "@/components/OrderDetailModal";
import {
  IconX,
  IconNotes,
  IconTruckDelivery,
  IconCheck,
  IconClock,
  IconRotate,
  IconCreditCard,
  IconBell,
  IconEye,
} from "@tabler/icons-react";
import { useFormik } from "formik";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const deliveryStatuses = [
  { value: "pending", label: "Pending", desc: "Order packed & awaiting pickup", color: "amber" },
  { value: "process", label: "In Transit / Process", desc: "Handed over to courier", color: "cyan" },
  { value: "delivered", label: "Delivered", desc: "Successfully received by customer", color: "emerald" },
];

export default function Orders() {
  const notify = () =>
    toast.error("Failed to load orders. Please check your connection.", {
      position: "bottom-right",
      autoClose: 2500,
      theme: "dark",
    });

  const [openModal, setOpenModal] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [onSelect, setOnSelect] = useState<{ id: string; status: string }>({
    id: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useFetchOrders({
    onError: () => notify(),
    currentPage,
  });

  const { mutate, isPending: isUpdating } = useUpdateOrders({
    onError: () =>
      toast.error("Failed to update delivery status.", {
        position: "bottom-right",
        theme: "dark",
      }),
    onSuccess: () => {
      toast.success("Delivery status updated successfully.", {
        position: "bottom-right",
        theme: "dark",
      });
      setOpenModal(false);
      refetch();
    },
    refetch,
    setOpenModal,
  });

  const formik = useFormik({
    initialValues: {
      delivery_status: onSelect.status,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (values.delivery_status === onSelect.status) {
        toast.info("No changes detected in delivery status.", {
          position: "bottom-right",
          theme: "dark",
        });
        return;
      }
      mutate({ delivery_status: values.delivery_status, id: onSelect.id });
    },
  });

  const changePage = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    refetch();
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <IconCheck className="w-3 h-3" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
            <IconClock className="w-3 h-3" /> Unpaid
          </span>
        );
      case "expire":
      case "expired":
      case "cancel":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold">
            <IconX className="w-3 h-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 text-[11px] font-medium">
            {status || "N/A"}
          </span>
        );
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <IconCheck className="w-3 h-3" /> Delivered
          </span>
        );
      case "process":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-semibold">
            <IconRotate className="w-3 h-3 animate-spin" /> In Transit
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
            <IconClock className="w-3 h-3" /> Pending Dispatch
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Update Delivery Status Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#11141e] border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <IconTruckDelivery className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Update Delivery Status
                </h3>
                <p className="text-xs text-neutral-400">
                  Order ID: <span className="font-mono text-cyan-400">{onSelect.id}</span>
                </p>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2.5">
                {deliveryStatuses.map((opt) => {
                  const isSelected = formik.values.delivery_status === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]"
                          : "bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery_status"
                          value={opt.value}
                          checked={isSelected}
                          onChange={formik.handleChange}
                          className="w-4 h-4 text-cyan-500 bg-neutral-900 border-neutral-700 focus:ring-cyan-500"
                        />
                        <div>
                          <p className={`text-xs font-semibold ${isSelected ? "text-cyan-300" : "text-white"}`}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-neutral-400">{opt.desc}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Automatic Push Notification Alert */}
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5">
                <IconBell className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-cyan-200 leading-relaxed">
                  <strong>Push Notification Otomatis:</strong> Perubahan status pengiriman ini akan otomatis dikirimkan secara instan ke perangkat Web dan Mobile (iPhone & Android) pelanggan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 border border-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Status"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#10131c]/90 border border-neutral-800/90 backdrop-blur-xl">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <IconNotes className="w-5 h-5 text-cyan-400" />
            Order Fulfillment Ledger
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitor real-time payments, shipping dispatch, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-neutral-200 hover:bg-white/10 transition-colors"
          >
            <IconRotate className="w-3.5 h-3.5 text-cyan-400" />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <TableSkeleton cols={7} rows={6} />
      ) : !data || data.orders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#10131c]/90 border border-neutral-800/80 p-8">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <IconNotes className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">
            No Orders Recorded
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Transactions will appear here automatically once customers checkout from the store.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#10131c]/90 border border-neutral-800/90 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 bg-neutral-900/60 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Delivery</th>
                  <th className="py-3.5 px-4">Channel</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50 text-xs">
                {data.orders.map((order: Order, index: number) => (
                  <tr
                    key={order._id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-4 text-center text-neutral-400 font-mono text-[11px]">
                      {(currentPage - 1) * 12 + index + 1}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForDetail(order);
                          setOpenDetailModal(true);
                        }}
                        className="font-mono text-xs font-semibold text-neutral-100 hover:text-cyan-300 text-left transition-colors flex items-center gap-1.5 group/btn"
                        title="Click to view full order details"
                      >
                        <span>{order._id}</span>
                        <IconEye className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 text-cyan-400 transition-opacity" />
                      </button>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {formatDate(order.updatedAt || order.createdAt)}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      {getPaymentBadge(order.status_payment)}
                    </td>

                    <td className="py-4 px-4">
                      {getDeliveryBadge(order.status_delivery)}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                        <IconCreditCard className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="uppercase text-[11px]">
                          {order.payment_method || "Midtrans"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {formatRupiah(order.total)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForDetail(order);
                            setOpenDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-neutral-700/60 text-xs font-medium transition-all shadow-sm"
                          title="View complete order and invoice details"
                        >
                          <IconEye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Detail</span>
                        </button>

                        {order.status_payment === "completed" &&
                        order.status_delivery !== "delivered" &&
                        order.status_delivery !== "cancelled" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setOnSelect({
                                id: order._id,
                                status: order.status_delivery,
                              });
                              setOpenModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shadow-sm"
                            title="Update shipping delivery status"
                          >
                            <IconTruckDelivery className="w-3.5 h-3.5" />
                            <span>Update</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-500 px-1 italic">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">
              Showing page{" "}
              <strong className="text-white">{currentPage}</strong> of{" "}
              <strong className="text-white">{data.page}</strong> &bull; Total{" "}
              <strong className="text-white">{data.count}</strong> orders
            </span>

            <Pagination
              total={data.page}
              currentPage={currentPage}
              setCurrentPage={changePage}
            />
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        isOpen={openDetailModal}
        onClose={() => {
          setOpenDetailModal(false);
          setSelectedOrderForDetail(null);
        }}
        onOpenUpdateDelivery={(ord) => {
          setOnSelect({
            id: ord._id,
            status: ord.status_delivery,
          });
          setOpenModal(true);
        }}
      />

      <ToastContainer theme="dark" />
    </div>
  );
}
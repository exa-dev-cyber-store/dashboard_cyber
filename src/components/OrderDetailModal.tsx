import { useState } from "react";
import { Order } from "@/types";
import formatDate from "@/libs/formatDate";
import { formatRupiah } from "@/libs/formatRupiah";
import {
  IconX,
  IconCheck,
  IconClock,
  IconRotate,
  IconTruckDelivery,
  IconCreditCard,
  IconUser,
  IconMapPin,
  IconPackage,
  IconCopy,
  IconPrinter,
  IconExternalLink,
  IconFileInvoice,
} from "@tabler/icons-react";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateDelivery?: (order: Order) => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onOpenUpdateDelivery,
}: OrderDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  const handleCopyId = () => {
    if (!order?._id) return;
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProductImage = (item: any) => {
    const rawImage =
      typeof item._id === "object" ? item._id?.image_thumbnail : null;
    if (!rawImage) return null;
    if (rawImage.startsWith("http")) return rawImage;
    return `${backendUrl}/${rawImage.startsWith("/") ? rawImage.slice(1) : rawImage}`;
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <IconCheck className="w-3.5 h-3.5" /> Paid & Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <IconClock className="w-3.5 h-3.5" /> Pending Payment
          </span>
        );
      case "expire":
      case "expired":
      case "cancel":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
            <IconX className="w-3.5 h-3.5" /> Expired / Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-medium">
            {status || "N/A"}
          </span>
        );
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <IconCheck className="w-3.5 h-3.5" /> Delivered to Customer
          </span>
        );
      case "process":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
            <IconRotate className="w-3.5 h-3.5 animate-spin" /> In Transit / Shipping
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <IconClock className="w-3.5 h-3.5" /> Pending Dispatch
          </span>
        );
    }
  };

  const customerName =
    typeof order.user === "object" && order.user?.name
      ? order.user.name
      : order.delivery_address?.name || "Customer";

  const customerEmail =
    typeof order.user === "object" && order.user?.email
      ? order.user.email
      : null;

  const customerAvatar =
    typeof order.user === "object" && order.user?.avatar
      ? order.user.avatar.startsWith("http")
        ? order.user.avatar
        : `${backendUrl}/${order.user.avatar}`
      : null;

  const itemsSubtotal = (order.order_items || []).reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0e111a] border border-neutral-800 shadow-2xl my-8 overflow-hidden print:border-none print:shadow-none print:my-0 print:bg-white print:text-black">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-800/80 bg-[#121623]/80 backdrop-blur-md print:bg-white print:border-b-2">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 shadow-sm print:hidden">
              <IconFileInvoice className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white print:text-black">
                  Order Invoice & Detail
                </h2>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy Order ID"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <IconCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="w-3 h-3 text-neutral-400" />
                      <span>{order._id}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 print:text-neutral-600">
                Created on {formatDate(order.createdAt)} &bull; Last updated {formatDate(order.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              title="Print Order Receipt"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-neutral-700 transition-colors"
            >
              <IconPrinter className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-neutral-700 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-130px)] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Status Bar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Payment Status Card */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Payment Status
              </span>
              <div className="flex items-center justify-between gap-2">
                {getPaymentBadge(order.status_payment)}
                <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
                  <IconCreditCard className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase text-[11px]">
                    {order.payment_method || "Midtrans"}
                  </span>
                </div>
              </div>
              {order.status_payment !== "completed" && order.url_redirect && (
                <div className="pt-1">
                  <a
                    href={order.url_redirect}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                  >
                    <span>Customer Payment Portal</span>
                    <IconExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Delivery Status Card */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Fulfillment Status
                </span>
                {order.status_payment === "completed" &&
                  order.status_delivery !== "delivered" &&
                  order.status_delivery !== "cancelled" &&
                  onOpenUpdateDelivery && (
                    <button
                      type="button"
                      onClick={() => onOpenUpdateDelivery(order)}
                      className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 print:hidden"
                    >
                      <IconTruckDelivery className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </button>
                  )}
              </div>
              <div>{getDeliveryBadge(order.status_delivery)}</div>
            </div>
          </div>

          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/70 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <IconUser className="w-4 h-4 text-cyan-400" />
                <span>Customer Information</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center font-bold text-sm uppercase overflow-hidden flex-shrink-0">
                  {customerAvatar ? (
                    <img
                      src={customerAvatar}
                      alt={customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    customerName.charAt(0)
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-white">{customerName}</p>
                  {customerEmail && (
                    <p className="text-xs text-neutral-400">{customerEmail}</p>
                  )}
                  {typeof order.user === "object" && order.user?._id && (
                    <p className="text-[10px] text-neutral-500 font-mono">
                      User ID: {order.user._id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/70 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <IconMapPin className="w-4 h-4 text-cyan-400" />
                <span>Delivery Address</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-white">
                  Recipient: {order.delivery_address?.name || customerName}
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  {order.delivery_address?.detail || "No address detail provided"}
                </p>
                <p className="text-neutral-400 text-[11px]">
                  {[
                    order.delivery_address?.kelurahan,
                    order.delivery_address?.kecamatan,
                    order.delivery_address?.kabupaten,
                    order.delivery_address?.provinsi,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <IconPackage className="w-4 h-4 text-cyan-400" />
                <span>Ordered Products ({order.order_items?.length || 0})</span>
              </h3>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800/80 bg-neutral-900/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4 text-center">Unit Price</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {order.order_items && order.order_items.length > 0 ? (
                      order.order_items.map((item, idx) => {
                        const img = getProductImage(item);
                        const lineTotal = (item.price || 0) * (item.quantity || 1);
                        return (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700/60 overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <IconPackage className="w-5 h-5 text-neutral-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-white">
                                    {item.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-neutral-300">
                              {formatRupiah(item.price)}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-white">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-white">
                              {formatRupiah(lineTotal)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-neutral-500 italic"
                        >
                          No items listed for this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Summary */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4 sm:p-5 space-y-2.5">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Items Subtotal</span>
              <span className="font-mono text-neutral-200 font-medium">
                {formatRupiah(itemsSubtotal || order.total - (order.shipping || 0) - (order.tax || 0) + (order.discount || 0))}
              </span>
            </div>

            {order.shipping !== undefined && order.shipping > 0 && (
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Shipping Cost</span>
                <span className="font-mono text-neutral-200 font-medium">
                  {formatRupiah(order.shipping)}
                </span>
              </div>
            )}

            {order.tax !== undefined && order.tax > 0 && (
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Tax (PPN)</span>
                <span className="font-mono text-neutral-200 font-medium">
                  {formatRupiah(order.tax)}
                </span>
              </div>
            )}

            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400 font-medium">
                <span>Voucher / Discount Applied</span>
                <span className="font-mono">
                  -{formatRupiah(order.discount)}
                </span>
              </div>
            )}

            <div className="border-t border-neutral-800 pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-white">Total Amount</span>
                <p className="text-[10px] text-neutral-400">
                  {order.status_payment === "completed" ? "Paid in full" : "Payment outstanding"}
                </p>
              </div>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-cyan-400">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800/80 bg-[#121623]/80 backdrop-blur-md flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
            >
              <IconPrinter className="w-4 h-4 text-neutral-400" />
              <span>Print Invoice</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {order.status_payment === "completed" &&
              order.status_delivery !== "delivered" &&
              order.status_delivery !== "cancelled" &&
              onOpenUpdateDelivery && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpdateDelivery(order);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <IconTruckDelivery className="w-4 h-4" />
                  <span>Update Delivery</span>
                </button>
              )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 border border-neutral-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

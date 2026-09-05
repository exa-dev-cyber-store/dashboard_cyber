import {
  IconNotes,
  IconBuildingStore,
  IconMoneybag,
  IconUser,
  IconTrendingUp,
  IconActivity,
} from "@tabler/icons-react";
import CardDashboard from "../components/cardDashboard";
import ChartSales from "@/components/chartSales";
import useFetchDataDashboard from "@/hooks/useFetchDataDashboard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatRupiah } from "@/libs/formatRupiah";
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

export default function Home() {
  const notify = () =>
    toast.error("Unable to load dashboard data. Please verify your connection.", {
      position: "bottom-right",
      autoClose: 3000,
      theme: "dark",
    });

  const { data, isLoading } = useFetchDataDashboard({ onError: () => notify() });

  const listCardTop = data
    ? [
        {
          title: "Total Revenue",
          subtitle: "Gross settled earnings",
          value: formatRupiah(data.resultTotal),
          icon: <IconMoneybag className="w-5 h-5" />,
          accent: "cyan" as const,
        },
        {
          title: "Completed Orders",
          subtitle: "Paid & verified",
          value: data.totalOrders,
          icon: <IconNotes className="w-5 h-5" />,
          accent: "emerald" as const,
        },
        {
          title: "Products in Catalog",
          subtitle: "Active stock items",
          value: data.totalProducts,
          icon: <IconBuildingStore className="w-5 h-5" />,
          accent: "indigo" as const,
        },
        {
          title: "Registered Users",
          subtitle: "Customer accounts",
          value: data.totalUsers,
          icon: <IconUser className="w-5 h-5" />,
          accent: "amber" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Store Performance
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Synced
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time analytics and revenue metrics across Cyber Store operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400">
            <IconActivity className="w-4 h-4 text-cyan-400" />
            <span>Cycle: Current Year</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <StatCardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {listCardTop.map((item, index) => (
            <CardDashboard
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              value={item.value}
              icon={item.icon}
              accent={item.accent}
            />
          ))}
        </div>
      )}

      {/* Revenue Chart Section */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="rounded-2xl bg-[#10131c]/90 border border-neutral-800/90 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <IconTrendingUp className="w-5 h-5 text-cyan-400" />
                Annual Sales & Revenue Trajectory
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Monthly breakdown of settled transactions for the current calendar year.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Revenue (IDR)</span>
              </div>
            </div>
          </div>

          {data && <ChartSales value={data.dataChart} />}
        </div>
      )}

      <ToastContainer theme="dark" />
    </div>
  );
}
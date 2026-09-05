import { formatRupiah } from "@/libs/formatRupiah";
import { Chart } from "@/types";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartSalesProps {
  value: Chart[];
}

export default function ChartSales({ value }: ChartSalesProps) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const data = (value || []).map((item, index) => {
    return {
      name: monthNames[index] || `M${index + 1}`,
      total: item.total || 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-[#0c0e16]/95 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
          <p className="text-[11px] font-semibold text-neutral-400 mb-1">
            Month of {label}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-sm font-bold text-white">
              {formatRupiah(payload[0].value)}
            </span>
          </div>
          <span className="text-[10px] text-neutral-300 mt-1 block">
            Settled orders revenue
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="cyberRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#1c2233"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#1c2233" }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) =>
              val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#06b6d4"
            strokeWidth={3}
            fill="url(#cyberRevenue)"
            activeDot={{
              r: 6,
              fill: "#06b6d4",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
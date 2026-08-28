"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DailyStat } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart({ data }: { data: DailyStat[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C2700E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#C2700E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E3DE" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6E6558" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#6E6558" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `৳${Math.round(v / 1000)}k`}
            width={44}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E6E3DE",
              fontSize: 13,
              boxShadow: "0 12px 32px -8px rgba(23,19,15,0.18)",
            }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#C2700E" strokeWidth={2.5} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

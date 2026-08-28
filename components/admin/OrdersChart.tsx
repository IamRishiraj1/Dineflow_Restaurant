"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DailyStat } from "@/types";

export function OrdersChart({ data }: { data: DailyStat[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E3DE" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6E6558" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6E6558" }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            formatter={(value: number) => [`${value}`, "Orders"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E6E3DE",
              fontSize: 13,
              boxShadow: "0 12px 32px -8px rgba(23,19,15,0.18)",
            }}
          />
          <Bar dataKey="orders" fill="#17130F" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthlyPoint = {
  month: string;
  total: number;
};

export default function PaymentHistoryChart({
  data,
  currency,
}: {
  data: MonthlyPoint[];
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-[#6B7280] dark:text-white/50">
        Aucun paiement enregistré pour l&apos;instant.
      </div>
    );
  }

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/10" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => v.toLocaleString("fr-FR")}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,196,204,0.08)" }}
            formatter={(value: number) => [`${value.toLocaleString("fr-FR")} ${currency}`, "Encaissé"]}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 10px 30px -15px rgba(14,19,24,0.25)",
              fontSize: 13,
            }}
          />
          <Bar dataKey="total" fill="#00C4CC" radius={[8, 8, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

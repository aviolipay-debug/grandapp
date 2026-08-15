"use client";

import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlyPoint = {
  month: string;
  total: number;
};

// Point personnalisé : petits cercles évidés sur l'historique, dernier point
// plein et plus large pour marquer le mois en cours — comme la référence.
function renderDot(props: any) {
  const { cx, cy, index, dataLength } = props;
  const isLast = index === dataLength - 1;
  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={isLast ? 6 : 4}
      fill={isLast ? "#2A89DA" : "#FFFFFF"}
      stroke="#2A89DA"
      strokeWidth={2}
    />
  );
}

export default function PaymentHistoryChart({
  data,
  currency,
  currentMonthTotal,
  periodTotal,
}: {
  data: MonthlyPoint[];
  currency: string;
  currentMonthTotal: number;
  periodTotal: number;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-[#262626] sm:p-6">
      {/* En-tête : icône + titre à gauche, période à droite */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2A89DA] dark:bg-white/10">
            <BarChart3 size={18} />
          </div>
          <h2 className="font-display text-lg font-bold leading-snug text-ink dark:text-white sm:text-xl">
            Historique des
            <br />
            paiements
          </h2>
        </div>
        <p className="shrink-0 whitespace-nowrap text-right text-sm text-[#9CA3AF]">
          6 derniers
          <br />
          mois
        </p>
      </div>

      <div className="mt-4 h-px bg-black/5 dark:bg-white/10" />

      {/* Résumé */}
      <p className="mt-4 text-sm text-[#9CA3AF]">
        Ce mois{" "}
        <span className="text-base font-bold text-ink dark:text-white">
          {currentMonthTotal.toLocaleString("fr-FR")} {currency}
        </span>{" "}
        <span className="text-[#D1D5DB]">/</span> Total{" "}
        <span className="text-base font-bold text-ink dark:text-white">
          {periodTotal.toLocaleString("fr-FR")} {currency}
        </span>
      </p>

      {/* Graphique */}
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-center text-sm text-[#6B7280] dark:text-white/50 sm:h-56">
          Aucun paiement enregistré pour l&apos;instant.
        </div>
      ) : (
        <div className="mt-4 h-48 w-full sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 8 }}>
              <defs>
                <linearGradient id="paymentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2A89DA" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2A89DA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                className="stroke-black/10 dark:stroke-white/10"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                angle={-25}
                textAnchor="end"
                height={40}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v: number) => `${v.toLocaleString("fr-FR")} ${currency}`}
              />
              <Tooltip
                cursor={{ stroke: "#2A89DA", strokeWidth: 1, strokeDasharray: "4 4" }}
                formatter={(value: number) => [`${value.toLocaleString("fr-FR")} ${currency}`, "Encaissé"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 10px 30px -15px rgba(14,19,24,0.25)",
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#2A89DA"
                strokeWidth={2.5}
                fill="url(#paymentFill)"
                dot={(props: any) => renderDot({ ...props, dataLength: data.length })}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Stats {
  totalOrders: number;
  pendingPayment: number;
  revenue: number;
  views: { date: string; views: number }[];
}

const PAID_STATUSES = ["paid", "processing", "shipped", "completed"];

export default function AdminStatsTab() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 14 * 86400000)
        .toISOString()
        .slice(0, 10);
      const [{ count: totalOrders }, { count: pendingPayment }, paidRes, viewsRes] =
        await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending_payment"),
          supabase.from("orders").select("total_eur").in("status", PAID_STATUSES),
          supabase
            .from("page_views")
            .select("*")
            .gte("date", since)
            .order("date", { ascending: false }),
        ]);

      setStats({
        totalOrders: totalOrders ?? 0,
        pendingPayment: pendingPayment ?? 0,
        revenue: (paidRes.data ?? []).reduce(
          (sum, o) => sum + Number(o.total_eur),
          0
        ),
        views: viewsRes.data ?? [],
      });
    })();
  }, []);

  if (!stats) return <p>Loading…</p>;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--ink-600)]">Total orders</p>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="rounded border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--ink-600)]">Awaiting payment</p>
          <p className="text-2xl font-bold">{stats.pendingPayment}</p>
        </div>
        <div className="rounded border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--ink-600)]">Revenue (paid)</p>
          <p className="text-2xl font-bold">{stats.revenue.toFixed(2)} €</p>
        </div>
      </div>

      <h3 className="mb-2 font-semibold">Visits — last 14 days</h3>
      <table className="text-sm">
        <tbody>
          {stats.views.map((v) => (
            <tr key={v.date} className="border-b border-[var(--border)]">
              <td className="p-2 pe-6">{v.date}</td>
              <td className="p-2 font-mono">{v.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

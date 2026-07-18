"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { formatEur } from "@/lib/pricing";
import type { Order } from "@/types";
import type { Locale } from "@/i18n/routing";

export default function OrdersPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {loaded && orders.length === 0 && (
        <p className="text-[var(--ink-600)]">{t("empty")}</p>
      )}

      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded border border-[var(--border)] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {o.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="rounded bg-[var(--surface)] px-2 py-1 text-sm">
                {t(`status.${o.status}`)}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-600)]">
              {new Date(o.created_at).toLocaleDateString(locale)} —{" "}
              {formatEur(o.total_eur, locale)}
            </p>
            {o.status === "pending_payment" && o.bank_transfer_reference && (
              <p className="mt-1 font-mono text-sm">
                Ref: {o.bank_transfer_reference}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

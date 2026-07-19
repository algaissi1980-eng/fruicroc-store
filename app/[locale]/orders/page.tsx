"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/weights";
import type { Order } from "@/types";
import type { Locale } from "@/i18n/routing";

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "bg-[var(--accent-soft)] text-[var(--accent-ink-2)]",
  paid: "bg-[var(--success-soft)] text-[var(--success)]",
  processing: "bg-[var(--surface-2)] text-[var(--chip-ink)]",
  shipped: "bg-[var(--surface-2)] text-[var(--chip-ink)]",
  completed: "bg-[var(--success-soft)] text-[var(--success)]",
  cancelled: "bg-[#F8E4E2] text-[var(--error)]",
};

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
    <div className="mx-auto max-w-2xl px-5 py-7">
      <h1 className="m-0 mb-6 text-[27px] font-extrabold text-[var(--ink)]">
        {t("title")}
      </h1>

      {loaded && orders.length === 0 && (
        <p className="text-[var(--muted)]">{t("empty")}</p>
      )}

      <ul className="m-0 list-none space-y-4 p-0">
        {orders.map((o) => (
          <li
            key={o.id}
            className="rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-[var(--muted)]">
                {o.id.slice(0, 8).toUpperCase()}
              </span>
              <span
                className={`badge ${STATUS_STYLE[o.status] ?? "bg-[var(--surface-2)]"}`}
              >
                {t(`status.${o.status}`)}
              </span>
            </div>
            <p className="m-0 mt-2 text-sm text-[var(--muted)]">
              {new Date(o.created_at).toLocaleDateString(locale)} ·{" "}
              <span className="font-display text-base font-extrabold text-[var(--primary)]">
                {formatPrice(o.total_eur, locale)}
              </span>
            </p>
            {o.status === "pending_payment" && o.bank_transfer_reference && (
              <p className="m-0 mt-1 font-mono text-sm text-[var(--body)]">
                Ref: {o.bank_transfer_reference}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

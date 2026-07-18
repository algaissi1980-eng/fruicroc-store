"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("pending_payment");

  const load = useCallback(async () => {
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setOrders((data as Order[]) ?? []);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const markPaid = async (id: string) => {
    const { error } = await supabase.rpc("mark_order_paid", { p_order_id: id });
    if (error) toast.error(error.message);
    else {
      toast.success("Order marked as paid");
      load();
    }
  };

  const setStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) toast.error(error.message);
    else load();
    // Cancelling an unpaid order? Restore stock:
    if (!error && status === "cancelled") {
      await supabase.rpc("restore_order_inventory", { p_order_id: id });
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "font-bold underline" : ""}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={filter === s ? "font-bold underline" : ""}
          >
            {s}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded border border-[var(--border)] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-sm">{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm">
                  {o.customer_name} · {o.shipping_country} · {o.total_eur} €
                </p>
                <p className="text-sm text-[var(--ink-600)]">
                  {o.payment_method}
                  {o.bank_transfer_reference && ` · Ref: ${o.bank_transfer_reference}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {o.status === "pending_payment" &&
                  o.payment_method === "bank_transfer" && (
                    <button
                      type="button"
                      onClick={() => markPaid(o.id)}
                      className="rounded bg-[var(--accent)] px-3 py-1 text-white"
                    >
                      Mark as paid
                    </button>
                  )}
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                  className="rounded border border-[var(--border)] p-1 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

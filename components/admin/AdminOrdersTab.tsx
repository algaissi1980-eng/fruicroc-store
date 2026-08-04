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

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: "bg-[var(--accent-soft)] text-[var(--accent-ink-2)]",
  paid: "bg-[var(--success-soft)] text-[var(--success)]",
  processing: "bg-[var(--surface-2)] text-[var(--chip-ink)]",
  shipped: "bg-[var(--surface-2)] text-[var(--chip-ink)]",
  completed: "bg-[var(--success-soft)] text-[var(--success)]",
  cancelled: "bg-[#F8E4E2] text-[var(--error)]",
};

const countryName = (code: string) =>
  new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("pending_payment");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    let query = supabase
      .from("orders")
      .select("*, order_items(*, products(name, image_url))")
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
      toast.success("Order marked as paid ✓");
      load();
    }
  };

  const setStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      if (status === "cancelled") {
        await supabase.rpc("restore_order_inventory", { p_order_id: id });
      }
      load();
    }
  };

  return (
    <div>
      {/* Filter — real pill buttons */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => {
          const active = filter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              aria-pressed={active}
              className={`cursor-pointer rounded-full border-2 px-4 py-2 text-[13px] font-bold transition-colors ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                  : "border-[var(--border-input)] bg-white text-[var(--body)] hover:border-[var(--muted)]"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>

      {orders.length === 0 && (
        <p className="text-[var(--muted)]">No orders in this view.</p>
      )}

      <ul className="m-0 list-none space-y-3 p-0">
        {orders.map((o) => {
          const isOpen = expanded === o.id;
          return (
            <li
              key={o.id}
              className="rounded-[20px] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)]"
            >
              {/* Summary row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-[var(--muted)]">
                      {o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`badge ${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                    <span className="badge bg-[var(--surface-2)] text-[var(--chip-ink)]">
                      {o.payment_method === "paypal" ? "PayPal" : "Bank transfer"}
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-sm font-semibold text-[var(--ink)]">
                    {o.customer_name}
                    <span className="font-normal text-[var(--muted)]">
                      {" "}· {countryName(o.shipping_country)} ·{" "}
                      {new Date(o.created_at).toLocaleString("en-GB")}
                    </span>
                  </p>
                </div>
                <span className="font-display text-lg font-extrabold text-[var(--primary)]">
                  €{Number(o.total_eur).toFixed(2)}
                </span>
                {o.status === "pending_payment" &&
                  o.payment_method === "bank_transfer" && (
                    <button
                      type="button"
                      onClick={() => markPaid(o.id)}
                      className="btn-trust !min-h-0 px-4 py-2 text-[13px]"
                    >
                      ✓ Mark as paid
                    </button>
                  )}
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  aria-expanded={isOpen}
                  className="btn-secondary !min-h-0 px-4 py-2 text-[13px]"
                >
                  {isOpen ? "Hide details ▲" : "Details ▼"}
                </button>
              </div>

              {/* Details */}
              {isOpen && (
                <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 lg:grid-cols-2">
                  <div>
                    <h4 className="m-0 mb-2 text-[13px] font-bold uppercase tracking-wide text-[var(--muted)]">
                      Items
                    </h4>
                    <ul className="m-0 list-none space-y-2 p-0">
                      {o.order_items?.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl bg-[var(--surface)] p-2"
                        >
                          {item.products?.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.products.image_url}
                              alt=""
                              className="h-11 w-11 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--surface-2)] text-lg">
                              🍓
                            </span>
                          )}
                          <span className="flex-1 text-sm font-semibold text-[var(--ink)]">
                            {item.products?.name?.fr ?? "Product"}
                            <span className="block text-xs font-normal text-[var(--muted)]">
                              {(item as { weight_g?: number }).weight_g ?? "?"} g ×{" "}
                              {item.quantity}
                            </span>
                          </span>
                          <span className="text-sm font-bold text-[var(--body)]">
                            €{(item.unit_price_eur * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <dl className="m-0 mt-3 space-y-1 text-sm text-[var(--body)]">
                      {Number(o.discount_eur ?? 0) > 0 && (
                        <div className="flex justify-between text-[var(--success)]">
                          <dt>Promo {o.promo_code}</dt>
                          <dd className="m-0">−€{Number(o.discount_eur).toFixed(2)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt>Shipping</dt>
                        <dd className="m-0">€{Number(o.shipping_cost_eur).toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between text-[var(--muted)]">
                        <dt>VAT included ({o.vat_rate_percent}%)</dt>
                        <dd className="m-0">€{Number(o.vat_amount_eur).toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="m-0 mb-2 text-[13px] font-bold uppercase tracking-wide text-[var(--muted)]">
                      Customer & delivery
                    </h4>
                    <dl className="m-0 space-y-1.5 text-sm text-[var(--body)]">
                      <div><dt className="inline font-semibold">Phone: </dt><dd className="m-0 inline">{o.customer_phone}</dd></div>
                      {o.customer_email && (
                        <div><dt className="inline font-semibold">Email: </dt><dd className="m-0 inline">{o.customer_email}</dd></div>
                      )}
                      <div>
                        <dt className="inline font-semibold">Address: </dt>
                        <dd className="m-0 inline">
                          {o.shipping_address}, {o.shipping_postal_code}{" "}
                          {o.shipping_city}, {countryName(o.shipping_country)}
                        </dd>
                      </div>
                      {o.bank_transfer_reference && (
                        <div>
                          <dt className="inline font-semibold">Transfer ref: </dt>
                          <dd className="m-0 inline font-mono font-bold">
                            {o.bank_transfer_reference}
                          </dd>
                        </div>
                      )}
                      {o.paid_at && (
                        <div>
                          <dt className="inline font-semibold">Paid: </dt>
                          <dd className="m-0 inline">
                            {new Date(o.paid_at).toLocaleString("en-GB")} by {o.paid_marked_by}
                          </dd>
                        </div>
                      )}
                      {o.notes && (
                        <div><dt className="inline font-semibold">Notes: </dt><dd className="m-0 inline">{o.notes}</dd></div>
                      )}
                    </dl>

                    <label className="mt-4 block text-[13px] font-bold text-[var(--muted)]">
                      Change status
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                        className="input-pill mt-1 block w-full !py-2.5"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

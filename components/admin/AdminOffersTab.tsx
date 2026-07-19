"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { LocalizedString } from "@/types";

interface Offer {
  id: string;
  type: "sale_percent" | "free_item";
  discount_percentage: number | null;
  product_id: string | null;
  product_name: LocalizedString | null;
  free_item_count: number | null;
  min_order_amount: number | null;
  duration_days: number;
  starts_at: string;
  ends_at: string;
}

interface ProductOption {
  id: string;
  name: LocalizedString;
}

export default function AdminOffersTab() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [form, setForm] = useState({
    type: "sale_percent" as Offer["type"],
    discount_percentage: "",
    product_id: "",
    free_item_count: "1",
    duration_days: "",
    min_order_amount: "",
  });

  const load = useCallback(async () => {
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase.rpc("get_active_offers"),
      supabase.from("products").select("id, name").eq("is_available", true),
    ]);
    setOffers((o as Offer[]) ?? []);
    setProducts((p as ProductOption[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = Number(form.duration_days);
    if (days < 1) {
      toast.error("Duration must be at least 1 day");
      return;
    }
    if (form.type === "sale_percent" && !form.discount_percentage) {
      toast.error("Set a discount percentage");
      return;
    }
    if (form.type === "free_item" && !form.product_id) {
      toast.error("Choose the free product");
      return;
    }

    const { error } = await supabase.from("offers").insert({
      type: form.type,
      discount_percentage:
        form.type === "sale_percent" ? Number(form.discount_percentage) : null,
      product_id: form.type === "free_item" ? form.product_id : null,
      free_item_count:
        form.type === "free_item" ? Number(form.free_item_count) || 1 : null,
      min_order_amount: form.min_order_amount
        ? Number(form.min_order_amount)
        : null,
      duration_days: days,
      ends_at: new Date(Date.now() + days * 86400000).toISOString(),
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Offer activated");
      load();
    }
  };

  const deactivate = async (id: string) => {
    const { error } = await supabase
      .from("offers")
      .update({ is_active: false })
      .eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div>
      <form
        onSubmit={add}
        className="mb-6 flex flex-wrap items-end gap-3 rounded border border-[var(--border)] p-4"
      >
        <label className="block text-sm">
          Type
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as Offer["type"] })
            }
            className="mt-1 block rounded border border-[var(--border)] p-2"
          >
            <option value="sale_percent">Sale % on order</option>
            <option value="free_item">Free item</option>
          </select>
        </label>

        {form.type === "sale_percent" ? (
          <label className="block text-sm">
            Discount %
            <input
              type="number"
              value={form.discount_percentage}
              onChange={(e) =>
                setForm({ ...form, discount_percentage: e.target.value })
              }
              className="mt-1 block w-24 rounded border border-[var(--border)] p-2"
            />
          </label>
        ) : (
          <>
            <label className="block text-sm">
              Free product
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className="mt-1 block max-w-48 rounded border border-[var(--border)] p-2"
              >
                <option value="">— choose —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.fr}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Count
              <input
                type="number"
                min={1}
                value={form.free_item_count}
                onChange={(e) =>
                  setForm({ ...form, free_item_count: e.target.value })
                }
                className="mt-1 block w-20 rounded border border-[var(--border)] p-2"
              />
            </label>
          </>
        )}

        <label className="block text-sm">
          Min order € (optional)
          <input
            type="number"
            step="0.01"
            value={form.min_order_amount}
            onChange={(e) =>
              setForm({ ...form, min_order_amount: e.target.value })
            }
            className="mt-1 block w-28 rounded border border-[var(--border)] p-2"
          />
        </label>
        <label className="block text-sm">
          Duration (days)
          <input
            type="number"
            value={form.duration_days}
            onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
            className="mt-1 block w-24 rounded border border-[var(--border)] p-2"
          />
        </label>

        <button type="submit" className="rounded bg-[var(--accent)] px-4 py-2 text-white">
          Activate offer
        </button>
      </form>

      {offers.length === 0 ? (
        <p className="text-[var(--ink-600)]">No active offers.</p>
      ) : (
        <ul className="space-y-2">
          {offers.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between rounded border border-[var(--border)] p-3"
            >
              <span>
                {o.type === "sale_percent"
                  ? `−${o.discount_percentage}% on orders`
                  : `Free: ${o.free_item_count} × ${o.product_name?.fr ?? "?"}`}
                {o.min_order_amount != null && ` · from ${o.min_order_amount} €`}
                <small className="ms-2 text-[var(--ink-600)]">
                  until {new Date(o.ends_at).toLocaleDateString("fr")}
                </small>
              </span>
              <button
                type="button"
                onClick={() => deactivate(o.id)}
                className="text-[var(--danger)] underline"
              >
                Stop
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

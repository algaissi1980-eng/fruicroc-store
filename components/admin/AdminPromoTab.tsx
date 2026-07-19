"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  min_order_amount: number;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

export default function AdminPromoTab() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount_percentage: "",
    duration_days: "",
    min_order_amount: "0",
  });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setCodes((data as PromoCode[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = Number(form.discount_percentage);
    const days = Number(form.duration_days);
    if (!form.code || pct < 1 || pct > 100 || days < 1) {
      toast.error("Fill code, discount 1–100 and duration ≥ 1 day");
      return;
    }
    const { error } = await supabase.from("promo_codes").insert({
      code: form.code.trim().toUpperCase(),
      discount_percentage: pct,
      min_order_amount: Number(form.min_order_amount) || 0,
      expires_at: new Date(Date.now() + days * 86400000).toISOString(),
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Code added");
      setForm({ code: "", discount_percentage: "", duration_days: "", min_order_amount: "0" });
      load();
    }
  };

  const toggle = async (c: PromoCode) => {
    const { error } = await supabase
      .from("promo_codes")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this code?")) return;
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const daysLeft = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff <= 0 ? 0 : Math.ceil(diff / 86400000);
  };

  return (
    <div>
      <form
        onSubmit={add}
        className="mb-6 flex flex-wrap items-end gap-3 rounded border border-[var(--border)] p-4"
      >
        <label className="block text-sm">
          Code
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="SUMMER20"
            className="mt-1 block w-32 rounded border border-[var(--border)] p-2 font-mono uppercase"
          />
        </label>
        <label className="block text-sm">
          Discount %
          <input
            type="number"
            value={form.discount_percentage}
            onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
            className="mt-1 block w-24 rounded border border-[var(--border)] p-2"
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
        <label className="block text-sm">
          Min order € (0 = none)
          <input
            type="number"
            step="0.01"
            value={form.min_order_amount}
            onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
            className="mt-1 block w-28 rounded border border-[var(--border)] p-2"
          />
        </label>
        <button type="submit" className="rounded bg-[var(--accent)] px-4 py-2 text-white">
          Add code
        </button>
      </form>

      <ul className="space-y-2">
        {codes.map((c) => {
          const left = daysLeft(c.expires_at);
          return (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--border)] p-3"
            >
              <span>
                <strong className="font-mono">{c.code}</strong> — {c.discount_percentage}%
                {c.min_order_amount > 0 && ` · min ${c.min_order_amount} €`}
                {` · used ${c.used_count}×`}
                <small className="ms-2 text-[var(--ink-600)]">
                  {left === 0
                    ? "expired"
                    : left != null
                      ? `${left} day(s) left`
                      : "no expiry"}
                  {!c.is_active && " · inactive"}
                </small>
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => toggle(c)} className="underline">
                  {c.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="text-[var(--danger)] underline"
                >
                  Delete
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { ShippingZone } from "@/types";

export default function AdminShippingTab() {
  const [zones, setZones] = useState<ShippingZone[]>([]);

  useEffect(() => {
    supabase
      .from("shipping_zones")
      .select("*")
      .order("country_code")
      .then(({ data }) => setZones((data as ShippingZone[]) ?? []));
  }, []);

  const update = (code: string, patch: Partial<ShippingZone>) =>
    setZones((z) =>
      z.map((zone) => (zone.country_code === code ? { ...zone, ...patch } : zone))
    );

  const save = async (zone: ShippingZone) => {
    const { error } = await supabase
      .from("shipping_zones")
      .update({
        rate_eur: zone.rate_eur,
        free_shipping_threshold_eur: zone.free_shipping_threshold_eur,
        active: zone.active,
      })
      .eq("country_code", zone.country_code);
    if (error) toast.error(error.message);
    else toast.success(`${zone.country_code} saved`);
  };

  const countryName = (code: string) =>
    new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--border)] text-start">
          <th className="p-2 text-start">Country</th>
          <th className="p-2 text-start">Rate (€)</th>
          <th className="p-2 text-start">Free shipping from (€)</th>
          <th className="p-2 text-start">Active</th>
          <th className="p-2" />
        </tr>
      </thead>
      <tbody>
        {zones.map((z) => (
          <tr key={z.country_code} className="border-b border-[var(--border)]">
            <td className="p-2 font-semibold text-[var(--ink)]">
              {countryName(z.country_code)}{" "}
              <span className="font-mono text-xs text-[var(--muted)]">
                {z.country_code}
              </span>
            </td>
            <td className="p-2">
              <input
                type="number"
                step="0.01"
                value={z.rate_eur}
                onChange={(e) =>
                  update(z.country_code, { rate_eur: Number(e.target.value) })
                }
                className="w-24 rounded border border-[var(--border)] p-1"
              />
            </td>
            <td className="p-2">
              <input
                type="number"
                step="0.01"
                value={z.free_shipping_threshold_eur ?? ""}
                onChange={(e) =>
                  update(z.country_code, {
                    free_shipping_threshold_eur:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-24 rounded border border-[var(--border)] p-1"
              />
            </td>
            <td className="p-2">
              <input
                type="checkbox"
                checked={z.active}
                onChange={(e) =>
                  update(z.country_code, { active: e.target.checked })
                }
              />
            </td>
            <td className="p-2">
              <button
                type="button"
                onClick={() => save(z)}
                className="rounded bg-[var(--accent)] px-2 py-1 text-white"
              >
                Save
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

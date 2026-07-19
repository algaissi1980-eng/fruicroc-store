"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { VatRate } from "@/types";

export default function AdminVatTab() {
  const [rates, setRates] = useState<VatRate[]>([]);

  useEffect(() => {
    supabase
      .from("vat_rates")
      .select("*")
      .order("country_code")
      .then(({ data }) => setRates((data as VatRate[]) ?? []));
  }, []);

  const save = async (rate: VatRate) => {
    const { error } = await supabase
      .from("vat_rates")
      .update({ rate_percent: rate.rate_percent })
      .eq("id", rate.id);
    if (error) toast.error(error.message);
    else toast.success(`${rate.country_code} ${rate.category} saved`);
  };

  const countryName = (code: string) =>
    new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--border)]">
          <th className="p-2 text-start">Country</th>
          <th className="p-2 text-start">Category</th>
          <th className="p-2 text-start">Rate (%)</th>
          <th className="p-2" />
        </tr>
      </thead>
      <tbody>
        {rates.map((r) => (
          <tr key={r.id} className="border-b border-[var(--border)]">
            <td className="p-2 font-semibold text-[var(--ink)]">
              {countryName(r.country_code)}{" "}
              <span className="font-mono text-xs text-[var(--muted)]">
                {r.country_code}
              </span>
            </td>
            <td className="p-2 capitalize">{r.category}</td>
            <td className="p-2">
              <input
                type="number"
                step="0.1"
                value={r.rate_percent}
                onChange={(e) =>
                  setRates((all) =>
                    all.map((x) =>
                      x.id === r.id
                        ? { ...x, rate_percent: Number(e.target.value) }
                        : x
                    )
                  )
                }
                className="w-24 rounded border border-[var(--border)] p-1"
              />
            </td>
            <td className="p-2">
              <button
                type="button"
                onClick={() => save(r)}
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

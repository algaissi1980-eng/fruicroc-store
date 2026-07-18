"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { StoreSettings } from "@/types";

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => setSettings(data as StoreSettings));
  }, []);

  if (!settings) return null;

  const save = async () => {
    const { error } = await supabase
      .from("store_settings")
      .update({
        bank_account_holder: settings.bank_account_holder,
        bank_iban: settings.bank_iban,
        bank_bic: settings.bank_bic,
        categories: settings.categories,
      })
      .eq("id", 1);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  return (
    <div className="max-w-md space-y-4">
      <h2 className="font-semibold">Bank transfer details</h2>
      <p className="text-sm text-[var(--ink-600)]">
        Shown to customers on the order confirmation page.
      </p>

      <label className="block">
        Account holder
        <input
          value={settings.bank_account_holder ?? ""}
          onChange={(e) =>
            setSettings({ ...settings, bank_account_holder: e.target.value })
          }
          className="mt-1 w-full rounded border border-[var(--border)] p-2"
        />
      </label>
      <label className="block">
        IBAN
        <input
          value={settings.bank_iban ?? ""}
          onChange={(e) => setSettings({ ...settings, bank_iban: e.target.value })}
          className="mt-1 w-full rounded border border-[var(--border)] p-2 font-mono"
        />
      </label>
      <label className="block">
        BIC
        <input
          value={settings.bank_bic ?? ""}
          onChange={(e) => setSettings({ ...settings, bank_bic: e.target.value })}
          className="mt-1 w-full rounded border border-[var(--border)] p-2 font-mono"
        />
      </label>

      <h2 className="font-semibold">Categories</h2>
      <input
        value={settings.categories.join(", ")}
        onChange={(e) =>
          setSettings({
            ...settings,
            categories: e.target.value.split(",").map((s) => s.trim()),
          })
        }
        className="w-full rounded border border-[var(--border)] p-2"
      />

      <button
        type="button"
        onClick={save}
        className="rounded bg-[var(--accent)] px-4 py-2 text-white"
      >
        Save
      </button>
    </div>
  );
}

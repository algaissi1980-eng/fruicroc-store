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
        announcement: settings.announcement,
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

      <h2 className="font-semibold">Announcement bar (empty = hidden)</h2>
      {(["fr", "en", "ar"] as const).map((l) => (
        <label key={l} className="block">
          {l.toUpperCase()}
          <input
            dir={l === "ar" ? "rtl" : "ltr"}
            value={settings.announcement?.[l] ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                announcement: {
                  fr: settings.announcement?.fr ?? "",
                  ...settings.announcement,
                  [l]: e.target.value,
                },
              })
            }
            className="mt-1 w-full rounded border border-[var(--border)] p-2"
          />
        </label>
      ))}

      {/* Categories are fixed (fruits / vegetables / candy) to match the
          storefront tiles — no free-text category management. */}

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

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";
import type { StoreSettings, SiteImages } from "@/types";

// Homepage/About images editable without touching code
const IMAGE_SLOTS: { key: keyof SiteImages; label: string; hint: string }[] = [
  { key: "hero", label: "Hero photo", hint: "Homepage main photo — square, shown in the circle" },
  { key: "category_fruits", label: "Category: Fruits", hint: "Tile on the homepage" },
  { key: "category_vegetables", label: "Category: Vegetables", hint: "Tile on the homepage" },
  { key: "category_candy", label: "Category: Candy", hint: "Tile on the homepage (currently yellow placeholder)" },
  { key: "jana", label: "Photo of Jana", hint: "Story section + About page (arch shape)" },
];

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

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
        site_images: settings.site_images ?? {},
      })
      .eq("id", 1);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const uploadSiteImage = async (slot: keyof SiteImages, file: File) => {
    setUploadingSlot(slot);
    try {
      const compressed = await compressImage(file, { maxWidthOrHeight: 1600 });
      const ext = compressed.type === "image/webp" ? "webp" : "jpg";
      const path = `site/${slot}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, compressed, { contentType: compressed.type });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      const next = {
        ...settings,
        site_images: { ...settings.site_images, [slot]: data.publicUrl },
      };
      setSettings(next);
      // Save immediately so the storefront updates without a second click
      const { error: saveError } = await supabase
        .from("store_settings")
        .update({ site_images: next.site_images })
        .eq("id", 1);
      if (saveError) throw saveError;
      toast.success("Image updated ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <h2 className="font-semibold">Site images</h2>
      <p className="text-sm text-[var(--muted)]">
        Photos shown on the homepage and About page. Uploads apply immediately.
      </p>
      <ul className="m-0 list-none space-y-2.5 p-0">
        {IMAGE_SLOTS.map((slot) => {
          const url = settings.site_images?.[slot.key];
          return (
            <li
              key={slot.key}
              className="flex items-center gap-3.5 rounded-2xl border border-[var(--border)] bg-white p-3"
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-xl">
                  🖼
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-bold text-[var(--ink)]">{slot.label}</p>
                <p className="m-0 text-xs text-[var(--muted)]">{slot.hint}</p>
              </div>
              <label className="btn-secondary shrink-0 cursor-pointer !min-h-0 px-3.5 py-1.5 text-[13px]">
                {uploadingSlot === slot.key ? "Uploading…" : url ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploadingSlot !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadSiteImage(slot.key, file);
                  }}
                />
              </label>
            </li>
          );
        })}
      </ul>

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

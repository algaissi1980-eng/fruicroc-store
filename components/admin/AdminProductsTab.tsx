"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";
import type { Product, LocalizedString, VatCategory } from "@/types";
import type { Locale } from "@/i18n/routing";

const LOCALES: Locale[] = ["fr", "en", "ar"];

// Fixed storefront categories (match the homepage tiles)
const CATEGORIES = ["fruits", "vegetables", "candy"] as const;

const emptyLocalized: LocalizedString = { fr: "", en: "", ar: "" };

interface ProductForm {
  id?: string;
  name: LocalizedString;
  description: LocalizedString;
  ingredients: LocalizedString;
  slug: LocalizedString;
  vat_category: VatCategory;
  category: string;
  stock: number;
  is_available: boolean;
  image_url: string;
}

const emptyForm: ProductForm = {
  name: { ...emptyLocalized },
  description: { ...emptyLocalized },
  ingredients: { ...emptyLocalized },
  slug: { ...emptyLocalized },
  vat_category: "food",
  category: "fruits",
  stock: 0,
  is_available: true,
  image_url: "",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [langTab, setLangTab] = useState<Locale>("fr");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      // Storage keys must be ASCII — never use the original filename
      // (Arabic/accented names throw "Invalid key")
      const ext = compressed.type === "image/webp" ? "webp" : "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, compressed, { contentType: compressed.type });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => (f ? { ...f, image_url: data.publicUrl } : f));
      toast.success("Image uploaded — remember to Save the product");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const setLocalizedField =
    (field: "name" | "description" | "ingredients") => (value: string) =>
      setForm((f) =>
        f ? { ...f, [field]: { ...f[field], [langTab]: value } } : f
      );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.name.fr) {
      toast.error("French name is required (base locale)");
      return;
    }

    const slug: LocalizedString = { fr: slugify(form.name.fr) };
    if (form.name.en) slug.en = slugify(form.name.en);
    if (form.name.ar) slug.ar = slugify(form.name.ar);

    const payload = {
      name: form.name,
      description: form.description,
      ingredients: form.ingredients,
      slug,
      base_price_eur: 4.5, // unused — brand-wide weight tiers drive pricing (lib/weights.ts)
      vat_category: form.vat_category,
      category: form.category,
      stock: form.stock,
      is_available: form.is_available,
      image_url: form.image_url || null,
    };

    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);

    if (error) toast.error(error.message);
    else {
      toast.success("Product saved ✓");
      setForm(null);
      load();
    }
  };

  const edit = (p: Product) =>
    setForm({
      id: p.id,
      name: { ...emptyLocalized, ...p.name },
      description: { ...emptyLocalized, ...p.description },
      ingredients: { ...emptyLocalized, ...(p.ingredients ?? {}) },
      slug: { ...emptyLocalized, ...p.slug },
      vat_category: p.vat_category,
      category: p.category,
      stock: p.stock,
      is_available: p.is_available,
      image_url: p.image_url ?? "",
    });

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setForm({ ...emptyForm })}
        className="btn-primary mb-5"
      >
        + New product
      </button>

      {form && (
        <form
          onSubmit={save}
          className="mb-6 flex flex-col gap-4 rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
        >
          <h3 className="m-0 text-lg font-extrabold text-[var(--ink)]">
            {form.id ? "Edit product" : "New product"}
          </h3>

          {/* Image */}
          <div className="flex items-center gap-4">
            {form.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image_url}
                alt=""
                className="h-20 w-20 rounded-2xl border border-[var(--border)] object-cover"
              />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--surface-2)] text-2xl">
                📷
              </span>
            )}
            <label className="btn-secondary cursor-pointer">
              {uploading ? "Uploading…" : form.image_url ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
              />
            </label>
          </div>

          {/* fr/en/ar tabs — fr required, en/ar fall back to fr on the site */}
          <div className="flex gap-2">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLangTab(l)}
                className={`cursor-pointer rounded-full border-2 px-4 py-1.5 text-[13px] font-bold ${
                  langTab === l
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                    : "border-[var(--border-input)] bg-white text-[var(--body)]"
                }`}
              >
                {l.toUpperCase()}
                {l === "fr" && " *"}
                {l !== "fr" && !form.name[l] && " ⚠"}
              </button>
            ))}
          </div>

          <input
            placeholder={`Name (${langTab.toUpperCase()})`}
            dir={langTab === "ar" ? "rtl" : "ltr"}
            value={form.name[langTab] ?? ""}
            onChange={(e) => setLocalizedField("name")(e.target.value)}
            className="input-pill w-full"
          />
          <textarea
            placeholder={`Description (${langTab.toUpperCase()})`}
            dir={langTab === "ar" ? "rtl" : "ltr"}
            rows={2}
            value={form.description[langTab] ?? ""}
            onChange={(e) => setLocalizedField("description")(e.target.value)}
            className="w-full rounded-[20px] border-2 border-[var(--border-input)] bg-white p-3.5 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--muted)]"
          />
          <input
            placeholder={`Ingredients (${langTab.toUpperCase()})`}
            dir={langTab === "ar" ? "rtl" : "ltr"}
            value={form.ingredients[langTab] ?? ""}
            onChange={(e) => setLocalizedField("ingredients")(e.target.value)}
            className="input-pill w-full"
          />

          <div className="flex flex-wrap items-end gap-4">
            <label className="block text-[13px] font-bold text-[var(--muted)]">
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-pill mt-1 block !py-2.5"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[13px] font-bold text-[var(--muted)]">
              Stock (bags)
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="input-pill mt-1 block w-28 !py-2.5"
              />
            </label>
            <label className="block text-[13px] font-bold text-[var(--muted)]">
              VAT category
              <select
                value={form.vat_category}
                onChange={(e) =>
                  setForm({ ...form, vat_category: e.target.value as VatCategory })
                }
                className="input-pill mt-1 block !py-2.5"
              >
                <option value="food">Food (reduced rate)</option>
                <option value="standard">Standard rate</option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm font-semibold text-[var(--body)]">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="h-4 w-4 accent-[var(--success)]"
              />
              Visible in shop
            </label>
          </div>

          <p className="m-0 rounded-xl bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
            Prices are brand-wide by weight: 30 g €4.50 · 50 g €7.00 · 70 g
            €9.50 · 100 g €14.50 — no per-product price to set.
          </p>

          <div className="flex gap-2.5">
            <button type="submit" className="btn-primary">
              Save product
            </button>
            <button type="button" onClick={() => setForm(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Product list with thumbnails */}
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3.5 rounded-2xl border border-[var(--border)] bg-white p-3"
          >
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-xl">
                📷
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate font-bold text-[var(--ink)]">
                {p.name.fr}
              </p>
              <p className="m-0 flex flex-wrap gap-x-2 text-xs text-[var(--muted)]">
                <span className="capitalize">{p.category}</span>
                <span>· stock {p.stock}</span>
                {!p.is_available && <span className="font-bold text-[var(--error)]">· hidden</span>}
                {!p.name.en && <span className="text-[var(--accent-ink-2)]">· EN missing</span>}
                {!p.name.ar && <span className="text-[var(--accent-ink-2)]">· AR missing</span>}
              </p>
            </div>
            <button type="button" onClick={() => edit(p)} className="btn-secondary !min-h-0 px-3.5 py-1.5 text-[13px]">
              Edit
            </button>
            <button
              type="button"
              onClick={() => remove(p.id)}
              className="btn-secondary !min-h-0 px-3.5 py-1.5 text-[13px] !text-[var(--error)]"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

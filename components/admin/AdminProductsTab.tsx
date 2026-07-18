"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { Product, LocalizedString, VatCategory } from "@/types";
import type { Locale } from "@/i18n/routing";

const LOCALES: Locale[] = ["fr", "en", "ar"];

const emptyLocalized: LocalizedString = { fr: "", en: "", ar: "" };

interface ProductForm {
  id?: string;
  name: LocalizedString;
  description: LocalizedString;
  slug: LocalizedString;
  price_excl_vat: number;
  vat_category: VatCategory;
  category: string;
  stock: number;
  is_available: boolean;
  image_url: string;
}

const emptyForm: ProductForm = {
  name: { ...emptyLocalized },
  description: { ...emptyLocalized },
  slug: { ...emptyLocalized },
  price_excl_vat: 0,
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

  const setLocalizedField =
    (field: "name" | "description") => (value: string) =>
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
      slug,
      price_excl_vat: form.price_excl_vat,
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
      toast.success("Product saved");
      setForm(null);
      load();
    }
  };

  const edit = (p: Product) =>
    setForm({
      id: p.id,
      name: { ...emptyLocalized, ...p.name },
      description: { ...emptyLocalized, ...p.description },
      slug: { ...emptyLocalized, ...p.slug },
      price_excl_vat: p.price_excl_vat,
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
        className="mb-4 rounded bg-[var(--accent)] px-3 py-2 text-white"
      >
        + New product
      </button>

      {form && (
        <form
          onSubmit={save}
          className="mb-6 space-y-3 rounded border border-[var(--border)] p-4"
        >
          {/* fr/en/ar language tabs — fr required, en/ar fall back to fr */}
          <div className="flex gap-2">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLangTab(l)}
                className={`rounded px-3 py-1 ${
                  langTab === l ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)]"
                }`}
              >
                {l.toUpperCase()}
                {l === "fr" && " *"}
              </button>
            ))}
          </div>

          <input
            placeholder={`Name (${langTab})`}
            dir={langTab === "ar" ? "rtl" : "ltr"}
            value={form.name[langTab] ?? ""}
            onChange={(e) => setLocalizedField("name")(e.target.value)}
            className="w-full rounded border border-[var(--border)] p-2"
          />
          <textarea
            placeholder={`Description (${langTab})`}
            dir={langTab === "ar" ? "rtl" : "ltr"}
            value={form.description[langTab] ?? ""}
            onChange={(e) => setLocalizedField("description")(e.target.value)}
            className="w-full rounded border border-[var(--border)] p-2"
          />

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-1">
              Price € (excl. VAT)
              <input
                type="number"
                step="0.01"
                value={form.price_excl_vat}
                onChange={(e) =>
                  setForm({ ...form, price_excl_vat: Number(e.target.value) })
                }
                className="w-24 rounded border border-[var(--border)] p-1"
              />
            </label>
            <label className="flex items-center gap-1">
              Stock
              <input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
                className="w-20 rounded border border-[var(--border)] p-1"
              />
            </label>
            <label className="flex items-center gap-1">
              VAT
              <select
                value={form.vat_category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vat_category: e.target.value as VatCategory,
                  })
                }
                className="rounded border border-[var(--border)] p-1"
              >
                <option value="food">food (reduced)</option>
                <option value="standard">standard</option>
              </select>
            </label>
            <label className="flex items-center gap-1">
              Category
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-28 rounded border border-[var(--border)] p-1"
              />
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) =>
                  setForm({ ...form, is_available: e.target.checked })
                }
              />
              Available
            </label>
          </div>

          <input
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full rounded border border-[var(--border)] p-2"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-[var(--accent)] px-4 py-2 text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded border border-[var(--border)] px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded border border-[var(--border)] p-2"
          >
            <span>
              {p.name.fr}{" "}
              <small className="text-[var(--ink-600)]">
                {p.price_excl_vat} € · stock {p.stock}
                {!p.name.en && " · ⚠ EN missing"}
                {!p.name.ar && " · ⚠ AR missing"}
              </small>
            </span>
            <span className="flex gap-2">
              <button type="button" onClick={() => edit(p)} className="underline">
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="text-[var(--danger)] underline"
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

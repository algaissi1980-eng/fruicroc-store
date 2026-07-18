"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import FloatingCart from "./FloatingCart";
import type { Product } from "@/types";

export default function HomeClient({ products }: { products: Product[] }) {
  const t = useTranslations("home");
  const [category, setCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={category === null ? "font-bold underline" : ""}
        >
          {t("allCategories")}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={category === c ? "font-bold underline" : ""}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--ink-600)]">{t("noProducts")}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}

      <FloatingCart />
    </div>
  );
}

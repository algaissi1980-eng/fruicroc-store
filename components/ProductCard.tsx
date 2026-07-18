"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { localized, type Product } from "@/types";
import { formatEur } from "@/lib/pricing";
import type { Locale } from "@/i18n/routing";

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");
  const addToCart = useCartStore((s) => s.addToCart);

  const name = localized(product.name, locale);
  const out = product.stock <= 0;

  return (
    <article className="flex h-full flex-col rounded border border-[var(--border)] p-3">
      {product.image_url && (
        <Image
          src={product.image_url}
          alt={name}
          width={300}
          height={300}
          loading="lazy"
          className="mb-2 aspect-square w-full rounded object-cover"
        />
      )}
      <h2 className="font-semibold">{name}</h2>
      {/* NOTE: net price shown for now — display strategy pending client decision */}
      <p className="text-[var(--ink-600)]">
        {formatEur(product.price_excl_vat, locale)}
      </p>
      <button
        type="button"
        disabled={out}
        onClick={() => {
          addToCart(product, 1);
          toast.success(name);
        }}
        className="mt-auto rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-50"
      >
        {out ? t("outOfStock") : t("addToCart")}
      </button>
    </article>
  );
}

"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import { localized, type Product } from "@/types";
import { WEIGHT_TIERS, FROM_PRICE, formatPrice } from "@/lib/weights";
import type { Locale } from "@/i18n/routing";

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");
  const addToCart = useCartStore((s) => s.addToCart);

  const name = localized(product.name, locale);
  const note = localized(product.description, locale);
  const slug = localized(product.slug, locale);
  const out = product.stock <= 0;

  const quickAdd = () => {
    if (out) return;
    addToCart(product, 50, 1); // quick-add default: 50 g
    toast.success(t("addedToCart", { name, weight: 50 }));
  };

  return (
    <article className="card-hover flex h-full flex-col overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)]">
      <Link
        href={`/products/${slug || product.id}`}
        className="relative block aspect-square bg-white no-underline"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={name}
            width={349}
            height={349}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center bg-[var(--surface-2)] text-4xl">
            🍓
          </span>
        )}
        {out && (
          <span className="badge badge-pickup absolute top-3 start-3">
            {t("outOfStock")}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4 pb-[18px] lg:px-[18px]">
        <h3 className="font-display m-0 text-[14.5px] font-bold leading-tight text-[var(--ink)] lg:text-[18.5px]">
          {name}
        </h3>
        {note && (
          <p className="m-0 hidden text-[13px] text-[var(--muted-2)] lg:block">
            {note}
          </p>
        )}
        <div className="hidden flex-wrap gap-1.5 lg:flex">
          {WEIGHT_TIERS.map((w) => (
            <span
              key={w}
              className="rounded-lg bg-[var(--surface-2)] px-2 py-1 text-[11.5px] font-semibold text-[var(--muted)]"
            >
              {w}g
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center pt-1">
          <span className="text-[13px] text-[var(--muted)]">
            <span className="hidden lg:inline">{t("from")} </span>
            <span className="font-display text-[15.5px] font-extrabold text-[var(--primary)] lg:text-[19px]">
              {formatPrice(FROM_PRICE, locale)}
            </span>
          </span>
          <button
            type="button"
            onClick={quickAdd}
            disabled={out}
            aria-label={`+ ${name}`}
            className="ms-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[var(--primary)] text-lg font-semibold text-white shadow-[0_3px_8px_rgba(196,43,43,.3)] transition-colors hover:bg-[var(--primary-ink)] disabled:cursor-default disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-ink)] disabled:shadow-none lg:h-[38px] lg:w-[38px] lg:text-xl"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

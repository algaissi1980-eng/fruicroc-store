"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import CartButton from "./CartButton";
import FloatingCart from "./FloatingCart";
import { useCartStore } from "@/store/cartStore";
import { localized, type Product } from "@/types";
import { WEIGHT_TIERS, TIER_PRICES, formatPrice, type WeightG } from "@/lib/weights";
import type { Locale } from "@/i18n/routing";

export default function ProductDetail({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const tNav = useTranslations("nav");
  const tHome = useTranslations("home");
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);

  const [weight, setWeight] = useState<WeightG>(50);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const name = localized(product.name, locale);
  const description = localized(product.description, locale);
  const ingredients = localized(product.ingredients ?? null, locale);
  const images = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images ?? []),
  ].filter((img, i, arr) => arr.indexOf(img) === i);
  const out = product.stock <= 0;

  const add = () => {
    if (out || added) return;
    addToCart(product, weight, 1);
    setAdded(true);
    toast.success(tHome("addedToCart", { name, weight }));
  };

  const pick = (w: WeightG) => {
    setWeight(w);
    setAdded(false); // selecting resets the "added" state (design spec)
  };

  return (
    <div className="mx-auto max-w-lg bg-white lg:max-w-4xl">
      {/* Sub-header: back + category + cart */}
      <header className="flex items-center gap-2.5 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white text-[17px] text-[var(--body)] shadow-[0_1px_3px_rgba(58,36,32,.12)] rtl:rotate-180"
        >
          ←
        </button>
        <span className="font-display text-[15px] font-bold text-[var(--ink)]">
          {["fruits", "vegetables", "candy"].includes(product.category)
            ? tNav(product.category as "fruits" | "vegetables" | "candy")
            : product.category}
        </span>
        <span className="ms-auto">
          <CartButton />
        </span>
      </header>

      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:p-8">
        {/* Gallery */}
        <div className="bg-[var(--surface)] px-5 pb-[22px] pt-[18px] lg:rounded-3xl">
          <div className="overflow-hidden rounded-[22px] shadow-[0_8px_24px_rgba(58,36,32,.14)]">
            {images[activeImage] && (
              <Image
                src={images[activeImage]}
                alt={name}
                width={700}
                height={560}
                priority
                className="block h-[280px] w-full object-cover lg:h-[420px]"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 cursor-pointer overflow-hidden rounded-[14px] border-[3px] p-0 ${
                    i === activeImage
                      ? "border-[var(--primary)]"
                      : "border-transparent opacity-75"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3.5 px-5 pb-7 pt-[22px] lg:p-0">
          <div className="flex gap-2">
            <span className="badge badge-success">{t("badgeHalal")}</span>
            <span className="badge badge-accent">{t("badgeNoSugar")}</span>
          </div>

          <div>
            <h1 className="m-0 mb-1 text-[27px] font-extrabold text-[var(--ink)] lg:text-[34px]">
              {name}
            </h1>
            {description && (
              <p className="m-0 text-sm leading-relaxed text-[var(--body-2)] lg:text-[15px]">
                {description}
              </p>
            )}
          </div>

          {/* Weight selector */}
          <div>
            <div className="mb-2 flex items-baseline">
              <span className="text-[13px] font-bold text-[var(--body)]">
                {t("chooseSize")}
              </span>
              <span className="ms-auto text-xs text-[var(--muted-2)]">
                {t("perBag")}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {WEIGHT_TIERS.map((w) => {
                const selected = w === weight;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => pick(w)}
                    aria-pressed={selected}
                    className={`flex cursor-pointer flex-col gap-[1px] rounded-[14px] border-2 px-1 pb-2 pt-2.5 text-center transition-colors ${
                      selected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                        : "border-[var(--border-input)] bg-white text-[#7A4A3A]"
                    }`}
                  >
                    <span className="font-display text-base font-extrabold">
                      {w} g
                    </span>
                    <span className="text-[11.5px] font-semibold opacity-85">
                      {formatPrice(TIER_PRICES[w], locale)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA — live price, turns green when added */}
          <button
            type="button"
            onClick={add}
            disabled={out}
            className={`flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 py-4 text-lg font-bold text-[var(--on-primary)] transition-colors disabled:cursor-default disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-ink)] disabled:shadow-none ${
              added
                ? "bg-[var(--success)]"
                : "bg-[var(--primary)] shadow-[0_5px_16px_rgba(196,43,43,.32)] hover:bg-[var(--primary-ink)]"
            }`}
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            <span>{out ? tHome("outOfStock") : added ? t("added") : t("addToCart")}</span>
            {!out && (
              <>
                <span className="opacity-85">·</span>
                <span>{formatPrice(TIER_PRICES[weight], locale)}</span>
              </>
            )}
          </button>

          <p className="m-0 text-center text-xs text-[var(--muted)]">
            {t("shippingLine")}
          </p>

          {/* Specs */}
          <dl className="m-0 flex flex-col gap-3 border-t border-[var(--border)] pt-3.5 text-sm text-[var(--body)]">
            <div className="flex font-semibold">
              <dt>{t("specIngredients")}</dt>
              <dd className="ms-auto font-normal text-[var(--muted-2)]">
                {ingredients || name}
              </dd>
            </div>
            <div className="flex font-semibold">
              <dt>{t("specShelfLife")}</dt>
              <dd className="ms-auto font-normal text-[var(--muted-2)]">
                {t("specShelfLifeValue")}
              </dd>
            </div>
            <div className="flex font-semibold">
              <dt>{t("specShipping")}</dt>
              <dd className="ms-auto font-normal text-[var(--muted-2)]">
                {t("specShippingValue")}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <FloatingCart />
    </div>
  );
}

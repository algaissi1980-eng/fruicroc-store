"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ProductCard from "./ProductCard";
import FloatingCart from "./FloatingCart";
import type { Product, SiteImages } from "@/types";
import { FROM_PRICE, formatPrice } from "@/lib/weights";
import type { Locale } from "@/i18n/routing";

export default function HomeClient({
  products,
  initialCategory = null,
  siteImages = {},
}: {
  products: Product[];
  initialCategory?: string | null;
  siteImages?: SiteImages;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [category, setCategory] = useState<string | null>(initialCategory);

  // Admin-uploaded images win; temp Instagram crops as fallback
  const heroImg = siteImages.hero ?? "/temp-products/blackberry.png";
  const categoryTiles = [
    { key: "fruits", img: siteImages.category_fruits ?? "/temp-products/peach.png" },
    { key: "vegetables", img: siteImages.category_vegetables ?? "/temp-products/mushroom.png" },
    { key: "candy", img: siteImages.category_candy ?? null }, // photo coming
  ] as const;

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="grid items-center gap-6 px-5 pb-8 pt-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:px-[72px] lg:pb-16 lg:pt-14">
        <div className="flex flex-col items-start gap-4 lg:gap-[22px]">
          <div className="flex flex-wrap gap-2.5">
            <span className="badge badge-success tracking-[0.08em]">
              {t("hero.badgeFreezeDried")}
            </span>
            <span className="badge badge-accent tracking-[0.08em]">
              {t("hero.badgeNatural")}
            </span>
          </div>
          <h1 className="m-0 text-[34px] font-extrabold leading-[1.12] text-[var(--ink)] lg:text-[58px] lg:leading-[1.08]">
            {t("hero.titleStart")}{" "}
            <span className="text-[var(--primary)]">{t("hero.titleAccent")}</span>
          </h1>

          {/* Mobile hero image */}
          <div className="relative w-full lg:hidden">
            <div className="overflow-hidden rounded-3xl shadow-[0_10px_26px_rgba(58,36,32,.16)]">
              <Image
                src={heroImg}
                alt=""
                width={780}
                height={460}
                priority
                className="block h-[230px] w-full object-cover"
              />
            </div>
            <span className="font-display absolute top-3 end-3 rotate-[7deg] rounded-full bg-[var(--accent)] px-3.5 py-2 text-[13.5px] font-extrabold text-[var(--accent-ink)]">
              {t("hero.sticker")}
            </span>
          </div>

          <p className="m-0 max-w-[46ch] text-[14.5px] leading-relaxed text-[var(--body-2)] lg:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="flex w-full flex-col gap-3.5 lg:w-auto lg:flex-row lg:items-center">
            {/* Scrolls to the product grid */}
            <a href="#shop" className="btn-primary w-full text-[17px] no-underline lg:w-auto lg:px-8 lg:text-lg">
              {t("hero.ctaShop")}
            </a>
            <Link href="/about" className="hidden rounded-full border-2 border-[#B9D3B0] px-5 py-3.5 text-base font-semibold text-[var(--success)] no-underline lg:inline-flex">
              {t("hero.ctaStory")}
            </Link>
          </div>
          <div className="mt-1 flex flex-wrap gap-4 text-xs font-semibold text-[var(--chip-ink)] lg:gap-[22px] lg:text-[13.5px]">
            <span className="flex items-center gap-1.5 lg:gap-[7px]">
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[var(--success)] text-[11px] text-white">☪</span>
              {t("hero.trustHalal")}
            </span>
            <span className="flex items-center gap-1.5 lg:gap-[7px]">
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#E8A50C] text-[11px] text-white">✈</span>
              {t("hero.trustShipping")}
            </span>
            <span className="flex items-center gap-1.5 lg:gap-[7px]">
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[var(--body)] text-[11px] text-white">🔒</span>
              {t("hero.trustPayment")}
            </span>
          </div>
        </div>

        {/* Desktop hero image — large rounded square in a white frame */}
        <div className="relative hidden w-full lg:block">
          <div className="h-[600px] w-full rounded-[36px] bg-white p-3 shadow-[var(--shadow-ring)]">
            <Image
              src={heroImg}
              alt=""
              width={700}
              height={600}
              priority
              className="h-full w-full rounded-[26px] object-cover"
            />
          </div>
          <span className="font-display absolute top-[18px] -end-2 rotate-[8deg] rounded-full bg-[var(--accent)] px-[18px] py-3 text-base font-extrabold text-[var(--accent-ink)] shadow-[0_4px_10px_rgba(58,36,32,.15)]">
            {t("hero.sticker")}
          </span>
          <span className="absolute bottom-[26px] -start-3.5 flex flex-col gap-0.5 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_22px_rgba(58,36,32,.14)]">
            <span className="text-xs font-semibold text-[var(--muted)]">
              {t("hero.heroCardName")}
            </span>
            <span className="font-display text-xl font-extrabold text-[var(--primary)]">
              {formatPrice(7, locale)}
            </span>
          </span>
        </div>
      </section>

      <div className="scallop" style={{ "--scallop-top": "var(--surface)", "--scallop-bottom": "#fff" } as React.CSSProperties} />

      {/* ============ CATEGORIES + PRODUCTS ============ */}
      <section id="shop" className="scroll-mt-4 bg-white px-5 pb-8 pt-6 lg:px-[72px] lg:pb-[52px] lg:pt-11">
        <div className="mb-4 flex flex-wrap items-baseline gap-3.5 lg:mb-6">
          <h2 className="m-0 text-[22px] font-extrabold text-[var(--ink)] lg:text-3xl">
            {t("home.categoriesTitle")}
          </h2>
          <span className="hidden text-sm text-[var(--muted-2)] lg:inline">
            {t("home.categoriesSub", { price: formatPrice(FROM_PRICE, locale) })}
          </span>
        </div>

        <div className="flex gap-2.5 lg:grid lg:grid-cols-3 lg:gap-[22px]">
          {categoryTiles.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(category === c.key ? null : c.key)}
              className={`relative h-[110px] flex-1 cursor-pointer overflow-hidden rounded-2xl border-0 p-0 text-start lg:aspect-square lg:h-auto lg:rounded-[20px] ${
                category === c.key ? "ring-4 ring-[var(--primary)]" : ""
              }`}
              style={c.img ? undefined : { background: "var(--accent)" }}
            >
              {c.img && (
                <Image
                  src={c.img}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 33vw, 33vw"
                  className="object-cover"
                />
              )}
              <span
                className="absolute inset-0"
                style={{
                  background: c.img
                    ? "linear-gradient(180deg, transparent 40%, rgba(58,36,32,.72))"
                    : "linear-gradient(180deg, transparent 40%, rgba(122,74,0,.55))",
                }}
              />
              {!c.img && (
                <span className="absolute top-3.5 end-3.5 rounded-full bg-white px-[11px] py-[5px] text-[11.5px] font-bold text-[var(--accent-ink-2)]">
                  {t("home.photoComing")}
                </span>
              )}
              <span className="font-display absolute bottom-2.5 start-3 text-[15px] font-bold text-white lg:bottom-4 lg:start-5 lg:text-2xl lg:font-extrabold">
                {t(`nav.${c.key}`)}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-3.5 mt-7 flex items-baseline gap-3.5 lg:mb-6 lg:mt-11">
          <h2 className="m-0 text-[22px] font-extrabold text-[var(--ink)] lg:text-3xl">
            {t("home.favouritesTitle")}
          </h2>
          <button
            type="button"
            onClick={() => setCategory(null)}
            className="ms-auto cursor-pointer text-[13px] font-semibold text-[var(--primary)] lg:text-[14.5px]"
          >
            {t("home.seeAll")}
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="text-[var(--muted-2)]">{t("home.noProducts")}</p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-[22px]">
            {filtered.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="scallop" style={{ "--scallop-top": "#fff", "--scallop-bottom": "var(--story-bg)" } as React.CSSProperties} />

      {/* ============ STORY ============ */}
      <section className="grid items-center gap-6 bg-[var(--story-bg)] px-5 py-7 lg:grid-cols-[340px_1fr] lg:gap-12 lg:px-[72px] lg:py-[52px]">
        <div className="relative hidden lg:block">
          {siteImages.jana ? (
            <Image
              src={siteImages.jana}
              alt="Jana"
              width={300}
              height={340}
              className="h-[340px] w-[300px] rounded-t-[150px] rounded-b-3xl object-cover"
            />
          ) : (
            <div className="grid h-[340px] w-[300px] place-items-center rounded-t-[150px] rounded-b-3xl bg-[#D8E6D2] p-5 text-center text-[13px] font-semibold text-[var(--success)]">
              {t("story.photoPlaceholder")}
            </div>
          )}
          <span className="font-display absolute -bottom-2.5 -end-2.5 -rotate-[4deg] rounded-full bg-[var(--accent)] px-4 py-2.5 font-extrabold text-[var(--accent-ink)]">
            {t("story.sticker")}
          </span>
        </div>
        <div className="flex flex-col items-start gap-2.5 lg:gap-4">
          <span className="text-[11.5px] font-bold tracking-[0.1em] text-[var(--success)] lg:text-[12.5px]">
            {t("story.label")}
          </span>
          <h2 className="m-0 text-xl font-extrabold leading-tight text-[var(--ink)] lg:text-[34px] lg:leading-[1.15]">
            {t("story.quote")}
          </h2>
          <p className="m-0 hidden max-w-[62ch] text-[16.5px] leading-[1.7] text-[#5C4A38] lg:block">
            {t("story.body")}
          </p>
          <Link href="/about" className="btn-trust text-sm no-underline lg:text-base lg:px-[26px]">
            {t("story.cta")}
          </Link>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="grid items-center gap-5 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-8 lg:grid-cols-[1fr_auto] lg:gap-10 lg:px-[72px] lg:py-11">
        <div>
          <h3 className="m-0 mb-1.5 text-xl font-extrabold text-[var(--ink)] lg:text-2xl">
            {t("newsletter.title")}
          </h3>
          <p className="m-0 text-[14.5px] text-[var(--muted)]">
            {t("newsletter.sub")}
          </p>
        </div>
        <form
          className="flex flex-col gap-2.5 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder={t("newsletter.placeholder")}
            className="input-pill w-full sm:w-[280px]"
          />
          <button type="submit" className="btn-primary text-base lg:px-[26px]">
            {t("newsletter.button")}
          </button>
        </form>
      </section>

      <FloatingCart />
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import { localized } from "@/types";
import { formatPrice } from "@/lib/weights";
import type { Locale } from "@/i18n/routing";

export default function FloatingCart() {
  const locale = useLocale() as Locale;
  const t = useTranslations("cart");
  const { items, isOpen, toggleCart, removeFromCart, updateQuantity, _hasHydrated } =
    useCartStore();

  if (!_hasHydrated || !isOpen) return null;

  const subtotal = items.reduce(
    (sum, i) => sum + i.unit_price_eur * i.quantity,
    0
  );

  return (
    <aside
      aria-label={t("title")}
      className="fixed top-0 bottom-0 end-0 z-40 flex w-[340px] max-w-full flex-col overflow-y-auto border-s border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-float)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display m-0 text-xl font-extrabold text-[var(--ink)]">
          {t("title")}
        </h2>
        <button
          type="button"
          onClick={toggleCart}
          aria-label="Close"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white text-[var(--body)] shadow-[0_1px_3px_rgba(58,36,32,.12)]"
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-[var(--muted)]">{t("empty")}</p>
      ) : (
        <>
          <ul className="m-0 list-none space-y-3 p-0">
            {items.map((item) => (
              <li
                key={item.cartItemId}
                className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-white p-3"
              >
                <div>
                  <p className="font-display m-0 text-[15px] font-bold text-[var(--ink)]">
                    {localized(item.name, locale)}
                  </p>
                  <p className="m-0 text-[12.5px] text-[var(--muted)]">
                    {item.weightG} g ·{" "}
                    <span className="font-semibold text-[var(--primary)]">
                      {formatPrice(item.unit_price_eur, locale)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="−"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[var(--surface-2)] font-bold text-[var(--body)]"
                  >
                    −
                  </button>
                  <span className="min-w-5 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="+"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[var(--surface-2)] font-bold text-[var(--body)]"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    aria-label={t("remove")}
                    className="ms-1 cursor-pointer text-[var(--error)]"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-4 flex justify-between font-semibold text-[var(--ink)]">
            <span>{t("subtotal")}</span>
            <span className="font-display text-lg font-extrabold text-[var(--primary)]">
              {formatPrice(subtotal, locale)}
            </span>
          </p>

          <Link
            href="/checkout"
            onClick={toggleCart}
            className="btn-primary mt-4 w-full text-[17px] no-underline"
          >
            {t("checkout")}
          </Link>
        </>
      )}
    </aside>
  );
}

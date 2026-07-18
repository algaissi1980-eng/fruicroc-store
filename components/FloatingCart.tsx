"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import { localized } from "@/types";
import { formatEur } from "@/lib/pricing";
import type { Locale } from "@/i18n/routing";

export default function FloatingCart() {
  const locale = useLocale() as Locale;
  const t = useTranslations("cart");
  const { items, isOpen, toggleCart, removeFromCart, updateQuantity, _hasHydrated } =
    useCartStore();

  if (!_hasHydrated || !isOpen) return null;

  const subtotal = items.reduce(
    (sum, i) => sum + i.price_excl_vat * i.quantity,
    0
  );

  return (
    <aside
      aria-label={t("title")}
      className="fixed top-0 bottom-0 end-0 z-40 w-80 max-w-full overflow-y-auto border-s border-[var(--border)] bg-[var(--bg)] p-4 shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("title")}</h2>
        <button type="button" onClick={toggleCart} aria-label="Close">
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-[var(--ink-600)]">{t("empty")}</p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.cartItemId}
                className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2"
              >
                <div>
                  <p>{localized(item.name, locale)}</p>
                  <p className="text-sm text-[var(--ink-600)]">
                    {formatEur(item.price_excl_vat, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    aria-label={t("remove")}
                    className="text-[var(--danger)]"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-4 flex justify-between font-semibold">
            <span>{t("subtotal")}</span>
            <span>{formatEur(subtotal, locale)}</span>
          </p>

          <Link
            href="/checkout"
            onClick={toggleCart}
            className="mt-4 block rounded bg-[var(--accent)] px-4 py-2 text-center text-white"
          >
            {t("checkout")}
          </Link>
        </>
      )}
    </aside>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { computeTotals, formatEur } from "@/lib/pricing";
import { localized } from "@/types";
import type {
  CountryCode,
  PaymentMethod,
  ShippingZone,
  VatRate,
} from "@/types";
import type { Locale } from "@/i18n/routing";

export default function CheckoutPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { items, clearCart, _hasHydrated } = useCartStore();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [rates, setRates] = useState<VatRate[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "" as CountryCode | "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("bank_transfer");

  useEffect(() => {
    (async () => {
      const [{ data: z }, { data: r }, { data: auth }] = await Promise.all([
        supabase.from("shipping_zones").select("*").eq("active", true),
        supabase.from("vat_rates").select("*"),
        supabase.auth.getUser(),
      ]);
      setZones((z as ShippingZone[]) ?? []);
      setRates((r as VatRate[]) ?? []);
      setUserId(auth.user?.id ?? null);
      if (auth.user?.email) {
        setForm((f) => ({ ...f, email: f.email || auth.user!.email! }));
      }
    })();
  }, []);

  const totals = useMemo(
    () =>
      form.country
        ? computeTotals(items, zones, rates, form.country as CountryCode)
        : null,
    [items, zones, rates, form.country]
  );

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error(t("loginRequired"));
      router.push("/login");
      return;
    }
    if (!totals || !form.country || items.length === 0 || submitting) return;

    setSubmitting(true);
    try {
      // 1. Reserve stock atomically
      const { error: stockError } = await supabase.rpc(
        "handle_checkout_inventory",
        {
          p_items: items.map((i) => ({
            product_id: i.id,
            quantity: i.quantity,
          })),
        }
      );
      if (stockError) throw stockError;

      // 2. Create the order (pending_payment)
      const reference = `FRC-${Date.now().toString(36).toUpperCase()}`;
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || null,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_postal_code: form.postalCode,
          shipping_country: form.country,
          shipping_cost_eur: totals.shipping,
          subtotal_excl_vat_eur: totals.subtotalExclVat,
          vat_rate_percent: totals.vatRatePercent,
          vat_amount_eur: totals.vatAmount,
          total_eur: totals.total,
          status: "pending_payment",
          payment_method: paymentMethod,
          bank_transfer_reference:
            paymentMethod === "bank_transfer" ? reference : null,
          notes: form.notes || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      // 3. Order items (price snapshot)
      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          quantity: i.quantity,
          price_excl_vat: i.price_excl_vat,
        }))
      );
      if (itemsError) throw itemsError;

      clearCart();
      router.push(`/success?order=${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error(tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!_hasHydrated) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <form onSubmit={placeOrder} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="font-semibold">{t("contact")}</legend>
          <input required placeholder={t("name")} value={form.name} onChange={set("name")} className="w-full rounded border border-[var(--border)] p-2" />
          <input required type="tel" placeholder={t("phone")} value={form.phone} onChange={set("phone")} className="w-full rounded border border-[var(--border)] p-2" />
          <input type="email" placeholder={t("email")} value={form.email} onChange={set("email")} className="w-full rounded border border-[var(--border)] p-2" />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-semibold">{t("shippingAddress")}</legend>
          <input required placeholder={t("address")} value={form.address} onChange={set("address")} className="w-full rounded border border-[var(--border)] p-2" />
          <div className="flex gap-3">
            <input required placeholder={t("city")} value={form.city} onChange={set("city")} className="w-full rounded border border-[var(--border)] p-2" />
            <input required placeholder={t("postalCode")} value={form.postalCode} onChange={set("postalCode")} className="w-32 rounded border border-[var(--border)] p-2" />
          </div>
          <select required value={form.country} onChange={set("country")} className="w-full rounded border border-[var(--border)] p-2">
            <option value="" disabled>
              {t("selectCountry")}
            </option>
            {zones.map((z) => (
              <option key={z.country_code} value={z.country_code}>
                {new Intl.DisplayNames([locale], { type: "region" }).of(z.country_code)}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-semibold">{t("payment")}</legend>
          {/* PayPal — integration deferred, disabled stub */}
          <label className="flex items-center gap-2 opacity-50">
            <input type="radio" name="payment" disabled />
            {t("paypal")} — {t("paypalSoon")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "bank_transfer"}
              onChange={() => setPaymentMethod("bank_transfer")}
            />
            <span>
              {t("bankTransfer")}
              <small className="block text-[var(--ink-600)]">
                {t("bankTransferDesc")}
              </small>
            </span>
          </label>
        </fieldset>

        <textarea placeholder={t("notes")} value={form.notes} onChange={set("notes")} className="w-full rounded border border-[var(--border)] p-2" />

        {totals && (
          <dl className="space-y-1 border-t border-[var(--border)] pt-3">
            <div className="flex justify-between">
              <dt>{t("shipping")}</dt>
              <dd>{formatEur(totals.shipping, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("vat", { rate: totals.vatRatePercent })}</dt>
              <dd>{formatEur(totals.vatAmount, locale)}</dd>
            </div>
            <div className="flex justify-between font-bold">
              <dt>{t("total")}</dt>
              <dd>{formatEur(totals.total, locale)}</dd>
            </div>
          </dl>
        )}

        <button
          type="submit"
          disabled={submitting || items.length === 0 || !form.country}
          className="w-full rounded bg-[var(--accent)] px-4 py-3 text-white disabled:opacity-50"
        >
          {t("placeOrder")}
        </button>
      </form>

      <ul className="mt-8 space-y-1 text-sm text-[var(--ink-600)]">
        {items.map((i) => (
          <li key={i.cartItemId}>
            {i.quantity} × {localized(i.name, locale)}
          </li>
        ))}
      </ul>
    </div>
  );
}

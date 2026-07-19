"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { computeTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/weights";
import { localized } from "@/types";
import type {
  CountryCode,
  PaymentMethod,
  ShippingZone,
  VatRate,
} from "@/types";
import type { Locale } from "@/i18n/routing";

const inputCls =
  "input-pill w-full";

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

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(
    null
  );

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
        ? computeTotals(
            items,
            zones,
            rates,
            form.country as CountryCode,
            promo?.discount ?? 0
          )
        : null,
    [items, zones, rates, form.country, promo]
  );

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const subtotal = items.reduce(
      (sum, i) => sum + i.price_excl_vat * i.quantity,
      0
    );
    const { data, error } = await supabase.rpc("validate_promo_code", {
      p_code: code,
      p_subtotal: subtotal,
    });
    if (error || !data?.valid) {
      setPromo(null);
      toast.error(
        data?.reason === "min"
          ? t("promoMin", { min: data.min })
          : t("promoInvalid")
      );
    } else {
      setPromo({ code, discount: Number(data.discount) });
      toast.success(`${code} −${data.discount}%`);
    }
  };

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
    let orderId: string | null = null;
    try {
      // 1. Create the order (pending_payment)
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
          promo_code: promo?.code ?? null,
          discount_eur: totals.discount,
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
      orderId = order.id;

      // 2. Order items (price + weight snapshot)
      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          weight_g: i.weightG,
          quantity: i.quantity,
          price_excl_vat: i.price_excl_vat,
        }))
      );
      if (itemsError) throw itemsError;

      // 3. Reserve stock atomically — LAST, so a failure can roll back the order
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

      if (promo) {
        await supabase.rpc("use_promo_code", { p_code: promo.code });
      }

      clearCart();
      router.push(`/success?order=${order.id}`);
    } catch (err) {
      console.error(err);
      // Roll back the order if stock reservation (or items insert) failed
      if (orderId) {
        await supabase.from("orders").delete().eq("id", orderId);
      }
      toast.error(tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!_hasHydrated) return null;

  return (
    <div className="mx-auto max-w-lg px-5 py-7">
      <h1 className="m-0 mb-6 text-[27px] font-extrabold text-[var(--ink)]">
        {t("title")}
      </h1>

      <form onSubmit={placeOrder} className="flex flex-col gap-6">
        <fieldset className="m-0 flex flex-col gap-3 rounded-[20px] border border-[var(--border)] bg-white p-5">
          <legend className="font-display px-2 text-[15px] font-bold text-[var(--ink)]">
            {t("contact")}
          </legend>
          <input required placeholder={t("name")} value={form.name} onChange={set("name")} className={inputCls} />
          <input required type="tel" placeholder={t("phone")} value={form.phone} onChange={set("phone")} className={inputCls} />
          <input type="email" placeholder={t("email")} value={form.email} onChange={set("email")} className={inputCls} />
        </fieldset>

        <fieldset className="m-0 flex flex-col gap-3 rounded-[20px] border border-[var(--border)] bg-white p-5">
          <legend className="font-display px-2 text-[15px] font-bold text-[var(--ink)]">
            {t("shippingAddress")}
          </legend>
          <input required placeholder={t("address")} value={form.address} onChange={set("address")} className={inputCls} />
          <div className="flex gap-3">
            <input required placeholder={t("city")} value={form.city} onChange={set("city")} className={inputCls} />
            <input required placeholder={t("postalCode")} value={form.postalCode} onChange={set("postalCode")} className="input-pill w-36" />
          </div>
          <select required value={form.country} onChange={set("country")} className={inputCls}>
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

        <fieldset className="m-0 flex flex-col gap-2.5 rounded-[20px] border border-[var(--border)] bg-white p-5">
          <legend className="font-display px-2 text-[15px] font-bold text-[var(--ink)]">
            {t("payment")}
          </legend>
          {/* PayPal — integration deferred, disabled stub */}
          <label className="flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] p-3.5 opacity-50">
            <input type="radio" name="payment" disabled className="accent-[var(--primary)]" />
            <span className="font-semibold text-[var(--body)]">
              {t("paypal")}
              <small className="block font-normal text-[var(--muted)]">
                {t("paypalSoon")}
              </small>
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 transition-colors ${
              paymentMethod === "bank_transfer"
                ? "border-[var(--primary)] bg-[var(--surface)]"
                : "border-[var(--border)]"
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "bank_transfer"}
              onChange={() => setPaymentMethod("bank_transfer")}
              className="accent-[var(--primary)]"
            />
            <span className="font-semibold text-[var(--body)]">
              {t("bankTransfer")}
              <small className="block font-normal text-[var(--muted)]">
                {t("bankTransferDesc")}
              </small>
            </span>
          </label>
        </fieldset>

        <div className="flex gap-2.5">
          <input
            placeholder={t("promoPlaceholder")}
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            className="input-pill w-full font-mono uppercase"
          />
          <button type="button" onClick={applyPromo} className="btn-secondary shrink-0">
            {t("promoApply")}
          </button>
        </div>

        <textarea
          placeholder={t("notes")}
          value={form.notes}
          onChange={set("notes")}
          rows={3}
          className="w-full rounded-[20px] border-2 border-[var(--border-input)] bg-white p-4 font-[family-name:var(--font-body)] text-[15px] text-[var(--ink)] outline-none focus:border-[var(--muted)]"
        />

        {totals && (
          <dl className="m-0 flex flex-col gap-1.5 rounded-[20px] border border-[var(--border)] bg-white p-5">
            {totals.discount > 0 && promo && (
              <div className="flex justify-between text-[var(--success)]">
                <dt>
                  {promo.code} (−{promo.discount}%)
                </dt>
                <dd className="m-0">−{formatPrice(totals.discount, locale)}</dd>
              </div>
            )}
            <div className="flex justify-between text-[var(--body)]">
              <dt>{t("shipping")}</dt>
              <dd className="m-0">{formatPrice(totals.shipping, locale)}</dd>
            </div>
            <div className="flex justify-between text-[var(--body)]">
              <dt>{t("vat", { rate: totals.vatRatePercent })}</dt>
              <dd className="m-0">{formatPrice(totals.vatAmount, locale)}</dd>
            </div>
            <div className="mt-1 flex justify-between border-t border-[var(--border)] pt-2 font-bold text-[var(--ink)]">
              <dt>{t("total")}</dt>
              <dd className="font-display m-0 text-xl font-extrabold text-[var(--primary)]">
                {formatPrice(totals.total, locale)}
              </dd>
            </div>
          </dl>
        )}

        <button
          type="submit"
          disabled={submitting || items.length === 0 || !form.country}
          className="btn-primary w-full py-4 text-lg"
        >
          {t("placeOrder")}
        </button>
      </form>

      <ul className="mt-8 list-none space-y-1 p-0 text-sm text-[var(--muted)]">
        {items.map((i) => (
          <li key={i.cartItemId}>
            {i.quantity} × {localized(i.name, locale)} · {i.weightG} g
          </li>
        ))}
      </ul>
    </div>
  );
}

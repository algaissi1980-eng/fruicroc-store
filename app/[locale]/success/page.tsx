"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Order, StoreSettings } from "@/types";

function SuccessContent() {
  const t = useTranslations("success");
  const params = useSearchParams();
  const orderId = params.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const [{ data: o }, { data: s }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("store_settings").select("*").eq("id", 1).single(),
      ]);
      setOrder(o as Order);
      setSettings(s as StoreSettings);
    })();
  }, [orderId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
      {order && (
        <p className="mb-6 text-[var(--ink-600)]">
          {t("orderNumber", { number: order.id.slice(0, 8).toUpperCase() })}
        </p>
      )}

      {order?.payment_method === "bank_transfer" && (
        <section className="mb-8 rounded border border-[var(--border)] p-4 text-start">
          <h2 className="mb-2 font-semibold">{t("bankInstructions")}</h2>
          <p className="mb-4 text-sm text-[var(--ink-600)]">{t("bankIntro")}</p>
          <dl className="space-y-2 text-sm">
            {settings?.bank_account_holder && (
              <div>
                <dt className="font-medium">{t("accountHolder")}</dt>
                <dd>{settings.bank_account_holder}</dd>
              </div>
            )}
            {settings?.bank_iban && (
              <div>
                <dt className="font-medium">IBAN</dt>
                <dd className="font-mono">{settings.bank_iban}</dd>
              </div>
            )}
            {settings?.bank_bic && (
              <div>
                <dt className="font-medium">BIC</dt>
                <dd className="font-mono">{settings.bank_bic}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium">{t("reference")}</dt>
              <dd className="font-mono font-bold">
                {order.bank_transfer_reference}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <Link href="/" className="underline">
        {t("backHome")}
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}

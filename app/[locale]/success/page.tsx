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
    <div className="mx-auto max-w-lg px-5 py-12 text-center">
      <h1 className="m-0 mb-2 text-[27px] font-extrabold text-[var(--ink)]">
        {t("title")} 🎉
      </h1>
      {order && (
        <p className="mb-6 font-mono text-[var(--muted)]">
          {t("orderNumber", { number: order.id.slice(0, 8).toUpperCase() })}
        </p>
      )}

      {order?.payment_method === "bank_transfer" && (
        <section className="mb-8 rounded-[20px] border border-[var(--border)] bg-white p-6 text-start shadow-[var(--shadow-card)]">
          <h2 className="m-0 mb-2 text-lg font-bold text-[var(--ink)]">
            {t("bankInstructions")}
          </h2>
          <p className="mb-4 text-sm text-[var(--muted)]">{t("bankIntro")}</p>
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

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "fruicroc-cookie-consent";

export type CookieChoice = "all" | "essential";

export function getCookieConsent(): CookieChoice | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(STORAGE_KEY) as CookieChoice) || null;
}

export default function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  const choose = (choice: CookieChoice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
    // Analytics / non-essential scripts must check getCookieConsent() === 'all'
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-5 start-1/2 z-50 flex w-[720px] max-w-[92%] -translate-x-1/2 rtl:translate-x-1/2 flex-col items-center gap-4 rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-float)] sm:flex-row sm:px-6"
    >
      <Image
        src="/logo.png"
        alt=""
        width={44}
        height={44}
        className="hidden h-11 w-11 rounded-full sm:block"
      />
      <p className="m-0 flex-1 text-[13.5px] leading-relaxed text-[var(--body)]">
        <b className="text-[var(--ink)]">{t("title")}</b> {t("message")}{" "}
        <Link href="/legal/confidentialite">{t("policyLink")}</Link>.
      </p>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => choose("essential")}
          className="cursor-pointer px-4 py-3 text-[13.5px] font-semibold text-[var(--muted)]"
        >
          {t("essentials")}
        </button>
        <button
          type="button"
          onClick={() => choose("all")}
          className="btn-trust px-5 py-3 text-[13.5px]"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}

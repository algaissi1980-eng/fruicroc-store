"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "fruicroc-cookie-consent";

export type CookieChoice = "accepted" | "rejected";

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
    // Analytics / non-essential scripts must check getCookieConsent() === 'accepted'
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-0 start-0 end-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <p className="mb-3 text-sm">
        {t("message")}{" "}
        <Link href="/legal/confidentialite" className="underline">
          {t("policy")}
        </Link>
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="rounded bg-[var(--accent)] px-4 py-2 text-white"
        >
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="rounded border border-[var(--border)] px-4 py-2"
        >
          {t("reject")}
        </button>
      </div>
    </div>
  );
}

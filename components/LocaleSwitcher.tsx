"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = { fr: "FR", en: "EN", ar: "AR" };

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const switchTo = (l: (typeof routing.locales)[number]) => {
    setOpen(false);
    router.replace(pathname, { locale: l });
  };

  return (
    <>
      {/* Desktop: 3-state pill track (design 1a) */}
      <div
        role="group"
        aria-label="Language"
        className="hidden rounded-full bg-[var(--surface-2)] p-[3px] text-[12.5px] font-semibold sm:flex"
      >
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            aria-pressed={l === locale}
            className={`cursor-pointer rounded-full px-3 py-[5px] transition-colors ${
              l === locale
                ? "bg-white text-[var(--primary)] shadow-[0_1px_3px_rgba(58,36,32,.15)]"
                : "text-[var(--muted)]"
            }`}
          >
            {LABELS[l]}
          </button>
        ))}
      </div>

      {/* Mobile: compact "EN ▾" button (design 1b) */}
      <div ref={ref} className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Language"
          className="cursor-pointer rounded-full bg-white px-2.5 py-1.5 text-xs font-bold text-[var(--primary)] shadow-[0_1px_3px_rgba(58,36,32,.12)]"
        >
          {LABELS[locale]} ▾
        </button>
        {open && (
          <div className="absolute end-0 top-9 z-50 w-24 rounded-2xl border border-[var(--border)] bg-white p-1 shadow-[var(--shadow-float)]">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchTo(l)}
                className={`block w-full cursor-pointer rounded-xl px-3 py-2 text-start text-[13px] font-bold ${
                  l === locale
                    ? "bg-[var(--surface-2)] text-[var(--primary)]"
                    : "text-[var(--body)]"
                }`}
              >
                {LABELS[l]}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

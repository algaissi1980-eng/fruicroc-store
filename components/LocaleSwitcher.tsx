"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = { fr: "FR", en: "EN", ar: "AR" };

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex rounded-full bg-[var(--surface-2)] p-[3px] text-[12.5px] font-semibold"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-pressed={l === locale}
          className={`rounded-full px-3 py-[5px] transition-colors ${
            l === locale
              ? "bg-white text-[var(--primary)] shadow-[0_1px_3px_rgba(58,36,32,.15)]"
              : "text-[var(--muted)]"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}

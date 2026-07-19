"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { localized, type LocalizedString } from "@/types";
import type { Locale } from "@/i18n/routing";

export default function AnnouncementBar() {
  const locale = useLocale() as Locale;
  const t = useTranslations("announcement");
  const [announcement, setAnnouncement] = useState<LocalizedString | null>(null);

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("announcement")
      .eq("id", 1)
      .single()
      .then(({ data }) =>
        setAnnouncement((data?.announcement as LocalizedString) ?? null)
      );
  }, []);

  // Admin-set announcement wins; otherwise the default shipping message
  const text = localized(announcement, locale) || t("default");

  return (
    <p className="m-0 bg-[var(--primary)] px-6 py-2 text-center text-[13.5px] font-medium tracking-[0.01em] text-[var(--on-primary-bar)]">
      {text}
    </p>
  );
}

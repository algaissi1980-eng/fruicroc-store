import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

// EU legal pages — placeholder structure.
// Final texts (client/lawyer-provided) will replace the placeholder.
const SLUG_TO_KEY: Record<string, string> = {
  "mentions-legales": "mentions",
  cgv: "cgv",
  confidentialite: "privacy",
  retractation: "withdrawal",
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(SLUG_TO_KEY).map((slug) => ({ locale, slug }))
  );
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const key = SLUG_TO_KEY[slug];
  if (!key) notFound();

  const t = await getTranslations("legal");

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{t(key)}</h1>
      <p className="text-[var(--ink-600)]">{t("placeholder")}</p>
    </article>
  );
}

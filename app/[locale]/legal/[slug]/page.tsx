import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { legalContent, type LegalKey } from "@/content/legalContent";

// EU legal pages — DRAFT texts pending client/lawyer review
// ([BRACKETED] placeholders in content/legalContent.ts must be filled).
const SLUG_TO_KEY: Record<string, LegalKey> = {
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
  const body = legalContent[key][locale as Locale];

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{t(key)}</h1>
      {body.split(/\n\n+/).map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="mb-2 mt-6 text-lg font-semibold">
            {block.slice(3)}
          </h2>
        ) : (
          <p key={i} className="mb-4 leading-relaxed">
            {block}
          </p>
        )
      )}
    </article>
  );
}

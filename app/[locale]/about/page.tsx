import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">✨ {t("title")}</h1>
      {paragraphs.map((p, i) => (
        <p key={i} className="mb-4 leading-relaxed">
          {p}
        </p>
      ))}
      <p className="mt-6 font-semibold">{t("signature")}</p>
    </article>
  );
}

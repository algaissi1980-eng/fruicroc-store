import { getTranslations, setRequestLocale } from "next-intl/server";

// Jana's letter — built on the design foundations (story-section language:
// leaf green, arch photo, accent sticker). Dedicated design round pending.
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tStory = await getTranslations("story");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <div className="bg-[var(--story-bg)]">
      <div className="mx-auto grid max-w-4xl items-start gap-8 px-5 py-10 lg:grid-cols-[300px_1fr] lg:gap-12 lg:py-16">
        {/* Arch photo placeholder (awaiting Jana's real photo) */}
        <div className="relative mx-auto lg:mx-0">
          <div className="grid h-[300px] w-[260px] place-items-center rounded-t-[130px] rounded-b-3xl bg-[#D8E6D2] p-5 text-center text-[13px] font-semibold text-[var(--success)] lg:h-[340px] lg:w-[300px] lg:rounded-t-[150px]">
            {tStory("photoPlaceholder")}
          </div>
          <span className="font-display absolute -bottom-2.5 -end-2.5 -rotate-[4deg] rounded-full bg-[var(--accent)] px-4 py-2.5 font-extrabold text-[var(--accent-ink)] shadow-[0_4px_10px_rgba(58,36,32,.15)]">
            {tStory("sticker")}
          </span>
        </div>

        <article className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] lg:p-10">
          <span className="text-[12.5px] font-bold tracking-[0.1em] text-[var(--success)]">
            {tStory("label")}
          </span>
          <h1 className="m-0 mb-6 mt-2 text-[27px] font-extrabold leading-tight text-[var(--ink)] lg:text-[34px]">
            ✨ {t("title")}
          </h1>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="m-0 mb-4 text-[15px] leading-[1.7] text-[#5C4A38] lg:text-[16.5px]"
            >
              {p}
            </p>
          ))}
          <p className="font-display m-0 mt-7 text-xl font-bold text-[var(--primary)]">
            {t("signature")}
          </p>
        </article>
      </div>
    </div>
  );
}

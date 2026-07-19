import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tLegal = useTranslations("legal");
  const tc = useTranslations("common");

  return (
    <footer className="bg-[var(--ink)] px-5 py-10 text-[13.5px] leading-8 text-[var(--footer-text)] lg:px-[72px]">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-[60px]">
        <div className="max-w-[260px]">
          <p className="font-display m-0 mb-2 text-xl font-extrabold text-[var(--accent)]">
            {tc("brand")}
          </p>
          {t("tagline")}
        </div>
        <div>
          <b className="text-white">{t("shop")}</b>
          <br />
          <Link href="/?category=fruits" className="text-[var(--footer-text)] no-underline hover:text-white">{tNav("fruits")}</Link>
          <br />
          <Link href="/?category=vegetables" className="text-[var(--footer-text)] no-underline hover:text-white">{tNav("vegetables")}</Link>
          <br />
          <Link href="/?category=candy" className="text-[var(--footer-text)] no-underline hover:text-white">{tNav("candy")}</Link>
        </div>
        <div>
          <b className="text-white">{t("help")}</b>
          <br />
          {t("helpShipping")}
          <br />
          {t("helpPayment")}
          <br />
          {t("helpContact")}
        </div>
        <div>
          <b className="text-white">{t("legal")}</b>
          <br />
          <Link href="/legal/cgv" className="text-[var(--footer-text)] no-underline hover:text-white">{tLegal("cgv")}</Link>
          <br />
          <Link href="/legal/confidentialite" className="text-[var(--footer-text)] no-underline hover:text-white">{tLegal("privacy")}</Link>
          <br />
          <Link href="/legal/mentions-legales" className="text-[var(--footer-text)] no-underline hover:text-white">{tLegal("mentions")}</Link>
          <br />
          <Link href="/legal/retractation" className="text-[var(--footer-text)] no-underline hover:text-white">{tLegal("withdrawal")}</Link>
        </div>
        <div className="lg:ms-auto lg:text-end">
          {t("securePayment")}
          <br />
          <span className="mt-1.5 inline-flex gap-2">
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#25396B]">
              PayPal
            </span>
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)]">
              {t("bankChip")}
            </span>
          </span>
        </div>
      </div>
      <p className="mt-8 mb-0 text-xs opacity-70">
        © {new Date().getFullYear()} {tc("brand")} — {t("rights")}
      </p>
    </footer>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-12 border-t border-[var(--border)] px-4 py-8 text-sm text-[var(--ink-600)]">
      <nav className="flex flex-wrap gap-4">
        <Link href="/legal/mentions-legales">{t("legal.mentions")}</Link>
        <Link href="/legal/cgv">{t("legal.cgv")}</Link>
        <Link href="/legal/confidentialite">{t("legal.privacy")}</Link>
        <Link href="/legal/retractation">{t("legal.withdrawal")}</Link>
      </nav>
      <p className="mt-4">
        © {new Date().getFullYear()} Fruicroc — {t("footer.rights")}
      </p>
    </footer>
  );
}

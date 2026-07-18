"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import LocaleSwitcher from "./LocaleSwitcher";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const t = useTranslations("nav");
  const items = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Fruicroc" width={40} height={40} priority />
        <span className="font-bold">Fruicroc</span>
      </Link>

      <nav className="flex items-center gap-4">
        <Link href="/">{t("home")}</Link>
        <Link href="/about">{t("about")}</Link>
        <Link href="/orders">{t("orders")}</Link>
        <button type="button" onClick={toggleCart} aria-label="Cart">
          🛒 {count > 0 && <span>{count}</span>}
        </button>
        <LocaleSwitcher />
      </nav>
    </header>
  );
}

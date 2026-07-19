"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import LocaleSwitcher from "./LocaleSwitcher";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";

const NAV_LINKS = [
  { key: "shop", href: "/" },
  { key: "fruits", href: "/?category=fruits" },
  { key: "vegetables", href: "/?category=vegetables" },
  { key: "candy", href: "/?category=candy" },
  { key: "story", href: "/about" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-4 px-4 py-3 lg:gap-7 lg:px-12 lg:py-4">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface-2)] text-lg text-[var(--body)] lg:hidden"
        >
          ☰
        </button>

        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image
            src="/logo.png"
            alt={tc("brand")}
            width={52}
            height={52}
            priority
            className="h-10 w-10 rounded-full shadow-[0_1px_4px_rgba(58,36,32,.18)] lg:h-[52px] lg:w-[52px]"
          />
          <span className="font-display text-[17px] font-extrabold leading-none text-[var(--primary)] lg:text-[22px]">
            {tc("brandFirst")}{" "}
            <span className="text-[#E8A50C]">{tc("brandSecond")}</span>
          </span>
        </Link>

        <nav className="ms-auto hidden gap-6 text-[15px] font-medium lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="text-[var(--body)] no-underline hover:text-[var(--primary)]"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3 lg:ms-0">
          <LocaleSwitcher />
          <UserMenu />
          <CartButton />
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-[var(--border)] px-4 py-3 lg:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 font-medium text-[var(--body)] no-underline hover:bg-[var(--surface-2)]"
            >
              {t(l.key)}
            </Link>
          ))}
          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 font-medium text-[var(--body)] no-underline hover:bg-[var(--surface-2)]"
          >
            {t("orders")}
          </Link>
        </nav>
      )}
    </header>
  );
}

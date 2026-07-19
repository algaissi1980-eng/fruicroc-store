"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import LocaleSwitcher from "./LocaleSwitcher";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";

const NAV_LINKS = [
  { key: "shop", href: "/#shop" },
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
      <div className="flex items-center gap-2 px-3 py-3 lg:gap-7 lg:px-12 lg:py-4">
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
          <span className="font-display whitespace-nowrap text-[16px] font-extrabold leading-none text-[var(--primary)] lg:text-[22px]">
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

        <div className="ms-auto flex items-center gap-2 lg:ms-0 lg:gap-3">
          <LocaleSwitcher />
          <UserMenu />
          <CartButton />
        </div>
      </div>

      {/* Mobile side drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 w-full cursor-pointer border-0 bg-[rgba(58,36,32,.45)]"
          />
          {/* Drawer */}
          <nav className="absolute top-0 bottom-0 start-0 flex w-[290px] max-w-[85%] flex-col gap-1 overflow-y-auto bg-[var(--surface)] p-5 shadow-[var(--shadow-float)]">
            <div className="mb-3 flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <span className="font-display text-[17px] font-extrabold text-[var(--primary)]">
                {tc("brandFirst")}{" "}
                <span className="text-[#E8A50C]">{tc("brandSecond")}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ms-auto grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white text-[var(--body)] shadow-[0_1px_3px_rgba(58,36,32,.12)]"
              >
                ✕
              </button>
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-[15px] font-semibold text-[var(--body)] no-underline hover:bg-[var(--surface-2)]"
              >
                {t(l.key)}
              </Link>
            ))}
            <hr className="my-2 border-[var(--border)]" />
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-[15px] font-semibold text-[var(--body)] no-underline hover:bg-[var(--surface-2)]"
            >
              {t("orders")}
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-[15px] font-semibold text-[var(--body)] no-underline hover:bg-[var(--surface-2)]"
            >
              {t("login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

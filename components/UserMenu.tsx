"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";

export default function UserMenu() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = async (userEmail: string | null) => {
      setEmail(userEmail);
      if (!userEmail) {
        setIsAdmin(false);
        return;
      }
      // Admin button only if the signed-in user is in the admins table
      const { data } = await supabase.rpc("is_admin");
      setIsAdmin(Boolean(data));
    };

    supabase.auth.getUser().then(({ data }) => check(data.user?.email ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const logout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
  };

  // Signed out → sign-in link (desktop only; mobile uses the side drawer)
  if (!email) {
    return (
      <Link
        href="/login"
        className="hidden whitespace-nowrap rounded-full bg-white px-3.5 py-2.5 text-[13px] font-bold text-[var(--body)] no-underline shadow-[0_1px_3px_rgba(58,36,32,.12)] sm:block"
      >
        {t("login")}
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      {/* Admin button — admins only */}
      {isAdmin && (
        <Link
          href="/admin"
          className="hidden rounded-full bg-[var(--ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--accent)] no-underline lg:block"
        >
          Admin
        </Link>
      )}

      {/* Profile: avatar with first letter of email */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Account"
        aria-expanded={open}
        className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-[var(--success)] font-display text-base font-bold uppercase text-white shadow-[0_1px_3px_rgba(58,36,32,.12)]"
      >
        {email[0]}
      </button>

      {open && (
        <div className="absolute end-0 top-[52px] z-50 w-56 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-[var(--shadow-float)]">
          <p className="m-0 truncate border-b border-[var(--border)] px-3 pb-2 pt-1 text-xs text-[var(--muted)]">
            {email}
          </p>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--ink)] no-underline hover:bg-[var(--surface-2)] lg:hidden"
            >
              ⚙ Admin
            </Link>
          )}
          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--body)] no-underline hover:bg-[var(--surface-2)]"
          >
            {t("orders")}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="block w-full cursor-pointer rounded-xl px-3 py-2.5 text-start text-sm font-semibold text-[var(--error)] hover:bg-[var(--surface-2)]"
          >
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}

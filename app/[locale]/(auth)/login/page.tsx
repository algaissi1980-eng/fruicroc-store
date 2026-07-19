"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    });
    if (error) toast.error(error.message);
    else setSent(true);
  };

  const google = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    });
  };

  return (
    <div className="mx-auto max-w-sm px-5 py-12">
      <div className="rounded-[24px] border border-[var(--border)] bg-white p-7 shadow-[var(--shadow-card)]">
        <h1 className="m-0 mb-6 text-[27px] font-extrabold text-[var(--ink)]">
          {t("title")}
        </h1>

        {sent ? (
          <p className="m-0 rounded-2xl bg-[var(--success-soft)] p-4 font-semibold text-[var(--success)]">
            {t("linkSent")}
          </p>
        ) : (
          <form onSubmit={sendLink} className="flex flex-col gap-3.5">
            <input
              required
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-pill w-full"
            />
            <button type="submit" className="btn-primary w-full">
              {t("sendLink")}
            </button>
            <button type="button" onClick={google} className="btn-secondary w-full">
              {t("google")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

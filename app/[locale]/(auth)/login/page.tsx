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
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {sent ? (
        <p>{t("linkSent")}</p>
      ) : (
        <form onSubmit={sendLink} className="space-y-4">
          <input
            required
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-[var(--border)] p-2"
          />
          <button
            type="submit"
            className="w-full rounded bg-[var(--accent)] px-4 py-2 text-white"
          >
            {t("sendLink")}
          </button>
          <button
            type="button"
            onClick={google}
            className="w-full rounded border border-[var(--border)] px-4 py-2"
          >
            {t("google")}
          </button>
        </form>
      )}
    </div>
  );
}

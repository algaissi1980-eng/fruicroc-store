"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

// Protected at DB level too (migration 4): owner is permanent,
// self-removal is blocked by a trigger.
const OWNER_EMAIL = "algaissi1980@gmail.com";

interface Admin {
  email: string;
  created_at: string;
}

export default function AdminAdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const load = useCallback(async () => {
    const [{ data }, { data: auth }] = await Promise.all([
      supabase.rpc("get_admins_list"),
      supabase.auth.getUser(),
    ]);
    setAdmins((data as Admin[]) ?? []);
    setMe(auth.user?.email ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("admins")
      .insert({ email: email.trim().toLowerCase() });
    if (error) toast.error(error.message);
    else {
      toast.success("Admin added");
      setEmail("");
      load();
    }
  };

  const remove = async (adminEmail: string) => {
    if (!confirm(`Remove ${adminEmail} from admins?`)) return;
    const { error } = await supabase.from("admins").delete().eq("email", adminEmail);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="max-w-md">
      <form onSubmit={add} className="mb-5 flex gap-2">
        <input
          required
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-pill w-full"
        />
        <button type="submit" className="btn-primary shrink-0 px-5">
          Add
        </button>
      </form>

      <ul className="m-0 list-none space-y-2 p-0">
        {admins.map((a) => {
          const isOwner = a.email === OWNER_EMAIL;
          const isMe = a.email === me;
          const protectedRow = isOwner || isMe;
          return (
            <li
              key={a.email}
              className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-white p-3.5"
            >
              <span className="truncate font-medium text-[var(--body)]">
                {a.email}
                {isOwner && (
                  <span className="badge badge-accent ms-2">OWNER</span>
                )}
                {isMe && !isOwner && (
                  <span className="badge badge-success ms-2">YOU</span>
                )}
              </span>
              {protectedRow ? (
                <span className="text-xs text-[var(--muted)]">🔒</span>
              ) : (
                <button
                  type="button"
                  onClick={() => remove(a.email)}
                  className="btn-secondary shrink-0 !min-h-0 px-3 py-1.5 text-[13px] !text-[var(--error)]"
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-[var(--muted)]">
        The owner is permanent, and you cannot remove yourself — both enforced
        by the database, not just hidden here.
      </p>
    </div>
  );
}

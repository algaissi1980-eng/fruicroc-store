import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Admin guard — same pattern as Candy-hon: Supabase auth + admins table check
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/fr/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/fr");

  return <div className="min-h-screen">{children}</div>;
}

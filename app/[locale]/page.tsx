import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/HomeClient";
import type { Product } from "@/types";

export const revalidate = 60; // ISR — refresh product list every minute

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  return <HomeClient products={(products as Product[]) ?? []} />;
}

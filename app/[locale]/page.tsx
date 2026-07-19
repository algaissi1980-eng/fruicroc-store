import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/HomeClient";
import type { Product, SiteImages } from "@/types";

export const revalidate = 60; // ISR — refresh product list every minute

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const [{ data: products }, { data: settings }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false }),
    supabase.from("store_settings").select("site_images").eq("id", 1).single(),
  ]);

  return (
    <HomeClient
      products={(products as Product[]) ?? []}
      initialCategory={category ?? null}
      siteImages={(settings?.site_images as SiteImages) ?? {}}
    />
  );
}

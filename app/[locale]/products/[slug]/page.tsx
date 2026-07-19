import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import ProductDetail from "@/components/ProductDetail";
import type { Product } from "@/types";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  // Slug is per-locale JSONB — match any locale so shared links still work
  let { data } = await supabase
    .from("products")
    .select("*")
    .or(`slug->>fr.eq.${slug},slug->>en.eq.${slug},slug->>ar.eq.${slug}`)
    .limit(1)
    .maybeSingle();

  // Fallback: products created before per-locale slugs link by id
  if (!data && /^[0-9a-f-]{36}$/.test(slug)) {
    ({ data } = await supabase
      .from("products")
      .select("*")
      .eq("id", slug)
      .maybeSingle());
  }

  if (!data) notFound();

  return <ProductDetail product={data as Product} />;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/**
 * Refreshes server data when products or settings change
 * (same role as Candy-hon's RealtimeSync).
 * Requires Realtime to be enabled on the tables in Supabase
 * (Database → Replication → add products, store_settings).
 */
export default function RealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("storefront-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}

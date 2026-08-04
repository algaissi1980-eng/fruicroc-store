"use client";

import { useState } from "react";
import AdminProductsTab from "@/components/admin/AdminProductsTab";
import AdminOrdersTab from "@/components/admin/AdminOrdersTab";
import AdminShippingTab from "@/components/admin/AdminShippingTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminPromoTab from "@/components/admin/AdminPromoTab";
import AdminOffersTab from "@/components/admin/AdminOffersTab";
import AdminStatsTab from "@/components/admin/AdminStatsTab";
import AdminAdminsTab from "@/components/admin/AdminAdminsTab";

// Admin UI is intentionally not localized to fr/en/ar — English only,
// same tab pattern as Candy-hon.
const TABS = [
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "offers", label: "Offers" },
  { id: "promo", label: "Promo codes" },
  { id: "shipping", label: "Shipping zones" },
  { id: "stats", label: "Stats" },
  { id: "admins", label: "Admins" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("orders");

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="m-0 mb-4 text-2xl font-extrabold text-[var(--ink)]">
        Fruit Croquant — Admin
      </h1>

      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tabDef) => (
          <button
            key={tabDef.id}
            type="button"
            onClick={() => setTab(tabDef.id)}
            aria-pressed={tab === tabDef.id}
            className={`cursor-pointer rounded-full border-2 px-4 py-2 text-[13.5px] font-bold transition-colors ${
              tab === tabDef.id
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--accent)]"
                : "border-[var(--border-input)] bg-white text-[var(--body)] hover:border-[var(--muted)]"
            }`}
          >
            {tabDef.label}
          </button>
        ))}
      </nav>

      {tab === "orders" && <AdminOrdersTab />}
      {tab === "products" && <AdminProductsTab />}
      {tab === "offers" && <AdminOffersTab />}
      {tab === "promo" && <AdminPromoTab />}
      {tab === "shipping" && <AdminShippingTab />}
      {tab === "stats" && <AdminStatsTab />}
      {tab === "admins" && <AdminAdminsTab />}
      {tab === "settings" && <AdminSettingsTab />}
    </div>
  );
}

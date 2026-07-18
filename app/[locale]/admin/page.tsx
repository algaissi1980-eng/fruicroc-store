"use client";

import { useState } from "react";
import AdminProductsTab from "@/components/admin/AdminProductsTab";
import AdminOrdersTab from "@/components/admin/AdminOrdersTab";
import AdminShippingTab from "@/components/admin/AdminShippingTab";
import AdminVatTab from "@/components/admin/AdminVatTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";

// Admin UI is intentionally not localized to fr/en/ar yet — English only,
// same tab pattern as Candy-hon. Offers/Promo/Stats/Admins tabs will be
// ported from Candy-hon in a later pass.
const TABS = [
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "shipping", label: "Shipping zones" },
  { id: "vat", label: "VAT rates" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("orders");

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Fruicroc Admin</h1>

      <nav className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)]">
        {TABS.map((tabDef) => (
          <button
            key={tabDef.id}
            type="button"
            onClick={() => setTab(tabDef.id)}
            className={`px-3 py-2 ${
              tab === tabDef.id ? "border-b-2 border-[var(--accent)] font-bold" : ""
            }`}
          >
            {tabDef.label}
          </button>
        ))}
      </nav>

      {tab === "orders" && <AdminOrdersTab />}
      {tab === "products" && <AdminProductsTab />}
      {tab === "shipping" && <AdminShippingTab />}
      {tab === "vat" && <AdminVatTab />}
      {tab === "settings" && <AdminSettingsTab />}
    </div>
  );
}

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { Baloo_Bhaijaan_2, Readex_Pro } from "next/font/google";

// Both families cover Latin + Arabic natively — one stack for all 3 locales
const displayFont = Baloo_Bhaijaan_2({
  subsets: ["latin", "arabic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const bodyFont = Readex_Pro({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
import { routing, RTL_LOCALES, type Locale } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import AnnouncementBar from "@/components/AnnouncementBar";
import RealtimeSync from "@/components/RealtimeSync";
import "../globals.css";

export const metadata: Metadata = {
  title: "Fruit Croquant",
  description: "Real fruit, impossibly crunchy — freeze-dried in France",
};

// Explicit viewport — without a top-level root layout Next does not always
// inject the default, and mobile then renders the desktop layout zoomed out.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = RTL_LOCALES.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <AnnouncementBar />
          <Navbar />
          <RealtimeSync />
          <main>{children}</main>
          <Footer />
          <CookieConsent />
          <Toaster
            position={dir === "rtl" ? "bottom-left" : "bottom-right"}
            toastOptions={{
              style: {
                background: "#3A2420",
                color: "#FFF3DC",
                border: "none",
                borderRadius: "14px",
                boxShadow: "0 8px 20px rgba(58,36,32,.25)",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

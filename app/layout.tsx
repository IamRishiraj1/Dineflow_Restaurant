import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CatalogProvider } from "@/context/CatalogContext";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { ToastProvider } from "@/context/ToastContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DineFlow — Modern Restaurant Ordering",
  description:
    "DineFlow is a restaurant ordering and management platform. Browse the menu, order online, and track your food in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <CatalogProvider>
          <CartProvider>
            <OrderProvider>
              <ToastProvider>{children}</ToastProvider>
            </OrderProvider>
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}

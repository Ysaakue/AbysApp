import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { Inter, Exo_2 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-exo2",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="h-full">
      <body className={`min-h-full ${inter.variable} ${exo2.variable}`}>{children}</body>
    </html>
  );
}

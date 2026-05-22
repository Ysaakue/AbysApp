import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import "./globals.css";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

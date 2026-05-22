import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AbysApp - Service Orders",
  description: "Tech support service order management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

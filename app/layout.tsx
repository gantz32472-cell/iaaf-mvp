import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IAAF MVP",
  description: "Instagram比較アフィリエイト運用自動化ツール"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alam Sari Cup | Volleyball Tournament",
  description: "Jadwal dan hasil pertandingan turnamen bola voli.",
};

export default function RootLayout(
    {children,}:
    Readonly<{ children: React.ReactNode; }>) {
  return (
      <html lang="id">
      <body>{children}</body>
      </html>
  );
}

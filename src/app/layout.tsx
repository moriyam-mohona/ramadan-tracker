import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/JsonLd";

const inter = Inter({ subsets: ["latin"] });
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "Ramadan Planner | Track Your Journey",
  description: "A spiritual companion to track your daily prayers, Quran recitation, and good deeds during the blessed month of Ramadan.",
  metadataBase: new URL("https://ramadan-diary.vercel.app"),
  manifest: "/manifest.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌙</text></svg>"
  }
};

export const viewport = {
  themeColor: "#064e3b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${hindSiliguri.variable} antialiased`}>
        <JsonLd />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Roboto, Unbounded } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import "../globals.css";

const roboto = Roboto({ variable: "--font-roboto", weight: ["300", "400", "500", "700", "900"], subsets: ["latin"], display: "swap" });
const unbounded = Unbounded({ variable: "--font-unbounded", weight: ["200", "300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sharkstream.app"),
  title: { template: "%s | Shark Stream", default: "Shark Stream — Streaming Site Directory" },
  description: "A curated directory for discovering streaming sites across the web.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Shark Stream", title: "Shark Stream", description: "A curated directory for discovering streaming sites across the web." },
  twitter: { card: "summary", title: "Shark Stream", description: "A curated directory for discovering streaming sites across the web." },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${roboto.variable} ${unbounded.variable} h-full antialiased`}><body className="min-h-full flex flex-col font-sans bg-[var(--bg-primary)]"><ThemeProvider><Navbar /><main className="flex-1 relative z-10 pb-20 md:pb-0">{children}</main><Footer /></ThemeProvider></body></html>;
}

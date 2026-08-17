import type { Metadata } from "next";
import { Roboto, Unbounded } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Shark Stream",
    default: "Shark Stream",
  },
  description:
    "Shark Stream is your go-to directory for discovering streaming sites across the web.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${roboto.variable} ${unbounded.variable} min-h-full flex flex-col font-sans bg-[var(--bg-primary)]`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 relative z-10 pb-14 md:pb-0">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

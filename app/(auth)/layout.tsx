import { Roboto, Unbounded } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import "../globals.css";

const roboto = Roboto({ variable: "--font-roboto", weight: ["300", "400", "500", "700", "900"], subsets: ["latin"], display: "swap" });
const unbounded = Unbounded({ variable: "--font-unbounded", weight: ["200", "300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"], display: "swap" });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${roboto.variable} ${unbounded.variable} h-full antialiased`}><body className="min-h-full font-sans bg-[var(--bg-primary)]"><ThemeProvider>{children}</ThemeProvider></body></html>;
}

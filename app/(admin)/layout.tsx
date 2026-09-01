import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import AdminSidebar from "@/components/admin/sidebar";
import { Roboto, Unbounded } from "next/font/google";
import "../globals.css";

const roboto = Roboto({ variable: "--font-roboto", weight: ["300", "400", "500", "700", "900"], subsets: ["latin"], display: "swap" });
const unbounded = Unbounded({ variable: "--font-unbounded", weight: ["200", "300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    template: "%s | Shark Stream Admin",
    default: "Admin | Shark Stream",
  },
  description: "Shark Stream Admin Dashboard",
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "admin") {
    redirect("/");
  }

  return (
    <html lang="en" className={`${roboto.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-[var(--bg-primary)]">
      <div className="min-h-full">
        <ThemeProvider>
          <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
              <div className="admin-content">{children}</div>
            </div>
          </div>
        </ThemeProvider>
      </div></body></html>
  );
}

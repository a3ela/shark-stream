"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Info, Send, Shield, LogOut } from "lucide-react";
import ThemeChanger from "../theme-changer";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth/auth-client";

const NAV_LINKS = [
  { href: "/", label: "Sites", icon: Home },
  { href: "/about", label: "About", icon: Info },
  { href: "/request", label: "Request", icon: Send },
  { href: "/contact", label: "Contact", icon: Send },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block sticky top-0 z-40 bg-(--bg-glass)/80 backdrop-blur-md shadow-sm shadow-black/5">
        <div className="max-w-7xl mx-auto px-2 h-15 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.svg"
              alt="Shark Stream Logo"
              width={32}
              height={32}
            />

            <span
              className="text-xl font-bold tracking-tight leading-none"
              style={{
                fontFamily: "Unbounded, sans-serif",
                color: "var(--primary)",
              }}
            ></span>
          </Link>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 p-1 rounded-full bg-(--bg-glass-hover)/40">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative px-4 py-2 text-sm font-medium leading-none transition-colors duration-200 flex items-center ${
                      isActive
                        ? "text-(--text-primary)"
                        : "text-(--text-secondary) hover:text-(--text-primary)"
                    }`}
                  >
                    {link.label}

                    <span
                      className={`absolute left-4 right-4 -bottom-0.5 h-px bg-(--primary) origin-left transition-transform duration-300 ease-out ${
                        isActive
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="w-px h-6 bg-(--border-color) mx-2" />

            <ThemeChanger />

            <div className="w-px h-6 bg-(--border-color) mx-2" />
            {session && (
              <>
                  <Link
                  href="/dashboard"
                    className={`relative px-4 py-2 rounded-full text-sm font-medium leading-none transition-all duration-200 flex items-center gap-1.5 ${
                      pathname.startsWith("/dashboard")
                        ? "text-(--text-inverse) bg-(--primary) shadow-sm"
                      : " hover:text-(--text-primary) hover:bg-(--bg-glass-hover)/70"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>

                  <button
                    onClick={handleLogout}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium leading-none transition-all duration-200 flex items-center gap-1.5 ${
                    pathname.startsWith("/dashboard")
                      ? "text-(--text-primary)"
                      : " hover:text-(--text-primary) hover:bg-(--bg-glass-hover)/70"
                  }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 rounded-2xl border border-(--border-color) bg-(--bg-glass)/90 backdrop-blur-md shadow-lg shadow-black/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-(--text-inverse) bg-(--primary) shadow-sm scale-105"
                    : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-glass-hover)/70"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">
                  {link.label}
                </span>
              </Link>
            );
          })}

          {session && (
              <Link
              href="/dashboard"
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                pathname.startsWith("/admin")
                    ? "text-(--text-inverse) bg-(--primary) shadow-sm scale-105"
                    : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-glass-hover)/70"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">
                  Admin
                </span>
              </Link>
          )}
        </div>
      </nav>
    </>
  );
}

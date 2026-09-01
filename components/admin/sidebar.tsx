"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Globe,
  Users,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/categories", label: "Categories", icon: Tag },
  { href: "/dashboard/sites", label: "Sites", icon: Globe },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/requests", label: "Requests", icon: ClipboardList },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="admin-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
    >
      {/* Header */}
      <div className="admin-sidebar__header">
        <div className="admin-sidebar__logo">
          <Zap size={22} className="admin-sidebar__logo-icon" />
          {!collapsed && (
            <span className="admin-sidebar__logo-text">Admin Panel</span>
          )}
        </div>
        <button
          id="sidebar-toggle-btn"
          className="admin-sidebar__toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`admin-sidebar__nav-item ${active ? "admin-sidebar__nav-item--active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="admin-sidebar__nav-icon" />
              {!collapsed && (
                <span className="admin-sidebar__nav-label">{label}</span>
              )}
              {active && <span className="admin-sidebar__nav-active-bar" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="admin-sidebar__footer">
        <Link href="/" className="admin-sidebar__back-link" title={collapsed ? "Back to site" : undefined}>
          <ChevronLeft size={16} />
          {!collapsed && <span>Back to site</span>}
        </Link>
      </div>
    </aside>
  );
}

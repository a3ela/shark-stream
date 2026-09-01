import { getAdminStats } from "@/lib/actions/admin";
import StatCard from "@/components/admin/stat-card";
import Link from "next/link";
import {
  Tag,
  Globe,
  Users,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Admin Overview",
};

export default async function DashboardOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      title: "Total Categories",
      value: stats.categories,
      icon: <Tag size={24} />,
      color: "blue" as const,
      href: "/dashboard/categories",
    },
    {
      title: "Total Sites",
      value: stats.sites,
      icon: <Globe size={24} />,
      color: "purple" as const,
      href: "/dashboard/sites",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: <Users size={24} />,
      color: "green" as const,
      href: "/dashboard/users",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: <ClipboardList size={24} />,
      color: "orange" as const,
      href: "/dashboard/requests",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Overview</h1>
          <p className="admin-page__subtitle">
            Welcome back! Here&apos;s what&apos;s happening with Shark Stream.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Quick Links */}
      <div className="admin-quick-links">
        <h2 className="admin-section-title">Quick Access</h2>
        <div className="admin-quick-links__grid">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="admin-quick-link-card"
            >
              <div className="admin-quick-link-card__icon">{card.icon}</div>
              <div className="admin-quick-link-card__body">
                <span className="admin-quick-link-card__label">
                  Manage {card.title.replace("Total ", "").replace("Pending ", "")}
                </span>
                <span className="admin-quick-link-card__count">
                  {card.value}{" "}
                  {card.title.includes("Pending") ? "pending" : "total"}
                </span>
              </div>
              <ArrowRight size={18} className="admin-quick-link-card__arrow" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

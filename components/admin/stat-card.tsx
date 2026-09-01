"use client";

import { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  color?: "blue" | "purple" | "green" | "orange";
}

const colorMap = {
  blue: {
    glow: "rgba(59,130,246,0.25)",
    border: "rgba(59,130,246,0.3)",
    icon: "rgba(59,130,246,0.15)",
    iconColor: "#3b82f6",
  },
  purple: {
    glow: "rgba(168,85,247,0.25)",
    border: "rgba(168,85,247,0.3)",
    icon: "rgba(168,85,247,0.15)",
    iconColor: "#a855f7",
  },
  green: {
    glow: "rgba(16,185,129,0.25)",
    border: "rgba(16,185,129,0.3)",
    icon: "rgba(16,185,129,0.15)",
    iconColor: "#10b981",
  },
  orange: {
    glow: "rgba(249,115,22,0.25)",
    border: "rgba(249,115,22,0.3)",
    icon: "rgba(249,115,22,0.15)",
    iconColor: "#f97316",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
}: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className="stat-card"
      style={
        {
          "--card-glow": c.glow,
          "--card-border": c.border,
          "--card-icon-bg": c.icon,
          "--card-icon-color": c.iconColor,
        } as React.CSSProperties
      }
    >
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__title">{title}</p>
        <p className="stat-card__value">{value}</p>
        {trend && (
          <p className="stat-card__trend">
            <TrendingUp size={12} />
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

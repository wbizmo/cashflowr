import {
  Bell,
  LayoutDashboard,
  PieChart,
  Receipt,
  Repeat2,
  Settings,
  Tags,
  Target,
  Wallet,
} from "lucide-react";

export const navigationItems = [
  { name: "Dashboard", shortName: "Home", icon: LayoutDashboard, path: "/dashboard", group: "Overview" },
  { name: "Transactions", icon: Receipt, path: "/transactions", group: "Money" },
  { name: "Budgets", icon: Wallet, path: "/budgets", group: "Money" },
  { name: "Goals", icon: Target, path: "/goals", group: "Plan" },
  { name: "Recurring", icon: Repeat2, path: "/recurring", group: "Plan" },
  { name: "Analytics", icon: PieChart, path: "/analytics", group: "Insights" },
  { name: "Categories", icon: Tags, path: "/categories", group: "Manage" },
  { name: "Notifications", icon: Bell, path: "/notifications", group: "Manage" },
  { name: "Settings", icon: Settings, path: "/settings", group: "Manage" },
];

export const getNavigationItem = (pathname) =>
  navigationItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));

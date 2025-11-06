"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Building2,
  DollarSign,
  LineChart as LineChartIcon,
  Package,
  ShoppingCart,
  Store,
  Users,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

function Trend({ value }: { value: string }) {
  const isUp = value.trim().startsWith("+");
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span
        className={
          "inline-flex h-5 items-center rounded-full px-2 py-0.5 " +
          (isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")
        }
      >
        {isUp ? "▲" : "▼"} {value.replace("this month", "this month")}
      </span>
      <span className="hidden md:inline">this month</span>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = "",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  accent?: string; 
}) {
  return (
    <Card
      className={
        "border-none shadow-sm transition hover:shadow-md " +
        (accent
          ? `bg-gradient-to-b ${accent}`
          : "bg-card")
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-xl bg-muted/40 p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {trend ? <Trend value={trend} /> : null}
      </CardContent>
    </Card>
  );
}

// ---------- Demo datasets ----------
const sales = [
  { name: "Jan", value: 24 },
  { name: "Feb", value: 28 },
  { name: "Mar", value: 32 },
  { name: "Apr", value: 30 },
  { name: "May", value: 35 },
  { name: "Jun", value: 38 },
  { name: "Jul", value: 41 },
];

const recentOrders = [
  { id: "ORD-1001", client: "Hilton Hotel Miami", qty: 150, amount: 750, status: "Pending" },
  { id: "ORD-1002", client: "Hilton Hotel Miami", qty: 150, amount: 750, status: "Pending" },
  { id: "ORD-1003", client: "Hilton Hotel Miami", qty: 150, amount: 750, status: "Pending" },
  { id: "ORD-1004", client: "Marriott Orlando", qty: 200, amount: 960, status: "Paid" },
];

// ---------- Sections ----------
function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          {Icon ? (
            <Badge variant="secondary" className="gap-1">
              <Icon className="h-3 w-3" />
              {title}
            </Badge>
          ) : (
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
              {title}
            </h2>
          )}
        </div>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function SalesMiniChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <LineChartIcon className="h-4 w-4" /> Monthly Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sales} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RecentOrdersList() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          My Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recentOrders.map((o, idx) => (
          <div
            key={o.id}
            className="flex items-center justify-between rounded-xl border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="h-6 w-6 items-center justify-center p-0">
                {idx + 1}
              </Badge>
              <div>
                <div className="font-medium">Order #{o.id}</div>
                <p className="text-xs text-muted-foreground">
                  {o.client} – {o.qty} Cases
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold">${o.amount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{o.status}</p>
              </div>
              <Button size="sm" variant="secondary">View</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Main Page ----------
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <Card className="border-none bg-gradient-to-b from-muted/30 to-background p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium">Super Admin</span>
          </p>
        </div>
      </Card>

      {/* Primary Store */}
      <div className="space-y-3">
        <SectionHeader
          title="Primary Store"
          subtitle="CoconutStock HQ · Primary Store"
          icon={Store}
          action={<Button variant="secondary" size="sm">Manage</Button>}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Customers"
            value={45}
            icon={Users}
            trend={"+12%"}
            accent="from-sky-50 to-sky-100"
          />
          <MetricCard
            title="Total Orders"
            value={324}
            icon={Package}
            trend={"+8%"}
            accent="from-emerald-50 to-emerald-100"
          />
          <MetricCard
            title="Monthly Revenue"
            value="$45.2k"
            icon={DollarSign}
            trend={"+15%"}
            accent="from-fuchsia-50 to-fuchsia-100"
          />
          <MetricCard
            title="Pending Orders"
            value={12}
            icon={Clock}
            trend={"-5%"}
            accent="from-amber-50 to-amber-100"
          />
        </div>
      </div>

      {/* Franchise Overview */}
      <div className="space-y-3">
        <SectionHeader
          title="All Franchises Overview"
          subtitle="View only · All metrics"
          icon={Building2}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Franchises"
            value={8}
            icon={Store}
            trend={"+1"}
            accent="from-violet-50 to-violet-100"
          />
          <MetricCard
            title="Franchises Customers"
            value={342}
            icon={Users}
            trend={"+6%"}
            accent="from-sky-50 to-sky-100"
          />
          <MetricCard
            title="Total Orders"
            value={2156}
            icon={ShoppingCart}
            trend={"+10%"}
            accent="from-emerald-50 to-emerald-100"
          />
          <MetricCard
            title="Total Revenue"
            value="$357k"
            icon={DollarSign}
            trend={"+12%"}
            accent="from-indigo-50 to-indigo-100"
          />
        </div>
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SalesMiniChart />
        </div>
        <div className="lg:col-span-3">
          <RecentOrdersList />
        </div>
      </div>

      {/* Bottom KPI strip (optional) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Now" value={573} icon={Activity} trend={"+201"} />
        <MetricCard title="Open Tickets" value={23} icon={Package} trend={"-4%"} />
        <MetricCard title="Fulfillment SLA" value="98.4%" icon={Clock} trend={"+1.1%"} />
        <MetricCard title="M/M Growth" value="21%" icon={LineChartIcon} trend={"+3%"} />
      </div>
    </div>
  );
}

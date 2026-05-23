import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Users, ListChecks, ArrowRight, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/")({
  component: Overview,
});

const tools = [
  { title: "Sales & Profit Tracker", desc: "Calculate margin and visualize monthly performance.", url: "/app/sales", icon: BarChart3 },
  { title: "Client Lead Manager", desc: "Track inquiries from new lead to closed deal.", url: "/app/leads", icon: Users },
  { title: "Team Task Planner", desc: "Plan, prioritize, and check off daily work.", url: "/app/tasks", icon: ListChecks },
];

const stats = [
  { label: "Avg. Monthly Revenue", value: "$48,210", icon: DollarSign, tone: "text-success" },
  { label: "Active Pipeline", value: "27 leads", icon: Activity, tone: "text-info" },
  { label: "Profit Margin", value: "32.4%", icon: TrendingUp, tone: "text-success" },
];

function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Welcome back 👋</h1>
        <p className="mt-1 text-muted-foreground">Here's a quick look at your business today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Your tools</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((t) => (
            <Card key={t.title} className="group transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to={t.url}>Open <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

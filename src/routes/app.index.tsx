import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Users, ListChecks, ArrowRight, TrendingUp, DollarSign, Activity, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/")({
  component: Overview,
});

const tools = [
  { title: "Sales & Profit Tracker", desc: "Calculate margin and visualize monthly performance.", url: "/app/sales", icon: BarChart3 },
  { title: "Client Lead Manager", desc: "Track inquiries from new lead to closed deal.", url: "/app/leads", icon: Users },
  { title: "Team Task Planner", desc: "Plan, prioritize, and check off daily work.", url: "/app/tasks", icon: ListChecks },
];

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function Overview() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select("*").order("month", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await supabase.from("tasks").update({ is_done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Calculate dynamic stats
  let avgRevenue = 0;
  let profitMargin = 0;
  let activeLeads = 0;

  if (sales.length > 0) {
    const totalRev = sales.reduce((acc, s) => acc + s.revenue, 0);
    const totalExp = sales.reduce((acc, s) => acc + s.expenses, 0);
    avgRevenue = totalRev / sales.length;
    if (totalRev > 0) profitMargin = ((totalRev - totalExp) / totalRev) * 100;
  }

  activeLeads = leads.filter(l => l.status !== "Deal Closed").length;

  const stats = [
    { label: "Avg. Monthly Revenue", value: formatCurrency(avgRevenue), icon: DollarSign, tone: "text-success" },
    { label: "Active Pipeline", value: `${activeLeads} leads`, icon: Activity, tone: "text-info" },
    { label: "Profit Margin", value: `${profitMargin.toFixed(1)}%`, icon: TrendingUp, tone: "text-success" },
  ];

  const highPriorityTasks = tasks.filter(t => !t.is_done && t.priority === "high").slice(0, 5);
  const recentLeads = leads.slice(0, 5);

  const isLoading = loadingSales || loadingLeads || loadingTasks;

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
              <div className="text-2xl font-semibold">{isLoading ? "..." : s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Action Items</CardTitle>
            <CardDescription>High priority tasks that need attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            ) : highPriorityTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high priority tasks open.</p>
            ) : (
              <ul className="space-y-3">
                {highPriorityTasks.map(t => (
                  <li key={t.id} className="flex items-start gap-3">
                    <button 
                      onClick={() => toggleTask.mutate({ id: t.id, is_done: true })}
                      className="mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-border text-transparent hover:border-success hover:text-success"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </button>
                    <div>
                      <div className="text-sm font-medium leading-none">{t.title}</div>
                      {t.due_date && <div className="mt-1 text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString()}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" className="mt-4 h-auto p-0">
              <Link to="/app/tasks">View all tasks <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <CardDescription>Newest additions to your pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading leads...</p>
            ) : recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads found.</p>
            ) : (
              <ul className="space-y-4">
                {recentLeads.map(l => (
                  <li key={l.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.service}</div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">{l.status}</div>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" className="mt-4 h-auto p-0">
              <Link to="/app/leads">Manage leads <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>
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

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

export const Route = createFileRoute("/app/sales")({
  component: SalesTracker,
});

const STORAGE_KEY = "bizpulse:sales";

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function SalesTracker() {
  const [revenue, setRevenue] = useState(48210);
  const [expenses, setExpenses] = useState(32600);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v.revenue === "number") setRevenue(v.revenue);
        if (typeof v.expenses === "number") setExpenses(v.expenses);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ revenue, expenses }));
  }, [revenue, expenses, loaded]);

  const profit = revenue - expenses;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const positive = profit >= 0;

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const factors = [0.78, 0.86, 0.92, 0.95, 1.05, 1];
    return months.map((m, i) => {
      const r = Math.round(revenue * factors[i]);
      const e = Math.round(expenses * (0.9 + i * 0.03));
      return { month: m, Revenue: r, Expenses: e, Profit: r - e };
    });
  }, [revenue, expenses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Sales & Profit Tracker</h1>
        <p className="mt-1 text-muted-foreground">Enter your numbers — the math and charts update instantly.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your monthly numbers</CardTitle>
            <CardDescription>Update either field to recalculate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rev">Monthly Revenue ($)</Label>
              <Input id="rev" type="number" min={0} value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp">Monthly Expenses ($)</Label>
              <Input id="exp" type="number" min={0} value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Net Profit Margin</CardTitle>
            <CardDescription>The percentage of revenue you keep as profit.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <Badge
                className={`px-4 py-2 text-3xl font-semibold tabular-nums ${
                  positive ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                }`}
              >
                {margin.toFixed(1)}%
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {positive ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                {positive ? "Healthy margin" : "Operating at a loss"}
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat label="Revenue" value={formatCurrency(revenue)} icon={DollarSign} tone="text-info" />
              <Stat label="Expenses" value={formatCurrency(expenses)} icon={Wallet} tone="text-warning" />
              <Stat label="Net Profit" value={formatCurrency(profit)} icon={TrendingUp} tone={positive ? "text-success" : "text-destructive"} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">6-month projection</CardTitle>
          <CardDescription>Based on your current numbers and typical seasonal patterns.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-popover-foreground)",
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

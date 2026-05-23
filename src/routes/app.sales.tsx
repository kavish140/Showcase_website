import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Plus, Trash2, Edit2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/sales")({
  component: SalesTracker,
});

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

interface SaleRecord {
  id: string;
  month: string; // YYYY-MM
  revenue: number;
  expenses: number;
}

function SalesTracker() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ month: "", revenue: 0, expenses: 0 });

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("month", { ascending: true });
      if (error) throw error;
      return data as SaleRecord[];
    },
    enabled: !!session,
  });

  const upsertSale = useMutation({
    mutationFn: async (record: Omit<SaleRecord, "id"> & { id?: string }) => {
      const payload = {
        ...record,
        user_id: session?.user.id,
      };
      if (record.id) {
        const { error } = await supabase.from("sales").update(payload).eq("id", record.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sales").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success(editingId ? "Record updated" : "Record added");
      setOpen(false);
      setEditingId(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast("Record removed");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.month) return toast.error("Please select a month");
    upsertSale.mutate({
      id: editingId || undefined,
      month: form.month,
      revenue: Number(form.revenue),
      expenses: Number(form.expenses),
    });
  };

  const openEdit = (s: SaleRecord) => {
    setForm({ month: s.month, revenue: s.revenue, expenses: s.expenses });
    setEditingId(s.id);
    setOpen(true);
  };

  const openNew = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setForm({ month: `${d.getFullYear()}-${mm}`, revenue: 0, expenses: 0 });
    setEditingId(null);
    setOpen(true);
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalExpenses = sales.reduce((sum, s) => sum + s.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const positive = totalProfit >= 0;

  const chartData = useMemo(() => {
    return sales.map((s) => {
      const date = new Date(s.month + "-01");
      const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      return { month: monthName, Revenue: s.revenue, Expenses: s.expenses, Profit: s.revenue - s.expenses };
    });
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Sales & Profit Ledger</h1>
          <p className="mt-1 text-muted-foreground">Track historical monthly revenue and expenses.</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add Month</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Month Record" : "Add Month Record"}</DialogTitle>
              <DialogDescription>Enter your revenue and expenses for the selected month.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input id="month" type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rev">Revenue ($)</Label>
                <Input id="rev" type="number" min={0} value={form.revenue} onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">Expenses ($)</Label>
                <Input id="exp" type="number" min={0} value={form.expenses} onChange={(e) => setForm({ ...form, expenses: Number(e.target.value) })} required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={upsertSale.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-3 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">All-time Performance</CardTitle>
            <CardDescription>Aggregate of all logged months.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <Badge className={`px-4 py-2 text-3xl font-semibold tabular-nums ${positive ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
                {margin.toFixed(1)}%
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {positive ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                {positive ? "Healthy overall margin" : "Operating at a loss"}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Stat label="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} tone="text-info" />
              <Stat label="Total Expenses" value={formatCurrency(totalExpenses)} icon={Wallet} tone="text-warning" />
              <Stat label="Total Net Profit" value={formatCurrency(totalProfit)} icon={TrendingUp} tone={positive ? "text-success" : "text-destructive"} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Historical Trends</CardTitle>
            <CardDescription>Visualize your actual revenue and expenses over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[340px] w-full">
              {sales.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data to display. Add a month to see trends.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-popover-foreground)" }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Revenue" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expenses" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Profit" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Ledger</CardTitle>
          <CardDescription>Detailed breakdown of your entries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>}
                {!isLoading && sales.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No records found.</TableCell></TableRow>}
                {sales.map((s) => {
                  const profit = s.revenue - s.expenses;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.month}</TableCell>
                      <TableCell className="text-right text-info">{formatCurrency(s.revenue)}</TableCell>
                      <TableCell className="text-right text-warning">{formatCurrency(s.expenses)}</TableCell>
                      <TableCell className={`text-right font-medium ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                        {formatCurrency(profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteSale.mutate(s.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-muted ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

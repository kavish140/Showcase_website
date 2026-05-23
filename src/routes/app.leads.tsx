import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Plus, Trash2, Edit2, Download, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/leads")({
  component: LeadManager,
});

type Status = "New Inquiry" | "Followed Up" | "Deal Closed";
const STATUSES: Status[] = ["New Inquiry", "Followed Up", "Deal Closed"];

interface Lead {
  id: string;
  name: string;
  service: string;
  email: string;
  phone: string;
  status: Status;
  notes: string;
  created_at: string;
}

const statusStyles: Record<Status, string> = {
  "New Inquiry": "bg-info text-info-foreground",
  "Followed Up": "bg-warning text-warning-foreground",
  "Deal Closed": "bg-success text-success-foreground",
};

function LeadManager() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", service: "", email: "", phone: "", status: "New Inquiry" as Status, notes: "" });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!session,
  });

  const upsertLead = useMutation({
    mutationFn: async (record: Partial<Lead> & { id?: string }) => {
      const payload = { ...record, user_id: session?.user.id };
      if (record.id) {
        const { error } = await supabase.from("leads").update(payload).eq("id", record.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("leads").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(editingId ? "Lead updated" : "Lead added");
      setOpen(false);
      setEditingId(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast("Lead removed");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast("Status updated");
    },
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return leads.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.service.toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q)
      );
    });
  }, [leads, query, filter]);

  const counts = useMemo(() => {
    return {
      all: leads.length,
      "New Inquiry": leads.filter((l) => l.status === "New Inquiry").length,
      "Followed Up": leads.filter((l) => l.status === "Followed Up").length,
      "Deal Closed": leads.filter((l) => l.status === "Deal Closed").length,
    };
  }, [leads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.service.trim()) return toast.error("Name and service required");
    upsertLead.mutate({ id: editingId || undefined, ...form });
  };

  const openNew = () => {
    setForm({ name: "", service: "", email: "", phone: "", status: "New Inquiry", notes: "" });
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (l: Lead) => {
    setForm({ name: l.name, service: l.service, email: l.email || "", phone: l.phone || "", status: l.status, notes: l.notes || "" });
    setEditingId(l.id);
    setOpen(true);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bizpulse_leads_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Client Lead Manager</h1>
          <p className="mt-1 text-muted-foreground">Track every inquiry from first contact to closed deal.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportJSON}><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingId(null); }}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                <DialogDescription>Capture lead details securely in your database.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ln">Name</Label>
                  <Input id="ln" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ls">Service requested</Label>
                  <Input id="ls" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="le">Email</Label>
                    <Input id="le" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lp">Phone</Label>
                    <Input id="lp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes / Next Action</Label>
                  <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="E.g. Send proposal by Friday" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={upsertLead.isPending}>Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {([
          ["Total", counts.all, "text-foreground"],
          ["New", counts["New Inquiry"], "text-info"],
          ["Followed Up", counts["Followed Up"], "text-warning"],
          ["Closed", counts["Deal Closed"], "text-success"],
        ] as const).map(([label, val, tone]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className={`mt-1 text-2xl font-semibold ${tone}`}>{val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
          <CardDescription>Search and filter your leads in real time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, service, email, or phone…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="sm:w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service / Notes</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">Loading...</TableCell></TableRow>}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">No leads found.</TableCell>
                  </TableRow>
                )}
                {filtered.map((l) => (
                  <TableRow key={l.id} className="transition-colors">
                    <TableCell>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(l.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{l.service}</div>
                      {l.notes && <div className="text-xs text-muted-foreground mt-0.5">{l.notes}</div>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-xs text-muted-foreground">
                        {l.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{l.email}</span>}
                        {l.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{l.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={l.status} onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v as Status })}>
                        <SelectTrigger className="h-8 border-0 bg-transparent p-0 hover:bg-accent/40 focus:ring-0 [&>svg]:ml-1">
                          <Badge className={`${statusStyles[l.status]} cursor-pointer`}>{l.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(l)}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteLead.mutate(l.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

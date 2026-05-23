import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Plus, Trash2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/leads")({
  component: LeadManager,
});

type Status = "New Inquiry" | "Followed Up" | "Deal Closed";
interface Lead {
  id: string;
  name: string;
  service: string;
  email: string;
  phone: string;
  status: Status;
}

const STORAGE_KEY = "bizpulse:leads";

const seed: Lead[] = [
  { id: "l1", name: "Maria Gonzales", service: "Catering — 50 guests", email: "maria@example.com", phone: "(415) 555-0142", status: "New Inquiry" },
  { id: "l2", name: "Daniel Park", service: "Office cleaning", email: "dpark@example.com", phone: "(415) 555-0119", status: "Followed Up" },
  { id: "l3", name: "Aisha Bennett", service: "Branding package", email: "aisha@studio.co", phone: "(212) 555-0193", status: "Deal Closed" },
  { id: "l4", name: "Tom Whitfield", service: "Pool installation quote", email: "tom@whitfield.io", phone: "(305) 555-0177", status: "New Inquiry" },
  { id: "l5", name: "Linh Tran", service: "Wedding photography", email: "linh.t@mail.com", phone: "(646) 555-0188", status: "Followed Up" },
  { id: "l6", name: "Marcus Hill", service: "Monthly bookkeeping", email: "marcus@hill.cpa", phone: "(312) 555-0107", status: "Deal Closed" },
  { id: "l7", name: "Priya Shah", service: "Yoga studio website", email: "priya@flowyoga.com", phone: "(718) 555-0166", status: "New Inquiry" },
];

const statusStyles: Record<Status, string> = {
  "New Inquiry": "bg-info text-info-foreground",
  "Followed Up": "bg-warning text-warning-foreground",
  "Deal Closed": "bg-success text-success-foreground",
};

const STATUSES: Status[] = ["New Inquiry", "Followed Up", "Deal Closed"];

function LeadManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Lead, "id">>({
    name: "", service: "", email: "", phone: "", status: "New Inquiry",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setLeads(raw ? JSON.parse(raw) : seed);
    } catch { setLeads(seed); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads, loaded]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return leads.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.service.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q)
      );
    });
  }, [leads, query, filter]);

  const updateStatus = (id: string, status: Status) => {
    setLeads((arr) => arr.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success("Lead Status Updated", { description: `Marked as ${status}` });
  };

  const remove = (id: string) => {
    setLeads((arr) => arr.filter((l) => l.id !== id));
    toast("Lead removed");
  };

  const addLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.service.trim()) {
      toast.error("Name and service are required");
      return;
    }
    setLeads((arr) => [{ id: crypto.randomUUID(), ...form }, ...arr]);
    toast.success("New Lead Added", { description: form.name });
    setForm({ name: "", service: "", email: "", phone: "", status: "New Inquiry" });
    setOpen(false);
  };

  const counts = useMemo(() => {
    return {
      all: leads.length,
      "New Inquiry": leads.filter((l) => l.status === "New Inquiry").length,
      "Followed Up": leads.filter((l) => l.status === "Followed Up").length,
      "Deal Closed": leads.filter((l) => l.status === "Deal Closed").length,
    };
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Client Lead Manager</h1>
          <p className="mt-1 text-muted-foreground">Track every inquiry from first contact to closed deal.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" />Add lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new lead</DialogTitle>
              <DialogDescription>Capture a new inquiry. Saves to this device.</DialogDescription>
            </DialogHeader>
            <form onSubmit={addLead} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ln">Name</Label>
                <Input id="ln" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ls">Service requested</Label>
                <Input id="ls" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="Catering — 30 guests" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="le">Email</Label>
                  <Input id="le" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lp">Phone</Label>
                  <Input id="lp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 555-0100" />
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save lead</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              <Input
                placeholder="Search by name, service, email, or phone…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
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
                  <TableHead>Service requested</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      No leads match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((l) => (
                  <TableRow key={l.id} className="transition-colors">
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-muted-foreground">{l.service}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-xs text-muted-foreground">
                        {l.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{l.email}</span>}
                        {l.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{l.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as Status)}>
                        <SelectTrigger className="h-8 border-0 bg-transparent p-0 hover:bg-accent/40 focus:ring-0 [&>svg]:ml-1">
                          <Badge className={`${statusStyles[l.status]} cursor-pointer`}>{l.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => remove(l.id)} aria-label="Delete lead">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
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

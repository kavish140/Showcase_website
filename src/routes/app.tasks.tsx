import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ListChecks, Edit2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/tasks")({
  component: TaskPlanner,
});

type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: string;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
}

function TaskPlanner() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", priority: "medium" as Priority, category: "", due_date: "" });
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "completed">("open");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!session,
  });

  const upsertTask = useMutation({
    mutationFn: async (record: Partial<Task> & { id?: string }) => {
      const payload = { 
        ...record, 
        user_id: session?.user.id,
        due_date: record.due_date ? record.due_date : null 
      };
      if (record.id) {
        const { error } = await supabase.from("tasks").update(payload).eq("id", record.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(editingId ? "Task updated" : "Task added");
      setOpen(false);
      setEditingId(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast("Task removed");
    },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    upsertTask.mutate({ id: editingId || undefined, ...form });
  };

  const openNew = () => {
    setForm({ title: "", priority: "medium", category: "", due_date: "" });
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (t: Task) => {
    setForm({ title: t.title, priority: t.priority, category: t.category || "", due_date: t.due_date || "" });
    setEditingId(t.id);
    setOpen(true);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus === "open" && t.is_done) return false;
    if (filterStatus === "completed" && !t.is_done) return false;
    return true;
  }).sort((a, b) => {
    // Sort by done status first, then by priority, then by creation date
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
    const prioMap = { high: 0, medium: 1, low: 2 };
    if (prioMap[a.priority] !== prioMap[b.priority]) return prioMap[a.priority] - prioMap[b.priority];
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const remaining = tasks.filter((t) => !t.is_done).length;
  const highPriority = tasks.filter((t) => !t.is_done && t.priority === "high").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Team Task & Schedule Planner</h1>
          <p className="mt-1 text-muted-foreground">Plan your day. Keep track of priorities and due dates.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Task" : "Add Task"}</DialogTitle>
              <DialogDescription>Define what needs to be done.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due">Due Date (Optional)</Label>
                  <Input id="due" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category / Tag (Optional)</Label>
                <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Marketing, Inventory" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={upsertTask.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent><div className="text-2xl font-semibold">{remaining}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">High priority</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold text-destructive">{highPriority}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold text-success">{tasks.length - remaining}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Task List</CardTitle>
              <CardDescription>Organize and filter your work.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open Only</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as any)}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No tasks match your filters. Add one above.</div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {filteredTasks.map((t) => (
                <li key={t.id} className={`flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:gap-3 ${t.is_done ? "bg-accent/10" : ""}`}>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox className="mt-1 sm:mt-0" checked={t.is_done} onCheckedChange={(v) => toggleTask.mutate({ id: t.id, is_done: !!v })} />
                    <div className="flex-1 min-w-0">
                      <div className={`truncate text-sm ${t.is_done ? "text-muted-foreground line-through" : "font-medium"}`}>
                        {t.title}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline" className={t.priority === "high" ? "border-destructive/50 text-destructive" : t.priority === "medium" ? "border-warning/50 text-warning" : "border-info/50 text-info"}>
                          {t.priority}
                        </Badge>
                        {t.category && <Badge variant="secondary">{t.category}</Badge>}
                        {t.due_date && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(t.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteTask.mutate(t.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tasks")({
  component: TaskPlanner,
});

type Priority = "high" | "medium";
interface Task {
  id: string;
  title: string;
  priority: Priority;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = "bizpulse:tasks";

const defaults: Task[] = [
  { id: "t1", title: "Restock inventory in stockroom", priority: "high", done: false, createdAt: Date.now() - 3000 },
  { id: "t2", title: "Review monthly accounts with bookkeeper", priority: "medium", done: false, createdAt: Date.now() - 2000 },
  { id: "t3", title: "Call back vendor about September order", priority: "high", done: true, createdAt: Date.now() - 1000 },
];

function TaskPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setTasks(raw ? JSON.parse(raw) : defaults);
    } catch {
      setTasks(defaults);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setTasks((arr) => [
      { id: crypto.randomUUID(), title: t, priority, done: false, createdAt: Date.now() },
      ...arr,
    ]);
    setTitle("");
    toast.success("New Task Saved Successfully");
  };

  const toggle = (id: string) =>
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => {
    setTasks((arr) => arr.filter((t) => t.id !== id));
    toast("Task removed");
  };

  const remaining = tasks.filter((t) => !t.done).length;
  const highPriority = tasks.filter((t) => !t.done && t.priority === "high").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Team Task & Schedule Planner</h1>
        <p className="mt-1 text-muted-foreground">Plan your day. Tasks save automatically to this device.</p>
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
          <CardTitle className="text-base">Add a task</CardTitle>
          <CardDescription>Quickly capture what your team needs to do.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="e.g. Restock inventory"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="sm:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High priority</SelectItem>
                <SelectItem value="medium">Medium priority</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit"><Plus className="mr-1 h-4 w-4" />Add task</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's plan</CardTitle>
          <CardDescription>Check off as you go — your list stays saved.</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No tasks yet. Add your first one above.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm ${t.done ? "text-muted-foreground line-through" : "font-medium"}`}>
                      {t.title}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      t.priority === "high"
                        ? "border-destructive/50 text-destructive"
                        : "border-warning/50 text-warning"
                    }
                  >
                    {t.priority}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => remove(t.id)} aria-label="Delete task">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

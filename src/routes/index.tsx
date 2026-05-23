import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, BarChart3, Users, ListChecks, ShieldCheck, Zap, Lock,
  TrendingUp, Building2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "BizPulse — Run Your Business with Clarity" },
      { name: "description", content: "A trustworthy operations dashboard for local businesses. Track sales, manage leads, and plan team tasks — no setup required." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">BizPulse</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#trust" className="hover:text-foreground transition-colors">Why BizPulse</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/app">Open Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.42_0.18_260/0.15),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Trusted by 2,400+ local businesses
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Run your business with{" "}
              <span className="text-primary">clarity, not chaos.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              BizPulse is the simple operations dashboard for local shops, agencies, and service teams.
              Track profit, manage leads, and plan your day — without spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="h-12 px-6 text-base">
                <Link to="/app">
                  Open Demo Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
                <a href="#features">See features</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No sign-up. No credit card. Your data stays in your browser.
            </p>
          </div>

          {/* Mock dashboard preview */}
          <div className="mt-16 rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <div className="ml-3 text-xs text-muted-foreground">bizpulse.app/dashboard</div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              {[
                { label: "Monthly Revenue", value: "$48,210", trend: "+12.4%", icon: TrendingUp },
                { label: "Active Leads", value: "27", trend: "+5 this week", icon: Users },
                { label: "Tasks Today", value: "8", trend: "3 high priority", icon: ListChecks },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.label}</span>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{s.value}</div>
                  <div className="mt-1 text-xs text-success">{s.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Three tools. One dashboard.</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to operate. Nothing you don't.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built for owners and managers who'd rather run their business than learn software.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BarChart3, title: "Sales & Profit Tracker",
                desc: "Enter revenue and expenses, see your net profit margin and trend chart update instantly.",
              },
              {
                icon: Users, title: "Client Lead Manager",
                desc: "A clean ledger of inquiries with color-coded statuses, instant search, and filters.",
              },
              {
                icon: ListChecks, title: "Team Task Planner",
                desc: "Daily tasks with priority levels, saved securely on your device — no account needed.",
              },
            ].map((f) => (
              <div key={f.title} className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-b border-border/60 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Built for trust. Designed for clarity.
            </h2>
            <p className="mt-4 text-muted-foreground">
              No cloud accounts, no data leaks, no monthly fees. BizPulse runs entirely in your browser — your business numbers never leave your machine.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Lock, t: "Private by default", d: "All data stored locally on your computer." },
                { icon: Zap, t: "Instant updates", d: "Numbers and charts react as you type." },
                { icon: ShieldCheck, t: "No setup, no risk", d: "Open the demo dashboard and start using it now." },
              ].map((i) => (
                <li key={i.t} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                    <i.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{i.t}</div>
                    <div className="text-sm text-muted-foreground">{i.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div id="how" className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm font-medium text-primary">How it works</div>
            <ol className="mt-4 space-y-4">
              {[
                "Open the dashboard — no sign-up required.",
                "Enter your monthly numbers, leads, and tasks.",
                "Review your profit margin, lead pipeline, and daily plan in one place.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</div>
                  <p className="pt-0.5 text-sm">{step}</p>
                </li>
              ))}
            </ol>
            <Button asChild className="mt-6 w-full">
              <Link to="/app">Open Demo Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Building2 className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Your business, organized in minutes.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of local operators who replaced spreadsheets with BizPulse.
          </p>
          <Button size="lg" asChild className="mt-8 h-12 px-8 text-base">
            <Link to="/app">Open Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Free demo</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> No account</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Data stays local</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>© 2026 BizPulse</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

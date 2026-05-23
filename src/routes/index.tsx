import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, BarChart3, Users, ListChecks, ShieldCheck, Zap, Lock,
  TrendingUp, Building2, CheckCircle2, Cloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "BizPulse — Run Your Business with Clarity" },
      { name: "description", content: "A trustworthy operations dashboard for local businesses. Track sales, manage leads, and plan team tasks in the cloud." },
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
              SaaS Infrastructure Live
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Run your business with{" "}
              <span className="text-primary">clarity, not chaos.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              BizPulse is the simple operations dashboard for local shops, agencies, and service teams.
              Track profit, manage leads, and plan your day — synchronized securely across all your devices.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="h-12 px-6 text-base">
                <Link to="/app">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
                <a href="#features">See features</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Create a free account. Your data is securely hosted in the cloud.
            </p>
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
                desc: "Daily tasks with priority levels, securely synchronized to your team's cloud account.",
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
              Built for scale. Designed for clarity.
            </h2>
            <p className="mt-4 text-muted-foreground">
              BizPulse runs on a secure PostgreSQL backend, meaning your data is always safe, backed up, and available from any device you sign in on.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Lock, t: "Secure by default", d: "Protected by industry standard Row Level Security." },
                { icon: Zap, t: "Instant updates", d: "Real-time dashboard computations backed by React Query." },
                { icon: Cloud, t: "Cloud Synced", d: "Access your dashboard from your laptop, tablet, or phone." },
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
                "Sign up for a secure account.",
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
              <Link to="/app">Access Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
            A real-time, cloud-synced dashboard designed to replace messy spreadsheets.
          </p>
          <Button size="lg" asChild className="mt-8 h-12 px-8 text-base">
            <Link to="/app">Open Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>© 2026 BizPulse</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

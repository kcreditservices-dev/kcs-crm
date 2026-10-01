import { useMemo } from "react";
import { useGetList } from "ra-core";
import { BarChart3 } from "lucide-react";
import type { Contact, Task } from "../types";

const DISPUTE_STATUSES = ["round-1", "round-2", "mov", "its"];
const ALL_STATUSES = [
  "lead",
  "onboarding",
  "round-1",
  "round-2",
  "mov",
  "its",
  "complete",
  "attorney",
];

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-blue-500",
  onboarding: "bg-amber-500",
  "round-1": "bg-green-500",
  "round-2": "bg-emerald-500",
  mov: "bg-orange-500",
  its: "bg-rose-500",
  complete: "bg-purple-500",
  attorney: "bg-red-500",
};

export const AnalyticsPage = () => {
  const { data: contacts } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "last_seen", order: "DESC" },
  });

  const { data: tasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "due_date", order: "ASC" },
  });

  const metrics = useMemo(() => {
    const total = contacts?.length ?? 0;

    // Status breakdown
    const statusCounts = new Map<string, number>();
    contacts?.forEach((c) => {
      const count = statusCounts.get(c.status) ?? 0;
      statusCounts.set(c.status, count + 1);
    });

    // Max for bar sizing
    const maxCount = Math.max(...Array.from(statusCounts.values()), 1);

    // Active in disputes
    const activeDisputes =
      contacts?.filter((c) => DISPUTE_STATUSES.includes(c.status)).length ?? 0;

    // Completed
    const completed = statusCounts.get("complete") ?? 0;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // Tasks
    const totalTasks = tasks?.length ?? 0;
    const completedTasks = tasks?.filter((t) => t.done_date).length ?? 0;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Overdue
    const now = new Date().toISOString();
    const overdue =
      tasks?.filter((t) => !t.done_date && t.due_date < now).length ?? 0;

    return {
      total,
      activeDisputes,
      completed,
      completionRate,
      statusCounts,
      maxCount,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      overdue,
    };
  }, [contacts, tasks]);

  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Client pipeline and task performance at a glance.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Total Clients
          </p>
          <p className="text-2xl font-bold">{metrics.total}</p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Active Disputes
          </p>
          <p className="text-2xl font-bold text-amber-400">
            {metrics.activeDisputes}
          </p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Completed
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {metrics.completed}
          </p>
          <p className="text-xs text-muted-foreground">
            {metrics.completionRate}% rate
          </p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Task Completion
          </p>
          <p className="text-2xl font-bold">
            {metrics.completedTasks}/{metrics.totalTasks}
          </p>
          <p className="text-xs text-muted-foreground">
            {metrics.taskCompletionRate}% done · {metrics.overdue} overdue
          </p>
        </div>
      </div>

      {/* Pipeline Breakdown */}
      <div className="glow-card glow-border p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Pipeline Breakdown
        </h2>
        <div className="space-y-3">
          {ALL_STATUSES.map((status) => {
            const count = metrics.statusCounts.get(status) ?? 0;
            const pct = (count / metrics.maxCount) * 100;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24 text-right capitalize">
                  {status.replace("-", " ")}
                </span>
                <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${STATUS_COLORS[status] ?? "bg-muted"} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-10 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

AnalyticsPage.path = "/analytics";

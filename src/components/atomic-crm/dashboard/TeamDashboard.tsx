import { useMemo } from "react";
import { useGetIdentity, useGetList } from "ra-core";
import type { Contact, Task } from "../types";
import { MetricCard } from "./MetricCard";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { TasksList } from "./TasksList";

const DISPUTE_STATUSES = ["round-1", "round-2", "mov", "its"];

export const TeamDashboard = () => {
  const { identity } = useGetIdentity();
  const salesId = identity?.id;
  const firstName = identity?.first_name ?? "Team";

  // My assigned contacts
  const { data: myContacts } = useGetList<Contact>("contacts", {
    filter: { sales_id: salesId },
    pagination: { page: 1, perPage: 500 },
    sort: { field: "last_seen", order: "DESC" },
  });

  // My tasks
  const { data: myTasks } = useGetList<Task>("tasks", {
    filter: { sales_id: salesId },
    pagination: { page: 1, perPage: 500 },
    sort: { field: "due_date", order: "ASC" },
  });

  const metrics = useMemo(() => {
    const now = new Date().toISOString();

    const myActiveDisputes =
      myContacts?.filter((c) => DISPUTE_STATUSES.includes(c.status)).length ??
      0;

    const myPendingTasks = myTasks?.filter((t) => !t.done_date).length ?? 0;

    const myOverdueTasks =
      myTasks?.filter((t) => !t.done_date && t.due_date < now).length ?? 0;

    const myTotalClients = myContacts?.length ?? 0;

    // Tasks due today
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dueTodayCount =
      myTasks?.filter(
        (t) =>
          !t.done_date &&
          t.due_date >= todayStart.toISOString() &&
          t.due_date <= todayEnd.toISOString(),
      ).length ?? 0;

    // Completed tasks (done)
    const completedTasks = myTasks?.filter((t) => t.done_date).length ?? 0;

    return {
      myActiveDisputes,
      myPendingTasks,
      myOverdueTasks,
      myTotalClients,
      dueTodayCount,
      completedTasks,
    };
  }, [myContacts, myTasks]);

  return (
    <div className="space-y-6 mt-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold glow-text">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what needs your attention today.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="My Clients"
          value={String(metrics.myTotalClients)}
          change="assigned to you"
          positive
        />
        <MetricCard
          label="Active Disputes"
          value={String(metrics.myActiveDisputes)}
          change="in progress"
          positive={false}
        />
        <MetricCard
          label="Pending Tasks"
          value={String(metrics.myPendingTasks)}
          change={
            metrics.myOverdueTasks > 0
              ? `${metrics.myOverdueTasks} overdue`
              : "on track"
          }
          positive={metrics.myOverdueTasks === 0}
        />
        <MetricCard
          label="Due Today"
          value={String(metrics.dueTodayCount)}
          change={`${metrics.completedTasks} completed`}
          positive={metrics.dueTodayCount === 0}
        />
      </div>

      {/* Work Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7">
          <div className="glow-card glow-border p-4 h-full">
            <TasksList />
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="glow-card glow-border p-4 h-full">
            <DashboardActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
};

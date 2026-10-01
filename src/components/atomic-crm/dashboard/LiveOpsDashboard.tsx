import { useGetIdentity, useGetList } from "ra-core";

import type { Contact, ContactNote } from "../types";
import { DashboardStepper } from "./DashboardStepper";
import { RevenueGoalCard } from "./RevenueGoalCard";
import { MetricCard } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";
import { HotContacts } from "./HotContacts";
import { TasksList } from "./TasksList";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { TeamDashboard } from "./TeamDashboard";
import { useDashboardMetrics } from "./useDashboardMetrics";

export const LiveOpsDashboard = () => {
  const { identity, isPending: isPendingIdentity } = useGetIdentity();

  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });

  const metrics = useDashboardMetrics();

  const isPending =
    isPendingContact || isPendingContactNotes || isPendingIdentity;

  if (isPending) {
    return null;
  }

  if (!totalContact) {
    return <DashboardStepper step={1} />;
  }

  if (!totalContactNotes) {
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;
  }

  // Team members see a focused dashboard without revenue data
  const isAdmin = identity?.administrator === true;
  if (!isAdmin) {
    return <TeamDashboard />;
  }

  return <AdminDashboard metrics={metrics} />;
};

interface AdminDashboardProps {
  metrics: ReturnType<typeof useDashboardMetrics>;
}

const AdminDashboard = ({ metrics }: AdminDashboardProps) => {
  return (
    <div className="space-y-6 mt-1">
      {/* Live Ops Header */}
      <div>
        <h1 className="text-2xl font-bold glow-text">Live Ops</h1>
        <p className="text-sm text-muted-foreground">
          Real-time revenue, customers, and growth.
        </p>
      </div>

      {/* Top Row: Revenue Goal + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueGoalCard
          current={metrics.monthlyRevenueDollars}
          goal={metrics.revenueGoal}
          percent={metrics.goalPercent}
          dayOfMonth={metrics.dayOfMonth}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
          <MetricCard
            label="Revenue Today"
            value={`$${metrics.todayRevenueDollars.toLocaleString()}`}
            change={
              metrics.todayRevenueDollars > 0
                ? `+$${metrics.todayRevenueDollars.toLocaleString()}`
                : "no sales yet"
            }
            positive={metrics.todayRevenueDollars > 0}
          />
          <MetricCard
            label="New Customers Today"
            value={String(metrics.newToday)}
            change={`${metrics.totalContacts} total`}
            positive={metrics.newToday > 0}
          />
          <MetricCard
            label="Active Disputes"
            value={String(metrics.activeDisputes)}
            change="in progress"
            positive={false}
          />
          <MetricCard
            label="Pending Tasks"
            value={String(metrics.pendingTasks)}
            change={
              metrics.overdueTasks > 0
                ? `${metrics.overdueTasks} overdue`
                : "on track"
            }
            positive={metrics.overdueTasks === 0}
          />
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={metrics.chartData} total={metrics.total30dDollars} />

      {/* Bottom Row: Activity + Tasks + Hot Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5">
          <div className="glow-card glow-border p-4 h-full">
            <DashboardActivityLog />
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="glow-card glow-border p-4 h-full">
            <TasksList />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="glow-card glow-border p-4 h-full">
            <HotContacts />
          </div>
        </div>
      </div>
    </div>
  );
};

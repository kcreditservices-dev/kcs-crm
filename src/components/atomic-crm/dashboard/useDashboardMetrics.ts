import { useMemo } from "react";
import { useGetList } from "ra-core";
import type { Contact, Task } from "../types";

interface Deal {
  id: number;
  amount: number;
  stage: string;
  created_at: string;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const DISPUTE_STATUSES = ["round-1", "round-2", "mov", "its"];
const REVENUE_GOAL = 50000;

export const useDashboardMetrics = () => {
  // Contacts added today
  const { data: newContactsToday, total: totalNewToday } = useGetList<Contact>(
    "contacts",
    {
      filter: { "first_seen@gte": startOfToday() },
      pagination: { page: 1, perPage: 500 },
      sort: { field: "first_seen", order: "DESC" },
    },
  );

  // All contacts to count active disputes
  const { data: allContacts } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "last_seen", order: "DESC" },
  });

  // Pending tasks (not done)
  const { data: allTasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "due_date", order: "ASC" },
  });

  // Deals this month (for revenue)
  const { data: dealsThisMonth } = useGetList<Deal>("deals", {
    filter: { "created_at@gte": startOfMonth() },
    pagination: { page: 1, perPage: 500 },
    sort: { field: "created_at", order: "DESC" },
  });

  // Deals today
  const { data: dealsToday } = useGetList<Deal>("deals", {
    filter: { "created_at@gte": startOfToday() },
    pagination: { page: 1, perPage: 500 },
    sort: { field: "created_at", order: "DESC" },
  });

  // Deals last 30 days (for chart)
  const { data: deals30d } = useGetList<Deal>("deals", {
    filter: { "created_at@gte": thirtyDaysAgo() },
    pagination: { page: 1, perPage: 500 },
    sort: { field: "created_at", order: "ASC" },
  });

  return useMemo(() => {
    // Active disputes: contacts with dispute-related statuses
    const activeDisputes =
      allContacts?.filter((c) => DISPUTE_STATUSES.includes(c.status)).length ??
      0;

    // Pending tasks: tasks without a done_date
    const pendingTasks = allTasks?.filter((t) => !t.done_date).length ?? 0;

    // Overdue tasks
    const now = new Date().toISOString();
    const overdueTasks =
      allTasks?.filter((t) => !t.done_date && t.due_date < now).length ?? 0;

    // Revenue this month (deals amount in cents, convert to dollars)
    const monthlyRevenue =
      dealsThisMonth?.reduce((sum, d) => sum + (d.amount ?? 0), 0) ?? 0;
    const monthlyRevenueDollars = monthlyRevenue / 100;

    // Revenue today
    const todayRevenue =
      dealsToday?.reduce((sum, d) => sum + (d.amount ?? 0), 0) ?? 0;
    const todayRevenueDollars = todayRevenue / 100;

    // Revenue goal progress
    const goalPercent = Math.min(
      100,
      Math.round((monthlyRevenueDollars / REVENUE_GOAL) * 100),
    );

    // 30-day revenue chart data: group deals by day
    const chartData = buildDailyRevenue(deals30d ?? []);

    // Total 30-day revenue
    const total30d =
      deals30d?.reduce((sum, d) => sum + (d.amount ?? 0), 0) ?? 0;
    const total30dDollars = total30d / 100;

    // New customers today
    const newToday = totalNewToday ?? newContactsToday?.length ?? 0;

    // Total contacts
    const totalContacts = allContacts?.length ?? 0;

    return {
      newToday,
      totalContacts,
      activeDisputes,
      pendingTasks,
      overdueTasks,
      monthlyRevenueDollars,
      todayRevenueDollars,
      goalPercent,
      revenueGoal: REVENUE_GOAL,
      chartData,
      total30dDollars,
      dayOfMonth: new Date().getDate(),
    };
  }, [
    allContacts,
    allTasks,
    dealsThisMonth,
    dealsToday,
    deals30d,
    newContactsToday,
    totalNewToday,
  ]);
};

/** Group deals into daily revenue buckets for the past 30 days. */
function buildDailyRevenue(deals: Deal[]): number[] {
  const days: number[] = new Array(30).fill(0);
  const now = new Date();

  for (const deal of deals) {
    const created = new Date(deal.created_at);
    const diffMs = now.getTime() - created.getTime();
    const dayIndex = 29 - Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (dayIndex >= 0 && dayIndex < 30) {
      days[dayIndex] += (deal.amount ?? 0) / 100;
    }
  }

  return days;
}

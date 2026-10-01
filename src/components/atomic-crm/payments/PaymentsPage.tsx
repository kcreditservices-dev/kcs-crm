import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  RefreshCw,
  Search,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KCS_BRAIN_URL = "https://excqqbuatvpmlhgioznh.supabase.co/rest/v1";
const KCS_BRAIN_KEY =
  import.meta.env.VITE_KCS_BRAIN_KEY ?? "";

interface Payment {
  id: string;
  contact_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  amount: number;
  plan: string;
  product_name: string;
  source: string;
  status: string;
  payment_date: string;
}

type StatusFilter = "all" | "paid" | "failed" | "refunded";
type SourceFilter = "all" | "noomerik" | "commas";

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const fetchPayments = useCallback(async () => {
    if (!KCS_BRAIN_KEY) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${KCS_BRAIN_URL}/kcs_payments?select=id,contact_id,first_name,last_name,email,phone,amount,plan,product_name,source,status,payment_date&order=payment_date.desc&limit=500`,
        {
          headers: {
            apikey: KCS_BRAIN_KEY,
            Authorization: `Bearer ${KCS_BRAIN_KEY}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (sourceFilter !== "all" && p.source !== sourceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = `${p.first_name} ${p.last_name}`.toLowerCase();
        return (
          name.includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.plan?.toLowerCase().includes(q) ||
          p.product_name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payments, statusFilter, sourceFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === "paid");
    const failed = payments.filter((p) => p.status === "failed");
    const totalRevenue = paid.reduce((sum, p) => sum + p.amount, 0);

    const now = new Date();
    const thisMonth = paid.filter((p) => {
      const d = new Date(p.payment_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = thisMonth.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      monthlyRevenue,
      paidCount: paid.length,
      failedCount: failed.length,
      failRate:
        payments.length > 0
          ? Math.round((failed.length / payments.length) * 100)
          : 0,
    };
  }, [payments]);

  return (
    <div className="space-y-6 mt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold glow-text">Payments</h1>
          <p className="text-sm text-muted-foreground">
            All transactions from Noomerik and Commas.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchPayments}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card glow-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Total Revenue
            </p>
          </div>
          <p className="text-2xl font-bold">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glow-card glow-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              This Month
            </p>
          </div>
          <p className="text-2xl font-bold">
            ${stats.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glow-card glow-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Successful
            </p>
          </div>
          <p className="text-2xl font-bold">{stats.paidCount}</p>
        </div>
        <div className="glow-card glow-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Failed ({stats.failRate}%)
            </p>
          </div>
          <p className="text-2xl font-bold">{stats.failedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, plan..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "paid", "failed", "refunded"] as StatusFilter[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full border transition-colors capitalize",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-accent",
                )}
              >
                {s}
              </button>
            ),
          )}
        </div>
        <div className="flex gap-1">
          {(["all", "noomerik", "commas"] as SourceFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-colors capitalize",
                sourceFilter === s
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "hover:bg-accent",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading && (
        <div className="text-center text-muted-foreground text-sm py-12">
          Loading payments...
        </div>
      )}

      {!loading && !KCS_BRAIN_KEY && (
        <div className="text-center text-muted-foreground text-sm py-12">
          <p>Payment data source not configured.</p>
          <p className="text-xs mt-1">
            Set VITE_KCS_BRAIN_KEY in your environment variables.
          </p>
        </div>
      )}

      {!loading && KCS_BRAIN_KEY && (
        <div className="glow-card glow-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Plan
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No payments match your filters.
                    </td>
                  </tr>
                )}
                {filtered.slice(0, 100).map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">
                          {p.first_name} {p.last_name}
                        </span>
                        {p.email && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {p.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize">{p.plan}</span>
                      {p.product_name && p.product_name !== p.plan && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {p.product_name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                          p.source === "noomerik"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400",
                        )}
                      >
                        {p.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatPaymentDate(p.payment_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 100 && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-t text-center">
              Showing 100 of {filtered.length} results
            </div>
          )}
        </div>
      )}
    </div>
  );
};

PaymentsPage.path = "/payments";

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    paid: {
      icon: CheckCircle,
      class: "bg-emerald-500/20 text-emerald-400",
      label: "Paid",
    },
    failed: {
      icon: XCircle,
      class: "bg-red-500/20 text-red-400",
      label: "Failed",
    },
    refunded: {
      icon: RotateCcw,
      class: "bg-amber-500/20 text-amber-400",
      label: "Refunded",
    },
  }[status] ?? {
    icon: CheckCircle,
    class: "bg-zinc-500/20 text-zinc-400",
    label: status,
  };

  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
        config.class,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

function formatPaymentDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffHr < 24) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }) + " today";
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

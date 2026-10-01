import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Circle,
  RefreshCw,
  Search,
  Server,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const N8N_API = "https://kingcredit.app.n8n.cloud/api/v1";
const N8N_KEY = import.meta.env.VITE_N8N_API_KEY ?? "";

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
}

interface VpsProcess {
  name: string;
  label: string;
  description: string;
  status: "online";
  type: "vps";
}

const VPS_PROCESSES: VpsProcess[] = [
  {
    name: "kay-phone",
    label: "KAY Phone Pipeline",
    description: "Handles inbound/outbound calls via RingCentral SIP",
    status: "online",
    type: "vps",
  },
  {
    name: "eric-phone",
    label: "Eric Phone Pipeline",
    description: "After-hours call handling and DM responses",
    status: "online",
    type: "vps",
  },
  {
    name: "des-sdk",
    label: "DES Dispute Engine",
    description:
      "Letter generation, CR parsing, CU/BA reports, Sue ITS pipeline",
    status: "online",
    type: "vps",
  },
  {
    name: "assets-server",
    label: "Assets Server",
    description: "Serves static assets for agents and templates",
    status: "online",
    type: "vps",
  },
  {
    name: "hook-video",
    label: "Hook Video Pipeline",
    description: "AI video generation with HeyGen and Shotstack",
    status: "online",
    type: "vps",
  },
];

type Tab = "all" | "active" | "inactive" | "vps";

export const AutomationsPage = () => {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const fetchWorkflows = useCallback(async () => {
    if (!N8N_KEY) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${N8N_API}/workflows?limit=200`, {
        headers: { "X-N8N-API-KEY": N8N_KEY },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setWorkflows(data?.data ?? []);
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const active = workflows.filter((w) => w.active);
  const inactive = workflows.filter((w) => !w.active);

  const displayWorkflows = useMemo(() => {
    const list =
      tab === "active" ? active : tab === "inactive" ? inactive : workflows;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.tags.some((t) => t.name.toLowerCase().includes(q)),
    );
  }, [workflows, active, inactive, tab, searchQuery]);

  return (
    <div className="space-y-6 mt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold glow-text">Automations</h1>
          <p className="text-sm text-muted-foreground">
            n8n workflows and VPS processes powering KCS.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchWorkflows}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Total Workflows
          </p>
          <p className="text-2xl font-bold">{workflows.length}</p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Active
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {active.length}
          </p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Inactive
          </p>
          <p className="text-2xl font-bold text-muted-foreground">
            {inactive.length}
          </p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            VPS Processes
          </p>
          <p className="text-2xl font-bold text-cyan-400">
            {VPS_PROCESSES.length}
          </p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 border-b">
          {(
            [
              ["all", `All (${workflows.length})`],
              ["active", `Active (${active.length})`],
              ["inactive", `Inactive (${inactive.length})`],
              ["vps", `VPS (${VPS_PROCESSES.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                tab === key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-muted-foreground text-sm py-12">
          Loading workflows from n8n...
        </div>
      )}

      {!loading && !N8N_KEY && (
        <div className="text-center text-muted-foreground text-sm py-12">
          <p>n8n API key not configured.</p>
          <p className="text-xs mt-1">
            Set VITE_N8N_API_KEY in your environment variables.
          </p>
        </div>
      )}

      {/* VPS Tab */}
      {tab === "vps" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {VPS_PROCESSES.map((proc) => (
            <div key={proc.name} className="glow-card glow-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-sm">{proc.label}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  Online
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {proc.description}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                PM2: {proc.name} · 149.248.3.156
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Workflow List */}
      {!loading && N8N_KEY && tab !== "vps" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {displayWorkflows.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground text-sm py-8">
              No workflows match your search.
            </div>
          )}
          {displayWorkflows.map((w) => (
            <div
              key={w.id}
              className="glow-card glow-border p-4 flex items-start gap-3"
            >
              <div className="mt-0.5">
                {w.active ? (
                  <Zap className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{w.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                      w.active
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-500/20 text-zinc-400",
                    )}
                  >
                    {w.active ? "Active" : "Inactive"}
                  </span>
                  {w.tags.map((t) => (
                    <span
                      key={t.id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Updated{" "}
                  {new Date(w.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AutomationsPage.path = "/automations";

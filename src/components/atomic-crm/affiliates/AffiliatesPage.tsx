import { UserPlus, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Affiliate {
  name: string;
  code: string;
  commission: string;
  status: "active" | "inactive";
}

const AFFILIATES: Affiliate[] = [
  { name: "Keene", code: "keene", commission: "10%", status: "active" },
  { name: "Naquan", code: "naquan", commission: "10%", status: "active" },
  { name: "Meka", code: "meka", commission: "10%", status: "active" },
  { name: "Yarely", code: "yarely", commission: "10%", status: "active" },
  { name: "Xavier", code: "xavier", commission: "10%", status: "active" },
  { name: "SLR", code: "slr", commission: "10%", status: "active" },
];

const BASE_URL = "https://getbusinesstradelines.com";

export const AffiliatesPage = () => {
  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Affiliates</h1>
        <p className="text-sm text-muted-foreground">
          Business tradeline referral partners and commission tracking.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Active Affiliates
          </p>
          <p className="text-2xl font-bold">
            {AFFILIATES.filter((a) => a.status === "active").length}
          </p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Commission Rate
          </p>
          <p className="text-2xl font-bold">10%</p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Payout Terms
          </p>
          <p className="text-sm font-medium mt-1">After wire clears</p>
        </div>
      </div>

      {/* Affiliate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AFFILIATES.map((affiliate) => (
          <AffiliateCard key={affiliate.code} affiliate={affiliate} />
        ))}
      </div>
    </div>
  );
};

AffiliatesPage.path = "/affiliates";

const AffiliateCard = ({ affiliate }: { affiliate: Affiliate }) => {
  const [copied, setCopied] = useState(false);
  const link = `${BASE_URL}?ref=${affiliate.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glow-card glow-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{affiliate.name}</p>
            <p className="text-xs text-muted-foreground">
              Code: {affiliate.code}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            affiliate.status === "active"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-zinc-500/20 text-zinc-400",
          )}
        >
          {affiliate.status}
        </span>
      </div>

      <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2 border">
        <p className="text-xs truncate flex-1 text-muted-foreground">{link}</p>
        <button
          onClick={copyLink}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>Commission: {affiliate.commission} of retail</span>
      </div>
    </div>
  );
};

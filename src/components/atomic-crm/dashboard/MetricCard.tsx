import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

export const MetricCard = ({
  label,
  value,
  change,
  positive,
}: MetricCardProps) => {
  return (
    <div className="glow-card glow-border p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            positive ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {positive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change}
        </span>
      </div>
    </div>
  );
};

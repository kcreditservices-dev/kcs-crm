const CHART_HEIGHT = 120;

interface RevenueChartProps {
  data: number[];
  total: number;
}

// Build SVG polyline points
const buildPath = (
  points: number[],
  height: number,
  maxValue: number,
): string => {
  return points
    .map((val, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y =
        maxValue > 0 ? height - (val / maxValue) * (height - 10) : height - 5;
      return `${x},${y}`;
    })
    .join(" ");
};

// Build area path (closed polygon for fill)
const buildAreaPath = (
  points: number[],
  height: number,
  maxValue: number,
): string => {
  const line = points.map((val, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y =
      maxValue > 0 ? height - (val / maxValue) * (height - 10) : height - 5;
    return `${x},${y}`;
  });
  return `0,${height} ${line.join(" ")} 100,${height}`;
};

export const RevenueChart = ({ data, total }: RevenueChartProps) => {
  const maxValue = Math.max(...data, 1);

  return (
    <div className="glow-card glow-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Revenue - 30d
          </h3>
          <p className="text-xl font-bold mt-1">${total.toLocaleString()}</p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <button className="text-foreground font-medium border-b border-current pb-0.5">
            30d
          </button>
          <button className="hover:text-foreground transition-colors">
            90d
          </button>
          <button className="hover:text-foreground transition-colors">
            1y
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 100 ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-32"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(0.75 0.15 195)"
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor="oklch(0.75 0.15 195)"
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1="0"
              y1={CHART_HEIGHT * pct}
              x2="100"
              y2={CHART_HEIGHT * pct}
              stroke="oklch(1 0 0 / 5%)"
              strokeWidth="0.3"
            />
          ))}

          {/* Area fill */}
          <polygon
            points={buildAreaPath(data, CHART_HEIGHT, maxValue)}
            fill="url(#areaGrad)"
          />

          {/* Line */}
          <polyline
            points={buildPath(data, CHART_HEIGHT, maxValue)}
            fill="none"
            stroke="oklch(0.75 0.15 195)"
            strokeWidth="0.8"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_oklch(0.75_0.15_195_/_50%)]"
          />
        </svg>
      </div>
    </div>
  );
};

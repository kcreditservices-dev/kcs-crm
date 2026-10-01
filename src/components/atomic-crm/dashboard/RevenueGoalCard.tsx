const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RevenueGoalCardProps {
  current: number;
  goal: number;
  percent: number;
  dayOfMonth: number;
}

export const RevenueGoalCard = ({
  current,
  goal,
  percent,
  dayOfMonth,
}: RevenueGoalCardProps) => {
  const strokeOffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  const remaining = goal - current;
  const dailyPace = dayOfMonth > 0 ? Math.round(current / dayOfMonth) : 0;

  return (
    <div className="glow-card glow-border p-6 flex flex-col items-center justify-center">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Monthly Revenue Goal
      </h3>

      <div className="relative glow-ring">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background ring */}
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="oklch(0.25 0.005 260)"
            strokeWidth="10"
          />
          {/* Progress ring */}
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="oklch(0.75 0.15 195)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 90 90)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold glow-text">{percent}%</span>
          <span className="text-xs text-muted-foreground">of goal</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="flex items-baseline gap-1 justify-center">
          <span className="text-2xl font-bold">
            ${current.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            of ${goal.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {remaining > 0
            ? `$${remaining.toLocaleString()} to goal`
            : "Goal reached!"}
        </p>
        <p className="text-xs text-muted-foreground">
          Pace ${dailyPace.toLocaleString()}/day actual
        </p>
      </div>
    </div>
  );
};

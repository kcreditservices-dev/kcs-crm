import { CalendarDays, ExternalLink } from "lucide-react";

export const CalendarPage = () => {
  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Consultations, follow-ups, and team schedule.
        </p>
      </div>

      {/* Embed placeholder */}
      <div className="glow-card glow-border p-6 text-center">
        <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-15" />
        <p className="text-sm font-medium">Calendar coming soon</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
          Book consultations, view team availability, and manage follow-up
          schedules. Will integrate with your existing booking system.
        </p>
      </div>
    </div>
  );
};

CalendarPage.path = "/calendar";

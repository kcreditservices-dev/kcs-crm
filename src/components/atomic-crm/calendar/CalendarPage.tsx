import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  RefreshCw,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_TOKEN = import.meta.env.VITE_GHL_TOKEN ?? "";
const GHL_LOCATION = import.meta.env.VITE_GHL_LOCATION ?? "";

interface GhlCalendar {
  id: string;
  name: string;
  calendarType: string;
}

interface GhlEvent {
  id: string;
  title: string;
  calendarId: string;
  contactId?: string;
  startTime: string;
  endTime: string;
  status?: string;
  appointmentStatus?: string;
}

const CALENDAR_COLORS: Record<string, string> = {
  "Credit Consultation": "bg-cyan-500/20 text-cyan-400",
  "Client Success": "bg-emerald-500/20 text-emerald-400",
  "Mentorship 1-on-1": "bg-purple-500/20 text-purple-400",
  "One on One call w/ Louis": "bg-amber-500/20 text-amber-400",
  "10 Min Review w/ Lou": "bg-blue-500/20 text-blue-400",
  "Current Client Calendar": "bg-rose-500/20 text-rose-400",
};

export const CalendarPage = () => {
  const [calendars, setCalendars] = useState<GhlCalendar[]>([]);
  const [events, setEvents] = useState<GhlEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const { startDate, endDate, weekLabel } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() + weekOffset * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    return { startDate: start, endDate: end, weekLabel: label };
  }, [weekOffset]);

  const ghlHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${GHL_TOKEN}`,
      Version: "2021-07-28",
    }),
    [],
  );

  const fetchData = useCallback(async () => {
    if (!GHL_TOKEN || !GHL_LOCATION) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [calRes, evtRes] = await Promise.all([
        fetch(`${GHL_BASE}/calendars/?locationId=${GHL_LOCATION}`, {
          headers: ghlHeaders,
        }),
        fetch(
          `${GHL_BASE}/calendars/events?locationId=${GHL_LOCATION}&startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`,
          { headers: ghlHeaders },
        ),
      ]);

      if (calRes.ok) {
        const calData = await calRes.json();
        setCalendars(calData?.calendars ?? []);
      }
      if (evtRes.ok) {
        const evtData = await evtRes.json();
        setEvents(evtData?.events ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [ghlHeaders, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build calendar name lookup
  const calendarMap = new Map(calendars.map((c) => [c.id, c.name]));

  // Group events by day
  const days = useMemo(() => {
    const grouped = new Map<string, GhlEvent[]>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      grouped.set(key, []);
    }

    for (const evt of events) {
      const d = new Date(evt.startTime);
      const key = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const dayEvents = grouped.get(key) ?? [];
      dayEvents.push(evt);
      grouped.set(key, dayEvents);
    }

    return grouped;
  }, [events, startDate]);

  return (
    <div className="space-y-6 mt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold glow-text">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Consultations, follow-ups, and team schedule from GHL.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchData}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Calendars
          </p>
          <p className="text-2xl font-bold">{calendars.length}</p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            This Week
          </p>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
        <div className="glow-card glow-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Calendar Types
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {calendars.map((c) => (
              <span
                key={c.id}
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  CALENDAR_COLORS[c.name] ?? "bg-muted text-muted-foreground",
                )}
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((w) => w - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Prev
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold">{weekLabel}</p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-primary hover:underline"
            >
              Back to this week
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((w) => w + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Not configured */}
      {!GHL_TOKEN && (
        <div className="text-center text-muted-foreground text-sm py-12">
          <p>GHL calendar not configured.</p>
          <p className="text-xs mt-1">
            Set VITE_GHL_TOKEN and VITE_GHL_LOCATION in your environment.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && GHL_TOKEN && (
        <div className="text-center text-muted-foreground text-sm py-12">
          Loading calendar...
        </div>
      )}

      {/* Week Grid */}
      {!loading && GHL_TOKEN && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {Array.from(days.entries()).map(([dayLabel, dayEvents]) => {
            const isToday =
              dayLabel ===
              new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
            return (
              <div
                key={dayLabel}
                className={cn(
                  "glow-card glow-border p-3 min-h-[120px]",
                  isToday && "ring-1 ring-primary/30",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold mb-2",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {dayLabel}
                  {isToday && (
                    <span className="ml-1 text-[10px] font-normal">
                      (today)
                    </span>
                  )}
                </p>
                {dayEvents.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    No events
                  </p>
                )}
                {dayEvents.map((evt) => {
                  const calName =
                    calendarMap.get(evt.calendarId) ?? "Unknown";
                  const time = new Date(evt.startTime).toLocaleTimeString(
                    "en-US",
                    { hour: "numeric", minute: "2-digit" },
                  );
                  return (
                    <div
                      key={evt.id}
                      className="mb-2 last:mb-0 p-2 rounded bg-accent/30 border border-border/30"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {time}
                        </span>
                      </div>
                      <p className="text-xs font-medium truncate">
                        {evt.title || "Appointment"}
                      </p>
                      <span
                        className={cn(
                          "text-[9px] font-semibold px-1 py-0.5 rounded mt-1 inline-block",
                          CALENDAR_COLORS[calName] ??
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {calName}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

CalendarPage.path = "/calendar";

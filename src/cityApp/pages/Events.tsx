import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Calendar, MapPin, Plus, Check, Loader2, Sparkles } from "lucide-react";
import { useApp } from "@/cityApp/CityShell";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const { auth, addDetourToPassport } = useApp();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.listEvents(),
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCreateDetour = async () => {
    if (selectedIds.length === 0) return;
    setCreating(true);
    try {
      const selectedEvents = events?.filter((e) => selectedIds.includes(e.id)) || [];
      const name = `Custom Detour: ${selectedEvents[0]?.title || "New"}`;
      const description = `A custom itinerary including ${selectedEvents.length} events.`;
      
      const detour = await api.createDetour(name, selectedIds, description);

      // Map backend ApiDetour to frontend Detour shape
      addDetourToPassport({
        id: detour.id.toString(),
        title: detour.name,
        rationale: detour.description || "",
        stops: detour.events.map(de => ({
          placeId: de.event.id.toString(), // Mocked as placeId
          why: de.event.description || "",
        })),
        durationMin: 120, // default
        mode: "walk",
        stampLabel: "Custom",
        generatedAt: Date.now(),
        contextChips: [`${selectedIds.length} events`],
      });

      navigate("/app/detour");
    } catch (error) {
      console.error("Failed to create detour", error);
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stamp" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="space-y-6">
        <header className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Explore
            </p>
            <span className="font-serif text-sm italic text-muted-foreground">Nearby Events</span>
          </div>
          <h1 className="font-serif text-4xl leading-tight">Hand-picked events for your journey.</h1>
          <p className="text-sm text-muted-foreground">
            No events are published yet.
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Explore
          </p>
          <span className="font-serif text-sm italic text-muted-foreground">Nearby Events</span>
        </div>
        <h1 className="font-serif text-4xl leading-tight">Hand-picked events for your journey.</h1>
        <p className="text-sm text-muted-foreground">
          Select events to bundle them into a custom Detour.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {events?.map((event) => (
          <div
            key={event.id}
            className={cn(
              "group relative flex flex-col rounded-3xl border p-5 transition-all",
              selectedIds.includes(event.id)
                ? "border-stamp bg-stamp/5 shadow-soft"
                : "border-border/60 bg-card hover:border-border hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-xl leading-snug">{event.title}</h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(event.start_time).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location.join(", ")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleSelect(event.id)}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                  selectedIds.includes(event.id)
                    ? "bg-stamp border-stamp text-stamp-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {selectedIds.includes(event.id) ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
            {event.description && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/80 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-24 z-40 mx-auto max-w-[500px] px-6 md:bottom-12">
          <button
            onClick={handleCreateDetour}
            disabled={creating || !auth.user}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stamp py-4 text-sm font-semibold text-stamp-foreground shadow-lift hover:opacity-90 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {auth.user 
              ? `Create Detour with ${selectedIds.length} event${selectedIds.length === 1 ? "" : "s"}`
              : "Sign in to create Detour"}
          </button>
        </div>
      )}
    </div>
  );
}

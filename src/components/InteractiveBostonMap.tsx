// Live event map for the Boston Pulse surface.
// Renders backend events on a real Leaflet map instead of the old static Boston illustration.

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2, MapPin } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

import { api, type ApiEvent } from "@/lib/api";

interface InteractiveBostonMapProps {
  height?: "sm" | "md" | "lg";
  selectedEventId?: number | null;
  onEventTap?: (eventId: number) => void;
}

const HEIGHTS = {
  sm: "h-[340px]",
  md: "h-[420px]",
  lg: "h-[520px]",
};

const DEFAULT_CENTER: LatLngTuple = [39.5, -98.35];
const DEFAULT_ZOOM = 3;

export function InteractiveBostonMap({
  height = "md",
  selectedEventId,
  onEventTap,
}: InteractiveBostonMapProps) {
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.listEvents(),
  });

  const plottedEvents = useMemo(
    () =>
      (events ?? [])
        .map((event) => {
          const location = toLatLng(event);
          return location ? { event, location } : null;
        })
        .filter((item): item is { event: ApiEvent; location: LatLngTuple } => item !== null),
    [events],
  );

  const selectedEvent = useMemo(
    () => plottedEvents.find(({ event }) => event.id === selectedEventId) ?? null,
    [plottedEvents, selectedEventId],
  );

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (plottedEvents.length === 0) return null;
    const latitudes = plottedEvents.map(({ location }) => location[0]);
    const longitudes = plottedEvents.map(({ location }) => location[1]);
    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)],
    ];
  }, [plottedEvents]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lift">
      <div className={`relative ${HEIGHTS[height]}`}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={2}
          maxZoom={16}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToBounds bounds={bounds} />
          <FocusOnEvent event={selectedEvent} />
          {plottedEvents.map(({ event, location }) => (
            <CircleMarker
              key={event.id}
              center={location}
              radius={selectedEventId === event.id ? 13 : 8}
              pathOptions={{
                color:
                  selectedEventId === event.id
                    ? "#7c2d12"
                    : event.owner_type === "city"
                      ? "#c2410c"
                      : "#0f766e",
                weight: selectedEventId === event.id ? 3 : 2,
                fillColor:
                  selectedEventId === event.id
                    ? "#fde68a"
                    : event.owner_type === "city"
                      ? "#fb923c"
                      : "#5eead4",
                fillOpacity: selectedEventId === event.id ? 1 : 0.9,
              }}
              eventHandlers={{
                click: () => onEventTap?.(event.id),
              }}
            >
              <Popup>
                <div className="space-y-1.5">
                  <p className="font-serif text-base leading-tight">{event.title}</p>
                  {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location[1].toFixed(4)}, {event.location[0].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/10 via-transparent to-transparent" />

        <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          Live backend events
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <p className="font-serif text-[11px] italic text-muted-foreground">
            OpenStreetMap · real coordinates · pinch to zoom
          </p>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-stamp" />
            {plottedEvents.length} event{plottedEvents.length === 1 ? "" : "s"}
          </div>
        </div>

        {(isLoading || isError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/75 backdrop-blur-sm">
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground shadow-soft">
                <Loader2 className="h-4 w-4 animate-spin text-stamp" />
                Loading events
              </div>
            ) : (
              <div className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground shadow-soft">
                Unable to load backend events
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FitToBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (bounds[0][0] === bounds[1][0] && bounds[0][1] === bounds[1][1]) {
      map.setView(bounds[0], 10);
      return;
    }
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 });
  }, [bounds, map]);

  return null;
}

function FocusOnEvent({ event }: { event: { event: ApiEvent; location: LatLngTuple } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!event) return;
    map.flyTo(event.location, 13, { duration: 0.6 });
  }, [event, map]);

  return null;
}

function toLatLng(event: ApiEvent): LatLngTuple | null {
  const [lng, lat] = event.location;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

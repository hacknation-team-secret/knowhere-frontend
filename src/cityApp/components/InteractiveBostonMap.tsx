// Interactive Boston map.
// Pan/zoom enabled, with a much richer stylized illustration: harbor,
// Charles River, Boston Common, Public Garden, Esplanade, district polygons,
// a soft street grid, animated dashed Detour route, and tappable place pins.

import { useMemo, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Minus, Plus, Locate } from "lucide-react";
import {
  BLUEBIKE_STATIONS,
  NEIGHBORHOODS,
  PLACES,
  placeById,
  stationById,
} from "@/cityApp/lib/boston";
import type { Detour, Neighborhood, Place } from "@/cityApp/lib/types";
import { cn } from "@/lib/utils";

interface InteractiveBostonMapProps {
  highlight?: Neighborhood;
  detour?: Detour;
  savedPlaceIds?: string[];
  onPlaceTap?: (placeId: string) => void;
  onNeighborhoodTap?: (n: Neighborhood) => void;
  height?: "sm" | "md" | "lg";
}

// Stylized district polygons (0–100 coord space). Hand-tuned to evoke
// real Boston neighborhood shapes without claiming geographic accuracy.
const DISTRICTS: { name: Neighborhood; path: string; fill: string }[] = [
  {
    name: "Harvard Square",
    path: "M 8 14 L 28 12 L 30 26 L 22 32 L 10 28 Z",
    fill: "hsl(35 35% 84%)",
  },
  {
    name: "Kendall Square",
    path: "M 30 22 L 48 22 L 48 36 L 32 38 Z",
    fill: "hsl(35 38% 86%)",
  },
  {
    name: "Beacon Hill",
    path: "M 46 38 L 58 38 L 58 48 L 46 48 Z",
    fill: "hsl(35 40% 88%)",
  },
  {
    name: "North End",
    path: "M 58 30 L 70 28 L 72 40 L 60 42 Z",
    fill: "hsl(35 42% 87%)",
  },
  {
    name: "Back Bay",
    path: "M 40 50 L 58 50 L 58 62 L 40 60 Z",
    fill: "hsl(35 36% 85%)",
  },
  {
    name: "Fenway",
    path: "M 26 56 L 40 58 L 40 70 L 28 70 Z",
    fill: "hsl(35 38% 84%)",
  },
  {
    name: "Seaport",
    path: "M 64 56 L 80 56 L 82 72 L 66 72 Z",
    fill: "hsl(35 36% 86%)",
  },
];

const HEIGHTS = {
  sm: "aspect-[10/8]",
  md: "aspect-[10/9]",
  lg: "aspect-[10/11]",
};

export function InteractiveBostonMap({
  highlight,
  detour,
  savedPlaceIds = [],
  onPlaceTap,
  onNeighborhoodTap,
  height = "md",
}: InteractiveBostonMapProps) {
  const [hoverPlace, setHoverPlace] = useState<Place | null>(null);

  const detourPlaceIds = new Set((detour?.stops ?? []).map((s) => s.placeId));
  const visiblePlaces = useMemo(() => {
    const detourPlaces = PLACES.filter((p) => detourPlaceIds.has(p.id));
    const others = PLACES.filter((p) => !detourPlaceIds.has(p.id));
    return [...detourPlaces, ...others];
  }, [detourPlaceIds]);

  const routePath = useMemo(() => {
    if (!detour) return "";
    const pts = detour.stops
      .map((s) => placeById(s.placeId))
      .filter(Boolean)
      .map((p) => `${p!.x},${p!.y}`);
    if (pts.length < 2) return "";
    return `M ${pts.join(" L ")}`;
  }, [detour]);

  const pickup = detour?.pickupStationId ? stationById(detour.pickupStationId) : undefined;
  const dropoff = detour?.dropoffStationId ? stationById(detour.dropoffStationId) : undefined;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lift">
      <TransformWrapper
        initialScale={1}
        minScale={0.85}
        maxScale={3.5}
        wheel={{ step: 0.1 }}
        doubleClick={{ mode: "zoomIn", step: 0.6 }}
        panning={{ velocityDisabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperClass={cn("!w-full", HEIGHTS[height])}
              contentClass="!w-full !h-full"
            >
              <svg
                viewBox="0 0 100 90"
                className="block h-full w-full"
                role="img"
                aria-label="Interactive Boston map"
              >
                <defs>
                  <linearGradient id="paperBg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(38 55% 96%)" />
                    <stop offset="100%" stopColor="hsl(30 38% 89%)" />
                  </linearGradient>
                  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(190 55% 78%)" />
                    <stop offset="100%" stopColor="hsl(195 50% 68%)" />
                  </linearGradient>
                  <linearGradient id="park" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(95 32% 68%)" />
                    <stop offset="100%" stopColor="hsl(100 28% 58%)" />
                  </linearGradient>
                  <pattern id="streets" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
                    <path
                      d="M 3.5 0 L 0 0 0 3.5"
                      fill="none"
                      stroke="hsl(28 22% 78%)"
                      strokeWidth="0.12"
                      opacity="0.55"
                    />
                  </pattern>
                  <pattern id="diag" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                    <line x1="0" y1="0" x2="0" y2="2.4" stroke="hsl(28 22% 75%)" strokeWidth="0.1" opacity="0.4" />
                  </pattern>
                  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
                    <feOffset dy="0.4" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.35" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Paper base */}
                <rect width="100" height="90" fill="url(#paperBg)" />

                {/* Boston Harbor — generous blob to lower right */}
                <path
                  d="M 70 50 Q 82 48, 92 54 Q 102 60, 100 78 L 100 90 L 60 90 Q 58 78, 64 66 Q 68 56, 70 50 Z"
                  fill="url(#water)"
                />
                {/* Harbor islands */}
                <ellipse cx="88" cy="78" rx="2.2" ry="1.1" fill="hsl(35 30% 80%)" opacity="0.85" />
                <ellipse cx="94" cy="70" rx="1.4" ry="0.7" fill="hsl(35 30% 80%)" opacity="0.85" />

                {/* Charles River — sweeping curve */}
                <path
                  d="M -4 40 C 14 32, 28 46, 44 40 S 70 22, 78 32 L 80 38 C 70 30, 50 50, 30 44 S 8 50, -4 46 Z"
                  fill="url(#water)"
                />
                <text
                  x="20"
                  y="38"
                  fontSize="2.4"
                  fill="hsl(195 55% 28%)"
                  fontStyle="italic"
                  fontFamily="serif"
                  opacity="0.85"
                >
                  Charles River
                </text>

                {/* District polygons */}
                {DISTRICTS.map((d) => {
                  const isActive = d.name === highlight;
                  return (
                    <g key={d.name}>
                      <path
                        d={d.path}
                        fill={isActive ? "hsl(14 50% 47% / 0.18)" : d.fill}
                        stroke={isActive ? "hsl(14 50% 47%)" : "hsl(28 22% 70%)"}
                        strokeWidth={isActive ? "0.45" : "0.22"}
                        strokeDasharray={isActive ? "0" : "0.6 0.6"}
                        className="cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNeighborhoodTap?.(d.name);
                        }}
                      />
                      <path d={d.path} fill="url(#streets)" pointerEvents="none" />
                    </g>
                  );
                })}

                {/* Boston Common + Public Garden + Esplanade */}
                <ellipse cx="50" cy="44" rx="3.4" ry="2.4" fill="url(#park)" opacity="0.9" />
                <ellipse cx="46" cy="45" rx="2" ry="1.4" fill="url(#park)" opacity="0.85" />
                <path
                  d="M 4 42 Q 22 38, 40 41 L 40 43 Q 22 40, 4 44 Z"
                  fill="url(#park)"
                  opacity="0.7"
                />
                <text
                  x="50"
                  y="44.5"
                  fontSize="1.4"
                  fill="hsl(95 35% 22%)"
                  fontFamily="serif"
                  fontStyle="italic"
                  textAnchor="middle"
                >
                  Common
                </text>

                {/* Fenway / Emerald Necklace patch */}
                <ellipse cx="32" cy="64" rx="3.6" ry="2.2" fill="url(#park)" opacity="0.85" />

                {/* District labels */}
                {NEIGHBORHOODS.map((n) => {
                  const isActive = n.name === highlight;
                  return (
                    <g key={n.name} className="pointer-events-none">
                      <text
                        x={n.x}
                        y={n.y - 4}
                        fontSize={isActive ? "2.6" : "2.05"}
                        fill={isActive ? "hsl(8 56% 41%)" : "hsl(25 25% 28%)"}
                        fontFamily="serif"
                        fontStyle={isActive ? "normal" : "italic"}
                        fontWeight={isActive ? 600 : 400}
                        textAnchor="middle"
                        letterSpacing="0.05"
                      >
                        {n.name}
                      </text>
                    </g>
                  );
                })}

                {/* Detour route — animated dashed ink */}
                {routePath && (
                  <>
                    <path
                      d={routePath}
                      stroke="hsl(8 56% 41% / 0.25)"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={routePath}
                      stroke="hsl(8 56% 41%)"
                      strokeWidth="0.7"
                      fill="none"
                      strokeDasharray="1.4 1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="-30"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </>
                )}

                {/* Bluebikes pickup/dropoff */}
                {pickup && (
                  <BikeMarker x={pickup.x} y={pickup.y} label="Pickup" count={pickup.bikesAvailable} />
                )}
                {dropoff && dropoff.id !== pickup?.id && (
                  <BikeMarker x={dropoff.x} y={dropoff.y} label="Dock" count={dropoff.docksAvailable} dock />
                )}

                {/* Place pins */}
                {visiblePlaces.map((p) => {
                  const isStop = detourPlaceIds.has(p.id);
                  const stopIndex = detour
                    ? detour.stops.findIndex((s) => s.placeId === p.id) + 1
                    : 0;
                  const saved = savedPlaceIds.includes(p.id);
                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaceTap?.(p.id);
                      }}
                      onMouseEnter={() => setHoverPlace(p)}
                      onMouseLeave={() => setHoverPlace((cur) => (cur?.id === p.id ? null : cur))}
                    >
                      {isStop ? (
                        <g filter="url(#softShadow)">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="2.6"
                            fill="hsl(8 56% 41%)"
                            stroke="hsl(38 55% 96%)"
                            strokeWidth="0.7"
                          />
                          <text
                            x={p.x}
                            y={p.y + 0.95}
                            fontSize="2.4"
                            fill="hsl(38 55% 96%)"
                            fontFamily="serif"
                            textAnchor="middle"
                            fontWeight={600}
                          >
                            {stopIndex}
                          </text>
                        </g>
                      ) : (
                        <>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="1.6"
                            fill="hsl(38 55% 96%)"
                            opacity="0.001"
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="0.9"
                            fill={saved ? "hsl(8 56% 41%)" : "hsl(184 45% 31%)"}
                            opacity="0.9"
                          />
                        </>
                      )}
                    </g>
                  );
                })}

                {/* Hover tooltip */}
                {hoverPlace && (
                  <g className="pointer-events-none">
                    <rect
                      x={Math.min(hoverPlace.x + 1.5, 68)}
                      y={hoverPlace.y - 4}
                      width="30"
                      height="5"
                      rx="1"
                      fill="hsl(25 25% 11%)"
                      opacity="0.92"
                    />
                    <text
                      x={Math.min(hoverPlace.x + 2.8, 69.4)}
                      y={hoverPlace.y - 0.6}
                      fontSize="1.9"
                      fill="hsl(38 55% 96%)"
                      fontFamily="serif"
                    >
                      {hoverPlace.name}
                    </text>
                  </g>
                )}

                {/* Compass rose */}
                <g transform="translate(91, 8)" className="pointer-events-none">
                  <circle r="3.4" fill="hsl(38 55% 96%)" stroke="hsl(25 25% 25%)" strokeWidth="0.25" />
                  <path d="M 0 -2.6 L 0.7 0 L 0 2.6 L -0.7 0 Z" fill="hsl(8 56% 41%)" />
                  <text fontSize="1.6" textAnchor="middle" y="-3.7" fontFamily="serif" fontWeight="600">
                    N
                  </text>
                </g>

                {/* All other Bluebikes stations as small ghost markers */}
                {BLUEBIKE_STATIONS.filter(
                  (s) => s.id !== pickup?.id && s.id !== dropoff?.id,
                ).map((s) => (
                  <g key={s.id} className="pointer-events-none">
                    <circle cx={s.x} cy={s.y} r="0.55" fill="hsl(184 45% 31%)" opacity="0.45" />
                  </g>
                ))}
              </svg>
            </TransformComponent>

            {/* Floating controls */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
              <MapButton onClick={() => zoomIn()} aria-label="Zoom in">
                <Plus className="h-4 w-4" strokeWidth={2.2} />
              </MapButton>
              <MapButton onClick={() => zoomOut()} aria-label="Zoom out">
                <Minus className="h-4 w-4" strokeWidth={2.2} />
              </MapButton>
              <MapButton onClick={() => resetTransform()} aria-label="Recenter">
                <Locate className="h-4 w-4" strokeWidth={2.2} />
              </MapButton>
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Frame label + legend */}
      <div className="pointer-events-none absolute bottom-2 left-3 right-3 flex items-end justify-between">
        <p className="font-serif text-[11px] italic text-muted-foreground">
          Boston · stylized · pinch to zoom
        </p>
        {detour && (
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-stamp" />
            Detour route
          </div>
        )}
      </div>
    </div>
  );
}

function MapButton({
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card/95 text-foreground/80 shadow-soft backdrop-blur transition-all hover:bg-card hover:text-foreground active:scale-95"
      {...rest}
    >
      {children}
    </button>
  );
}

function BikeMarker({
  x,
  y,
  label,
  count,
  dock,
}: {
  x: number;
  y: number;
  label: string;
  count: number;
  dock?: boolean;
}) {
  return (
    <g filter="url(#softShadow)">
      <rect
        x={x - 5}
        y={y - 5.2}
        width="10"
        height="2.8"
        rx="1.2"
        fill="hsl(184 45% 31%)"
      />
      <text
        x={x}
        y={y - 3.1}
        fontSize="1.7"
        fill="hsl(38 55% 96%)"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight={600}
      >
        {label} · {count}{dock ? " docks" : ""}
      </text>
      <circle cx={x} cy={y} r="1.6" fill="hsl(38 55% 96%)" stroke="hsl(184 45% 31%)" strokeWidth="0.45" />
      <circle cx={x} cy={y} r="0.6" fill="hsl(184 45% 31%)" />
    </g>
  );
}

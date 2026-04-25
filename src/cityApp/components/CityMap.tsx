// Stylized illustrated map for non-Boston cities.
// Each city has its own water features, districts, and pinned picks.
// Pan/zoom enabled, matches the Boston map's hand-drawn paper aesthetic.

import { useMemo, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Minus, Plus, Locate } from "lucide-react";
import type { CrossCityPick } from "@/cityApp/lib/crossCity";
import { cn } from "@/lib/utils";

interface CityMapProps {
  city: string;
  picks: CrossCityPick[];
  activePickId?: string;
  onPickTap?: (pickId: string) => void;
  height?: "sm" | "md" | "lg";
}

const HEIGHTS = {
  sm: "aspect-[10/8]",
  md: "aspect-[10/9]",
  lg: "aspect-[10/11]",
};

interface District {
  name: string;
  // Polygon path in 0–100 coord space.
  path: string;
  // Centroid for label placement.
  cx: number;
  cy: number;
  fill: string;
}

interface WaterFeature {
  // Either a path (river) or ellipse (lake/bay).
  kind: "path" | "ellipse";
  d?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  label?: string;
  labelX?: number;
  labelY?: number;
}

interface ParkFeature {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  label?: string;
}

interface CityShape {
  districts: District[];
  water: WaterFeature[];
  parks: ParkFeature[];
  /** Mapping from neighborhood name → (x,y) in 0–100 space for pin placement. */
  coords: Record<string, { x: number; y: number }>;
  /** Compass orientation note. */
  flavor: string;
}

// Hand-tuned stylized city shapes. Not geographically precise — evocative.
const CITY_SHAPES: Record<string, CityShape> = {
  Paris: {
    flavor: "Paris · arrondissements · Seine",
    districts: [
      { name: "Marais", path: "M 52 36 L 64 34 L 66 46 L 54 48 Z", cx: 59, cy: 41, fill: "hsl(35 38% 86%)" },
      { name: "Latin Quarter", path: "M 44 52 L 58 52 L 58 64 L 42 62 Z", cx: 50, cy: 58, fill: "hsl(35 36% 85%)" },
      { name: "Palais-Royal", path: "M 40 30 L 52 30 L 52 42 L 40 42 Z", cx: 46, cy: 36, fill: "hsl(35 40% 87%)" },
      { name: "Ménilmontant", path: "M 70 24 L 86 24 L 88 38 L 72 40 Z", cx: 79, cy: 31, fill: "hsl(35 38% 84%)" },
      { name: "11e", path: "M 64 42 L 80 42 L 80 56 L 66 56 Z", cx: 72, cy: 49, fill: "hsl(35 36% 86%)" },
      { name: "1er", path: "M 28 36 L 40 36 L 40 48 L 28 48 Z", cx: 34, cy: 42, fill: "hsl(35 40% 87%)" },
    ],
    water: [
      {
        kind: "path",
        d: "M -4 48 C 14 44, 28 56, 44 50 S 70 38, 84 44 Q 96 48, 104 50 L 104 56 C 96 54, 84 50, 70 46 S 44 56, 30 52 S 8 56, -4 54 Z",
        label: "La Seine",
        labelX: 18,
        labelY: 53,
      },
    ],
    parks: [
      { cx: 32, cy: 40, rx: 3.6, ry: 2.4, label: "Tuileries" },
      { cx: 76, cy: 70, rx: 4.2, ry: 2.8, label: "Buttes-Chaumont" },
    ],
    coords: {
      "Palais-Royal": { x: 46, y: 36 },
      "Latin Quarter": { x: 50, y: 58 },
      "1er": { x: 34, y: 42 },
      Marais: { x: 59, y: 41 },
      "11e": { x: 72, y: 49 },
      Ménilmontant: { x: 79, y: 31 },
    },
  },
  "New York": {
    flavor: "New York · boroughs · rivers",
    districts: [
      { name: "East Village", path: "M 30 44 L 44 42 L 46 56 L 32 58 Z", cx: 38, cy: 50, fill: "hsl(35 38% 86%)" },
      { name: "Lower East Side", path: "M 32 58 L 46 56 L 48 70 L 34 72 Z", cx: 40, cy: 64, fill: "hsl(35 36% 85%)" },
      { name: "Nolita", path: "M 22 50 L 32 50 L 32 60 L 22 60 Z", cx: 27, cy: 55, fill: "hsl(35 40% 87%)" },
      { name: "Williamsburg", path: "M 60 40 L 78 38 L 80 56 L 62 58 Z", cx: 70, cy: 48, fill: "hsl(35 38% 84%)" },
      { name: "Upper East Side", path: "M 38 14 L 52 12 L 54 28 L 40 30 Z", cx: 46, cy: 21, fill: "hsl(35 36% 86%)" },
      { name: "Brooklyn", path: "M 56 60 L 80 58 L 82 78 L 58 80 Z", cx: 70, cy: 70, fill: "hsl(35 38% 85%)" },
    ],
    water: [
      {
        kind: "path",
        d: "M 48 0 L 58 0 L 58 90 L 48 90 Z",
        label: "East River",
        labelX: 51,
        labelY: 78,
      },
      {
        kind: "path",
        d: "M 0 0 L 18 0 L 18 90 L 0 90 Z",
        label: "Hudson",
        labelX: 4,
        labelY: 78,
      },
    ],
    parks: [
      { cx: 34, cy: 22, rx: 5, ry: 8, label: "Central Park" },
      { cx: 70, cy: 72, rx: 3.8, ry: 2.6, label: "Prospect" },
    ],
    coords: {
      "East Village": { x: 38, y: 50 },
      "Lower East Side": { x: 40, y: 64 },
      Nolita: { x: 27, y: 55 },
      Williamsburg: { x: 70, y: 48 },
      "Upper East Side": { x: 46, y: 21 },
      Brooklyn: { x: 70, y: 70 },
    },
  },
  Tokyo: {
    flavor: "Tokyo · wards · Sumida",
    districts: [
      { name: "Aoyama", path: "M 18 38 L 32 36 L 34 50 L 20 52 Z", cx: 26, cy: 44, fill: "hsl(35 38% 86%)" },
      { name: "Daikanyama", path: "M 12 54 L 26 54 L 26 66 L 14 68 Z", cx: 19, cy: 60, fill: "hsl(35 36% 85%)" },
      { name: "Ginza", path: "M 44 44 L 60 42 L 62 56 L 46 58 Z", cx: 53, cy: 50, fill: "hsl(35 40% 87%)" },
      { name: "Ueno", path: "M 50 18 L 68 16 L 70 32 L 52 34 Z", cx: 60, cy: 25, fill: "hsl(35 38% 84%)" },
      { name: "Azabudai", path: "M 30 56 L 44 56 L 46 68 L 32 70 Z", cx: 38, cy: 62, fill: "hsl(35 36% 86%)" },
      { name: "Toyosu", path: "M 66 60 L 84 58 L 86 74 L 68 76 Z", cx: 76, cy: 67, fill: "hsl(35 38% 85%)" },
    ],
    water: [
      {
        kind: "path",
        d: "M 60 -4 C 64 12, 70 28, 64 44 S 70 64, 78 80 L 90 88 L 100 90 L 100 -4 Z",
        label: "Sumida",
        labelX: 80,
        labelY: 18,
      },
      {
        kind: "ellipse",
        cx: 90,
        cy: 78,
        rx: 14,
        ry: 8,
        label: "Tokyo Bay",
        labelX: 84,
        labelY: 80,
      },
    ],
    parks: [
      { cx: 60, cy: 25, rx: 4.4, ry: 2.6, label: "Ueno Park" },
      { cx: 28, cy: 30, rx: 3.6, ry: 3.2, label: "Yoyogi" },
    ],
    coords: {
      Aoyama: { x: 26, y: 44 },
      Daikanyama: { x: 19, y: 60 },
      Ginza: { x: 53, y: 50 },
      Ueno: { x: 60, y: 25 },
      Azabudai: { x: 38, y: 62 },
      Toyosu: { x: 76, y: 67 },
    },
  },
  Lisbon: {
    flavor: "Lisbon · bairros · Tejo",
    districts: [
      { name: "Príncipe Real", path: "M 22 30 L 38 28 L 40 42 L 24 44 Z", cx: 31, cy: 36, fill: "hsl(35 38% 86%)" },
      { name: "Estrela", path: "M 14 46 L 30 46 L 30 58 L 16 58 Z", cx: 22, cy: 52, fill: "hsl(35 40% 87%)" },
      { name: "Alcântara", path: "M 6 60 L 24 60 L 26 72 L 8 72 Z", cx: 16, cy: 66, fill: "hsl(35 36% 85%)" },
      { name: "Rossio", path: "M 42 36 L 58 34 L 60 48 L 44 50 Z", cx: 51, cy: 42, fill: "hsl(35 38% 84%)" },
      { name: "Belém", path: "M 64 62 L 84 60 L 86 72 L 66 74 Z", cx: 75, cy: 67, fill: "hsl(35 36% 86%)" },
    ],
    water: [
      {
        kind: "path",
        d: "M -4 76 Q 30 70, 60 76 T 104 78 L 104 90 L -4 90 Z",
        label: "Rio Tejo",
        labelX: 40,
        labelY: 84,
      },
    ],
    parks: [{ cx: 22, cy: 52, rx: 3, ry: 2, label: "Jardim" }],
    coords: {
      Alcântara: { x: 16, y: 66 },
      "Príncipe Real": { x: 31, y: 36 },
      Estrela: { x: 22, y: 52 },
      Rossio: { x: 51, y: 42 },
      Belém: { x: 75, y: 67 },
    },
  },
  "San Francisco": {
    flavor: "SF · neighborhoods · bay",
    districts: [
      { name: "Mission", path: "M 42 50 L 58 48 L 60 64 L 44 66 Z", cx: 51, cy: 57, fill: "hsl(35 38% 86%)" },
      { name: "North Beach", path: "M 50 14 L 64 12 L 66 26 L 52 28 Z", cx: 58, cy: 20, fill: "hsl(35 36% 85%)" },
      { name: "SoMa", path: "M 56 30 L 72 28 L 74 42 L 58 44 Z", cx: 65, cy: 36, fill: "hsl(35 40% 87%)" },
      { name: "Hayes Valley", path: "M 30 34 L 44 34 L 44 46 L 30 46 Z", cx: 37, cy: 40, fill: "hsl(35 38% 84%)" },
    ],
    water: [
      {
        kind: "path",
        d: "M 78 0 Q 84 20, 90 40 T 100 80 L 100 0 Z",
        label: "Bay",
        labelX: 90,
        labelY: 24,
      },
      {
        kind: "path",
        d: "M 0 0 Q 20 6, 40 4 T 80 6 L 80 14 Q 60 12, 40 14 T 0 12 Z",
        label: "Golden Gate",
        labelX: 12,
        labelY: 9,
      },
    ],
    parks: [
      { cx: 50, cy: 56, rx: 3.4, ry: 2.6, label: "Dolores" },
      { cx: 16, cy: 46, rx: 7, ry: 3.2, label: "Golden Gate Park" },
    ],
    coords: {
      Mission: { x: 51, y: 57 },
      "North Beach": { x: 58, y: 20 },
      SoMa: { x: 65, y: 36 },
      "Hayes Valley": { x: 37, y: 40 },
    },
  },
  London: {
    flavor: "London · boroughs · Thames",
    districts: [
      { name: "Borough", path: "M 42 56 L 58 54 L 60 68 L 44 70 Z", cx: 51, cy: 62, fill: "hsl(35 38% 86%)" },
      { name: "Marylebone", path: "M 22 30 L 38 28 L 40 42 L 24 44 Z", cx: 31, cy: 36, fill: "hsl(35 36% 85%)" },
      { name: "Hampstead", path: "M 26 8 L 44 6 L 46 22 L 28 24 Z", cx: 36, cy: 14, fill: "hsl(35 40% 87%)" },
      { name: "Bankside", path: "M 50 40 L 64 38 L 66 50 L 52 52 Z", cx: 58, cy: 45, fill: "hsl(35 38% 84%)" },
      { name: "Smithfield", path: "M 38 38 L 50 36 L 52 48 L 40 50 Z", cx: 45, cy: 43, fill: "hsl(35 36% 86%)" },
    ],
    water: [
      {
        kind: "path",
        d: "M -4 56 Q 14 50, 30 56 T 60 58 Q 78 60, 104 56 L 104 64 Q 78 68, 60 66 T 30 64 Q 14 60, -4 64 Z",
        label: "Thames",
        labelX: 14,
        labelY: 62,
      },
    ],
    parks: [
      { cx: 36, cy: 14, rx: 6, ry: 4, label: "Heath" },
      { cx: 28, cy: 38, rx: 4, ry: 2.4, label: "Regent's" },
    ],
    coords: {
      Borough: { x: 51, y: 62 },
      Marylebone: { x: 31, y: 36 },
      Hampstead: { x: 36, y: 14 },
      Bankside: { x: 58, y: 45 },
      Smithfield: { x: 45, y: 43 },
    },
  },
  Berlin: {
    flavor: "Berlin · kieze · Spree",
    districts: [
      { name: "Mitte", path: "M 38 32 L 56 30 L 58 44 L 40 46 Z", cx: 48, cy: 38, fill: "hsl(35 38% 86%)" },
      { name: "Kreuzberg", path: "M 42 50 L 60 48 L 62 62 L 44 64 Z", cx: 52, cy: 56, fill: "hsl(35 36% 85%)" },
      { name: "Tempelhof", path: "M 30 66 L 58 64 L 60 80 L 32 82 Z", cx: 45, cy: 73, fill: "hsl(35 40% 87%)" },
      { name: "Museum Island", path: "M 50 36 L 60 36 L 60 44 L 50 44 Z", cx: 55, cy: 40, fill: "hsl(35 38% 84%)" },
    ],
    water: [
      {
        kind: "path",
        d: "M -4 44 Q 20 40, 40 46 T 80 44 Q 96 42, 104 46 L 104 52 Q 96 50, 80 50 T 40 52 Q 20 48, -4 50 Z",
        label: "Spree",
        labelX: 18,
        labelY: 49,
      },
    ],
    parks: [
      { cx: 45, cy: 73, rx: 11, ry: 5, label: "Tempelhofer Feld" },
      { cx: 76, cy: 30, rx: 5, ry: 4 },
    ],
    coords: {
      Mitte: { x: 48, y: 38 },
      Kreuzberg: { x: 52, y: 56 },
      Tempelhof: { x: 45, y: 73 },
      "Museum Island": { x: 55, y: 40 },
    },
  },
};

export function CityMap({
  city,
  picks,
  activePickId,
  onPickTap,
  height = "md",
}: CityMapProps) {
  const [hover, setHover] = useState<CrossCityPick | null>(null);
  const shape = CITY_SHAPES[city];

  // Distribute picks across the city using neighborhood coords as anchors,
  // with a small deterministic jitter so multiple picks in one neighborhood
  // don't perfectly overlap.
  const positioned = useMemo(() => {
    if (!shape) return [];
    const counts: Record<string, number> = {};
    return picks.map((p) => {
      const anchor =
        shape.coords[p.neighborhood] ?? { x: 50, y: 50 };
      const idx = (counts[p.neighborhood] = (counts[p.neighborhood] ?? 0) + 1);
      // Spiral offset for repeats.
      const angle = idx * 1.7;
      const radius = idx === 1 ? 0 : 2.2 + idx * 0.4;
      return {
        pick: p,
        x: anchor.x + Math.cos(angle) * radius,
        y: anchor.y + Math.sin(angle) * radius,
      };
    });
  }, [shape, picks]);

  if (!shape) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 px-5 py-10 text-center">
        <p className="font-serif text-lg">{city}</p>
        <p className="mt-1 text-xs text-muted-foreground">Map coming soon.</p>
      </div>
    );
  }

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
                aria-label={`Stylized ${city} map`}
              >
                <defs>
                  <linearGradient id={`paperBg-${city}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(38 55% 96%)" />
                    <stop offset="100%" stopColor="hsl(30 38% 89%)" />
                  </linearGradient>
                  <linearGradient id={`water-${city}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(190 55% 78%)" />
                    <stop offset="100%" stopColor="hsl(195 50% 68%)" />
                  </linearGradient>
                  <linearGradient id={`park-${city}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(95 32% 68%)" />
                    <stop offset="100%" stopColor="hsl(100 28% 58%)" />
                  </linearGradient>
                  <pattern id={`streets-${city}`} width="3.5" height="3.5" patternUnits="userSpaceOnUse">
                    <path
                      d="M 3.5 0 L 0 0 0 3.5"
                      fill="none"
                      stroke="hsl(28 22% 78%)"
                      strokeWidth="0.12"
                      opacity="0.55"
                    />
                  </pattern>
                  <filter id={`softShadow-${city}`} x="-20%" y="-20%" width="140%" height="140%">
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
                <rect width="100" height="90" fill={`url(#paperBg-${city})`} />

                {/* Water features */}
                {shape.water.map((w, i) => (
                  <g key={i}>
                    {w.kind === "path" ? (
                      <path d={w.d} fill={`url(#water-${city})`} />
                    ) : (
                      <ellipse
                        cx={w.cx}
                        cy={w.cy}
                        rx={w.rx}
                        ry={w.ry}
                        fill={`url(#water-${city})`}
                      />
                    )}
                    {w.label && (
                      <text
                        x={w.labelX}
                        y={w.labelY}
                        fontSize="2.4"
                        fill="hsl(195 55% 28%)"
                        fontStyle="italic"
                        fontFamily="serif"
                        opacity="0.85"
                      >
                        {w.label}
                      </text>
                    )}
                  </g>
                ))}

                {/* Districts */}
                {shape.districts.map((d) => (
                  <g key={d.name}>
                    <path
                      d={d.path}
                      fill={d.fill}
                      stroke="hsl(28 22% 70%)"
                      strokeWidth="0.22"
                      strokeDasharray="0.6 0.6"
                    />
                    <path d={d.path} fill={`url(#streets-${city})`} pointerEvents="none" />
                  </g>
                ))}

                {/* Parks */}
                {shape.parks.map((p, i) => (
                  <g key={i} className="pointer-events-none">
                    <ellipse
                      cx={p.cx}
                      cy={p.cy}
                      rx={p.rx}
                      ry={p.ry}
                      fill={`url(#park-${city})`}
                      opacity="0.9"
                    />
                    {p.label && (
                      <text
                        x={p.cx}
                        y={p.cy + 0.5}
                        fontSize="1.4"
                        fill="hsl(95 35% 22%)"
                        fontFamily="serif"
                        fontStyle="italic"
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>
                    )}
                  </g>
                ))}

                {/* District labels */}
                {shape.districts.map((d) => (
                  <text
                    key={d.name}
                    x={d.cx}
                    y={d.cy - 4.5}
                    fontSize="2.05"
                    fill="hsl(25 25% 28%)"
                    fontFamily="serif"
                    fontStyle="italic"
                    textAnchor="middle"
                    letterSpacing="0.05"
                    className="pointer-events-none"
                  >
                    {d.name}
                  </text>
                ))}

                {/* Pick pins */}
                {positioned.map(({ pick, x, y }) => {
                  const active = pick.id === activePickId;
                  return (
                    <g
                      key={pick.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPickTap?.(pick.id);
                      }}
                      onMouseEnter={() => setHover(pick)}
                      onMouseLeave={() =>
                        setHover((cur) => (cur?.id === pick.id ? null : cur))
                      }
                    >
                      <g filter={`url(#softShadow-${city})`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={active ? 2.6 : 2}
                          fill="hsl(8 56% 41%)"
                          stroke="hsl(38 55% 96%)"
                          strokeWidth="0.7"
                        />
                        <circle cx={x} cy={y} r="0.7" fill="hsl(38 55% 96%)" />
                      </g>
                    </g>
                  );
                })}

                {/* Hover tooltip */}
                {hover && (() => {
                  const pos = positioned.find((p) => p.pick.id === hover.id);
                  if (!pos) return null;
                  return (
                    <g className="pointer-events-none">
                      <rect
                        x={Math.min(pos.x + 1.5, 64)}
                        y={pos.y - 4}
                        width="34"
                        height="5"
                        rx="1"
                        fill="hsl(25 25% 11%)"
                        opacity="0.92"
                      />
                      <text
                        x={Math.min(pos.x + 2.8, 65.4)}
                        y={pos.y - 0.6}
                        fontSize="1.9"
                        fill="hsl(38 55% 96%)"
                        fontFamily="serif"
                      >
                        {hover.name}
                      </text>
                    </g>
                  );
                })()}

                {/* Compass rose */}
                <g transform="translate(91, 8)" className="pointer-events-none">
                  <circle r="3.4" fill="hsl(38 55% 96%)" stroke="hsl(25 25% 25%)" strokeWidth="0.25" />
                  <path d="M 0 -2.6 L 0.7 0 L 0 2.6 L -0.7 0 Z" fill="hsl(8 56% 41%)" />
                  <text fontSize="1.6" textAnchor="middle" y="-3.7" fontFamily="serif" fontWeight="600">
                    N
                  </text>
                </g>
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

      {/* Frame label */}
      <div className="pointer-events-none absolute bottom-2 left-3 right-3 flex items-end justify-between">
        <p className="font-serif text-[11px] italic text-muted-foreground">
          {shape.flavor} · pinch to zoom
        </p>
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <span className="inline-block h-2 w-2 rounded-full bg-stamp" />
          {picks.length} pick{picks.length === 1 ? "" : "s"}
        </div>
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

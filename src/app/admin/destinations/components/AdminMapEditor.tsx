"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { MapPin, Move, RotateCcw, Save } from "lucide-react";

interface MapPoint {
  id: string;
  name: string;
  mapLabel: string;
  x: number;
  y: number;
  category: string;
}

interface AdminMapEditorProps {
  points: MapPoint[];
  onSave: (points: MapPoint[]) => void;
  saving?: boolean;
  /** If set, only this point is editable (single-destination mode) */
  editingPointId?: string;
}

export function AdminMapEditor({
  points: initialPoints,
  onSave,
  saving,
  editingPointId,
}: AdminMapEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<MapPoint[]>(initialPoints);
  const [dragging, setDragging] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPoints(initialPoints);
    setHasChanges(false);
  }, [initialPoints]);

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      return { x: Math.round(svgP.x), y: Math.round(svgP.y) };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, pointId: string) => {
      if (editingPointId && pointId !== editingPointId) return;
      e.preventDefault();
      e.stopPropagation();
      (e.target as SVGElement).setPointerCapture(e.pointerId);
      setDragging(pointId);
    },
    [editingPointId]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const { x, y } = getSVGPoint(e.clientX, e.clientY);
      const clampedX = Math.max(20, Math.min(980, x));
      const clampedY = Math.max(20, Math.min(580, y));
      setPoints((prev) =>
        prev.map((p) =>
          p.id === dragging ? { ...p, x: clampedX, y: clampedY } : p
        )
      );
      setHasChanges(true);
    },
    [dragging, getSVGPoint]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleReset = useCallback(() => {
    setPoints(initialPoints);
    setHasChanges(false);
  }, [initialPoints]);

  const markerColor = (category: string, id: string) => {
    if (editingPointId && id !== editingPointId) return "#ffffff33";
    switch (category) {
      case "experience":
        return "#2A7B9B";
      case "activity":
        return "#4ECDC4";
      default:
        return "#C9A84C";
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Move className="w-4 h-4" />
            <span>Drag markers to reposition</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={() => onSave(points)}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Positions"}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-navy-900">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 600"
          className="w-full h-auto select-none"
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <linearGradient id="adminWaterGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#060E1A" />
              <stop offset="100%" stopColor="#0A1628" />
            </linearGradient>
            <linearGradient id="adminLandGrad" x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#121F3D" />
              <stop offset="100%" stopColor="#0F1A33" />
            </linearGradient>
            <linearGradient
              id="adminCoastGrad"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#2A7B9B" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#2A7B9B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2A7B9B" stopOpacity="0.08" />
            </linearGradient>
            <pattern
              id="adminGrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#2A7B9B"
                strokeWidth="0.3"
                opacity="0.08"
              />
            </pattern>
          </defs>

          {/* Background */}
          <rect width="1000" height="600" fill="url(#adminWaterGrad)" />
          <rect width="1000" height="600" fill="url(#adminGrid)" />

          {/* Main coastline */}
          <path
            d="M 880 0 L 750 0 C 720 50 700 90 680 130 C 660 170 640 200 600 240 C 570 270 540 290 510 310 C 480 330 460 345 440 360 C 420 375 400 390 390 405 C 380 420 375 430 372 445 C 370 460 370 475 380 500 C 390 530 410 560 430 580 L 430 600 L 1000 600 L 1000 0 Z"
            fill="url(#adminLandGrad)"
          />
          <path
            d="M 750 0 C 720 50 700 90 680 130 C 660 170 640 200 600 240 C 570 270 540 290 510 310 C 480 330 460 345 440 360 C 420 375 400 390 390 405 C 380 420 375 430 372 445 C 370 460 370 475 380 500 C 390 530 410 560 430 580"
            fill="none"
            stroke="url(#adminCoastGrad)"
            strokeWidth="2"
          />

          {/* Palm Jumeirah */}
          <g opacity="0.5">
            <ellipse
              cx="250"
              cy="210"
              rx="45"
              ry="30"
              fill="url(#adminLandGrad)"
              opacity="0.5"
            />
            <path
              d="M 200 180 C 210 160 240 150 270 160 C 300 170 310 190 300 210"
              fill="none"
              stroke="url(#adminCoastGrad)"
              strokeWidth="1.5"
            />
            <text
              x="250"
              y="250"
              textAnchor="middle"
              className="fill-white/15 text-[9px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              PALM JUMEIRAH
            </text>
          </g>

          {/* Bluewaters */}
          <g opacity="0.4">
            <circle
              cx="290"
              cy="340"
              r="15"
              fill="url(#adminLandGrad)"
              opacity="0.5"
            />
            <circle
              cx="290"
              cy="340"
              r="15"
              fill="none"
              stroke="url(#adminCoastGrad)"
              strokeWidth="1"
            />
          </g>

          {/* World Islands cluster */}
          <g opacity="0.4">
            {[
              { x: 535, y: 100, r: 4 },
              { x: 555, y: 95, r: 5 },
              { x: 560, y: 108, r: 4.5 },
              { x: 570, y: 100, r: 3 },
              { x: 565, y: 118, r: 4 },
              { x: 552, y: 130, r: 4 },
              { x: 555, y: 140, r: 3.5 },
            ].map((d, i) => (
              <ellipse
                key={i}
                cx={d.x}
                cy={d.y}
                rx={d.r}
                ry={d.r * 0.7}
                fill="url(#adminLandGrad)"
                opacity={0.4}
              />
            ))}
            <text
              x="560"
              y="155"
              textAnchor="middle"
              className="fill-white/15 text-[9px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              WORLD ISLANDS
            </text>
          </g>

          {/* Dubai Harbour (home base) */}
          <g transform="translate(350, 330)">
            <circle
              r="12"
              fill="#C9A84C"
              stroke="#C9A84C"
              strokeWidth="2"
              opacity="0.8"
            />
            <circle
              r="16"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="1"
              opacity="0.3"
            />
            <text
              y="28"
              textAnchor="middle"
              className="fill-gold-400/70 text-[10px] font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              DUBAI HARBOUR
            </text>
          </g>

          {/* Draggable markers */}
          {points.map((point) => {
            const isEditable = !editingPointId || point.id === editingPointId;
            const isDraggingThis = dragging === point.id;
            const color = markerColor(point.category, point.id);

            return (
              <g
                key={point.id}
                transform={`translate(${point.x}, ${point.y})`}
                onPointerDown={(e) => handlePointerDown(e, point.id)}
                className={isEditable ? "cursor-grab active:cursor-grabbing" : "cursor-default"}
                style={{ touchAction: "none" }}
              >
                {/* Drop shadow when dragging */}
                {isDraggingThis && (
                  <circle r="24" fill={color} opacity="0.15" />
                )}
                {/* Outer ring */}
                <circle
                  r={isDraggingThis ? 14 : 10}
                  fill="none"
                  stroke={color}
                  strokeWidth={isDraggingThis ? 2 : 1}
                  opacity={isDraggingThis ? 0.6 : 0.3}
                />
                {/* Inner circle */}
                <circle
                  r="7"
                  fill={isDraggingThis ? color : "#121F3D"}
                  stroke={color}
                  strokeWidth="1.5"
                  opacity={isEditable ? 1 : 0.3}
                />
                {/* Crosshair when dragging */}
                {isDraggingThis && (
                  <>
                    <line
                      x1="-4"
                      y1="0"
                      x2="4"
                      y2="0"
                      stroke={color}
                      strokeWidth="1"
                      opacity="0.8"
                    />
                    <line
                      x1="0"
                      y1="-4"
                      x2="0"
                      y2="4"
                      stroke={color}
                      strokeWidth="1"
                      opacity="0.8"
                    />
                  </>
                )}
                {/* Label */}
                <text
                  y="20"
                  textAnchor="middle"
                  className="fill-white/60 text-[9px] font-medium pointer-events-none"
                  style={{ fontFamily: "var(--font-heading)" }}
                  opacity={isEditable ? 0.8 : 0.25}
                >
                  {point.mapLabel || point.name}
                </text>
                {/* Coordinates */}
                {isDraggingThis && (
                  <text
                    y="32"
                    textAnchor="middle"
                    className="fill-gold-400/60 text-[8px] pointer-events-none"
                    style={{ fontFamily: "monospace" }}
                  >
                    ({point.x}, {point.y})
                  </text>
                )}
              </g>
            );
          })}

          {/* Compass */}
          <g transform="translate(90, 520)" opacity="0.2">
            <circle
              cx="0"
              cy="0"
              r="20"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="0.5"
            />
            <text
              x="0"
              y="-24"
              textAnchor="middle"
              className="fill-gold-400 text-[7px] font-bold"
            >
              N
            </text>
            <polygon
              points="0,-16 -2.5,-8 2.5,-8"
              fill="#C9A84C"
              opacity="0.5"
            />
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gold-500" />
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sea-500" />
          <span>Experience</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
          <span>Activity</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-gold-400" />
          <span>Dubai Harbour (Home Base)</span>
        </div>
      </div>
    </div>
  );
}

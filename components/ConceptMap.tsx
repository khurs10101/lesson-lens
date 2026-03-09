"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisualContent } from "@/types";
import {
  Sparkles, ImageIcon, ZoomIn, ZoomOut, Maximize2,
  MousePointer2, Network, NetworkIcon,
} from "lucide-react";
import { IS_DEMO_MODE } from "@/lib/flags";

const NODE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#ef4444", "#8b5cf6"];
const NODE_R = 28;

interface PNode {
  id: string;
  concept: string;
  emoji: string;
  description: string;
  connections: string[];
  x: number;
  y: number;
  color: string;
}

/** Lay out nodes in concentric rings, scaling with count. */
function layoutNodes(raw: VisualContent["conceptMap"]["nodes"]) {
  const n = raw.length;
  if (n === 0) return { nodes: [] as PNode[], size: 400, cx: 200, cy: 200 };

  const perRing = Math.min(n, 10);
  const ringCount = Math.ceil(n / perRing);
  const baseR = n <= 8 ? Math.max(140, n * 30) : 220;
  const gap = 150;
  const maxR = baseR + (ringCount - 1) * gap;
  const pad = 80;
  const size = (maxR + pad) * 2;
  const cx = size / 2;
  const cy = size / 2;

  let idx = 0;
  const nodes: PNode[] = [];
  for (let ring = 0; ring < ringCount; ring++) {
    const count = Math.min(perRing, n - idx);
    const r = baseR + ring * gap;
    const offset = ring % 2 === 1 ? Math.PI / count : 0;
    for (let i = 0; i < count; i++) {
      const a = (i * 2 * Math.PI) / count - Math.PI / 2 + offset;
      nodes.push({
        ...raw[idx],
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a),
        color: NODE_COLORS[idx % NODE_COLORS.length],
      });
      idx++;
    }
  }
  return { nodes, size, cx, cy };
}

export default function ConceptMap({ content }: { content: VisualContent }) {
  /* ---------- Nova Canvas ---------- */
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [canvasLoading, setCanvasLoading] = useState(false);

  useEffect(() => {
    if (IS_DEMO_MODE) return;
    const ac = new AbortController();
    setCanvasLoading(true);
    fetch("/api/canvas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        centralConcept: content.conceptMap.centralConcept,
        keywords: content.conceptMap.nodes.map((n) => n.concept),
      }),
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((d) => { if (d.imageBase64) setCanvasImage(d.imageBase64); })
      .catch((e) => { if (e.name !== "AbortError") console.error("[canvas]", e); })
      .finally(() => setCanvasLoading(false));
    return () => ac.abort();
  }, [content.conceptMap.centralConcept]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Layout ---------- */
  const { nodes, size, cx, cy } = useMemo(
    () => layoutNodes(content.conceptMap.nodes),
    [content.conceptMap.nodes]
  );
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  /* ---------- Selection ---------- */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? nodeMap.get(selectedId) ?? null : null;
  const [showAllEdges, setShowAllEdges] = useState(false);

  /* ---------- Camera (viewBox zoom/pan) ---------- */
  const initialCam = useMemo(() => ({ x: 0, y: 0, w: size, h: size }), [size]);
  const [cam, setCam] = useState(initialCam);
  const camRef = useRef(cam);
  camRef.current = cam;

  useEffect(() => { setCam(initialCam); setSelectedId(null); }, [initialCam]);

  const svgRef = useRef<SVGSVGElement>(null);
  const panRef = useRef({ active: false, mx: 0, my: 0, cx: 0, cy: 0 });

  const zoomBy = useCallback((f: number) => {
    setCam((p) => {
      const midX = p.x + p.w / 2;
      const midY = p.y + p.h / 2;
      const w = Math.max(size * 0.1, Math.min(size * 3, p.w / f));
      const h = Math.max(size * 0.1, Math.min(size * 3, p.h / f));
      return { x: midX - w / 2, y: midY - h / 2, w, h };
    });
  }, [size]);

  const fitAll = useCallback(() => setCam(initialCam), [initialCam]);

  /** Smoothly pan + zoom the camera to center on a node. */
  const zoomToNode = useCallback((node: PNode) => {
    const targetW = Math.min(size * 0.45, camRef.current.w);
    const targetH = Math.min(size * 0.45, camRef.current.h);
    setCam({
      x: node.x - targetW / 2,
      y: node.y - targetH / 2,
      w: targetW,
      h: targetH,
    });
  }, [size]);

  /** Select a node and optionally zoom to it. */
  const selectNode = useCallback((id: string | null, zoom = false) => {
    setSelectedId((prev) => {
      const next = prev === id ? null : id;
      if (next && zoom) {
        const node = nodeMap.get(next);
        if (node) zoomToNode(node);
      }
      return next;
    });
  }, [nodeMap, zoomToNode]);

  // Wheel zoom
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.2 : 0.83); };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, [zoomBy]);

  // Pointer pan — uses camRef to avoid stale closures and unnecessary re-creations
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as SVGElement).closest("[data-node]")) return;
    panRef.current = {
      active: true,
      mx: e.clientX,
      my: e.clientY,
      cx: camRef.current.x,
      cy: camRef.current.y,
    };
    svgRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!panRef.current.active) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setCam((p) => {
      const sx = p.w / rect.width;
      const sy = p.h / rect.height;
      return {
        ...p,
        x: panRef.current.cx - (e.clientX - panRef.current.mx) * sx,
        y: panRef.current.cy - (e.clientY - panRef.current.my) * sy,
      };
    });
  }, []);

  const onPointerUp = useCallback(() => { panRef.current.active = false; }, []);

  /* ---------- Edges ---------- */
  const edges = useMemo(() => {
    if (!showAllEdges && !selectedId) return [];
    const result: { from: PNode; to: PNode; highlighted: boolean }[] = [];
    for (const n of nodes) {
      for (const tid of n.connections) {
        const t = nodeMap.get(tid);
        if (!t) continue;
        const isConnectedToSelected = selectedId && (n.id === selectedId || tid === selectedId);
        if (showAllEdges || isConnectedToSelected) {
          result.push({ from: n, to: t, highlighted: !!isConnectedToSelected });
        }
      }
    }
    return result;
  }, [nodes, nodeMap, selectedId, showAllEdges]);

  // IDs connected to the selected node (for dimming unrelated nodes)
  const connectedIds = useMemo(() => {
    if (!selected) return null;
    const s = new Set(selected.connections);
    for (const n of nodes) {
      if (n.connections.includes(selected.id)) s.add(n.id);
    }
    s.add(selected.id);
    return s;
  }, [selected, nodes]);

  return (
    <div className="space-y-6">
      {/* Nova Canvas AI-generated illustration */}
      {!IS_DEMO_MODE && (
        <Card className="border-visual/20 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-visual" />
              <CardTitle className="text-visual text-base">
                AI-Generated Illustration
              </CardTitle>
              <Badge variant="outline" className="border-visual text-visual text-xs ml-auto">
                Nova Canvas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {canvasLoading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-visual opacity-60" />
                </motion.div>
                <p className="text-sm">Generating with Amazon Nova Canvas...</p>
              </div>
            ) : canvasImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${canvasImage}`}
                  alt={`AI-generated diagram of ${content.conceptMap.centralConcept}`}
                  className="rounded-lg max-h-64 object-contain border border-visual/10"
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <ImageIcon className="h-6 w-6 opacity-40" />
                <p className="text-xs">Illustration unavailable</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interactive Concept Map */}
      <Card className="border-visual/20 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-visual">
              Concept Map: {content.conceptMap.centralConcept}
            </CardTitle>
            <div className="flex items-center gap-2">
              {nodes.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {nodes.length} concept{nodes.length !== 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant="outline" className="border-visual text-visual">
                Interactive
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {nodes.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <NetworkIcon className="h-10 w-10 opacity-30" />
              <p className="text-sm">No concept map data available for this lesson.</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => zoomBy(1.3)} aria-label="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => zoomBy(0.77)} aria-label="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={fitAll} aria-label="Fit to view">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={showAllEdges ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAllEdges((v) => !v)}
                  aria-label="Toggle all connections"
                >
                  <Network className="h-4 w-4 mr-1" />
                  <span className="text-xs">Connections</span>
                </Button>
                {selectedId && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
                    Clear selection
                  </Button>
                )}
                <span className="text-xs text-muted-foreground ml-auto items-center gap-1 hidden sm:flex">
                  <MousePointer2 className="h-3 w-3" /> Click node to inspect &middot; Scroll to zoom &middot; Drag to pan
                </span>
              </div>

              {/* SVG map */}
              <div
                className="border rounded-lg overflow-hidden bg-background/50"
                style={{ touchAction: "none" }}
              >
                <svg
                  ref={svgRef}
                  viewBox={`${cam.x} ${cam.y} ${cam.w} ${cam.h}`}
                  className="w-full"
                  style={{ height: 480, cursor: "grab" }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  <defs>
                    <marker
                      id="edge-arrow"
                      markerWidth="8"
                      markerHeight="6"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 8 3, 0 6"
                        fill="hsl(var(--muted-foreground))"
                        opacity={0.6}
                      />
                    </marker>
                    <marker
                      id="edge-arrow-highlight"
                      markerWidth="8"
                      markerHeight="6"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 8 3, 0 6"
                        fill={selected?.color ?? "hsl(var(--muted-foreground))"}
                        opacity={0.8}
                      />
                    </marker>
                  </defs>

                  {/* Central label */}
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="hsl(var(--foreground))"
                    fontSize={size * 0.028}
                    fontWeight="bold"
                    opacity={0.12}
                  >
                    {content.conceptMap.centralConcept}
                  </text>

                  {/* Edges */}
                  {edges.map(({ from, to, highlighted }, i) => (
                    <line
                      key={`e-${i}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={
                        highlighted
                          ? (selected?.color ?? "hsl(var(--muted-foreground))")
                          : "hsl(var(--muted-foreground))"
                      }
                      strokeWidth={highlighted ? 2.5 : 1.2}
                      strokeDasharray={highlighted ? undefined : "6 4"}
                      opacity={highlighted ? 0.6 : 0.18}
                      markerEnd={highlighted ? "url(#edge-arrow-highlight)" : "url(#edge-arrow)"}
                    />
                  ))}

                  {/* Nodes */}
                  {nodes.map((node) => {
                    const dimmed = connectedIds !== null && !connectedIds.has(node.id);
                    const isSel = node.id === selectedId;
                    const r = isSel ? NODE_R + 4 : NODE_R;
                    const fontSize = size * 0.02;
                    return (
                      <g
                        key={node.id}
                        data-node
                        onClick={() => selectNode(node.id)}
                        onDoubleClick={() => zoomToNode(node)}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`${node.concept}: ${node.description}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectNode(node.id);
                          }
                        }}
                      >
                        {/* Selection glow */}
                        {isSel && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={r + 5}
                            fill="none"
                            stroke={node.color}
                            strokeWidth={3}
                            opacity={0.4}
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={r}
                          fill={node.color}
                          opacity={dimmed ? 0.2 : 0.9}
                          className="transition-opacity duration-200"
                        />
                        {/* Emoji inside node */}
                        <text
                          x={node.x}
                          y={node.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={r * 0.75}
                          className="pointer-events-none"
                        >
                          {node.emoji}
                        </text>
                        {/* Label below node */}
                        <text
                          x={node.x}
                          y={node.y + r + fontSize + 4}
                          textAnchor="middle"
                          fill={dimmed ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))"}
                          fontSize={fontSize}
                          fontWeight={isSel ? "bold" : "normal"}
                          opacity={dimmed ? 0.25 : 0.85}
                          className="pointer-events-none transition-opacity duration-200"
                        >
                          {node.concept}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Selected node detail panel */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="p-4 rounded-lg border"
                      style={{ borderColor: selected.color + "40" }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{selected.emoji}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-base" style={{ color: selected.color }}>
                            {selected.concept}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selected.description}
                          </p>
                          {selected.connections.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              <span className="text-xs text-muted-foreground self-center">
                                Connects to:
                              </span>
                              {selected.connections.map((cid) => {
                                const cn = nodeMap.get(cid);
                                return cn ? (
                                  <Badge
                                    key={cid}
                                    variant="outline"
                                    className="text-xs cursor-pointer hover:opacity-80"
                                    style={{ borderColor: cn.color, color: cn.color }}
                                    onClick={() => selectNode(cid, true)}
                                  >
                                    {cn.emoji} {cn.concept}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-visual/20">
        <CardHeader>
          <CardTitle className="text-visual text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-visual/20" />
            <div className="space-y-6">
              {content.timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-10"
                >
                  <div
                    className="absolute left-2 top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: NODE_COLORS[i % NODE_COLORS.length] }}
                  >
                    <span className="text-[10px]">{item.emoji}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.event}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Sections */}
      <div className="grid gap-3 md:grid-cols-3">
        {content.visualSections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-visual/20 h-full">
              <CardContent className="pt-4">
                <p className="font-semibold text-sm text-visual">
                  {section.heading}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {section.caption}
                </p>
                <p className="text-[10px] mt-2 italic text-muted-foreground/60">
                  Diagram: {section.diagramSuggestion}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

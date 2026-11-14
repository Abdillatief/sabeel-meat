import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  PenTool,
  Highlighter,
  Minus,
  Square,
  Circle,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Sun,
  Moon,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type ToolType = 'pen' | 'highlighter' | 'line' | 'rect' | 'circle' | 'eraser';

interface Point {
  x: number; // normalized 0..1 relative to canvas width
  y: number; // normalized 0..1 relative to canvas height
}

interface WhiteboardStroke {
  tool: ToolType;
  color: string;
  size: number;
  points: Point[];
}

interface RoomWhiteboardProps {
  open: boolean;
  onClose: () => void;
  courseCode: string;
  hasJitsiSession: boolean;
  onToggleJitsiWhiteboard?: () => void;
  onExported?: () => void;
}

const COLORS = [
  '#69B6FF',
  '#FFFFFF',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#A855F7',
];

const SIZES = [2, 4, 8];

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: WhiteboardStroke,
  width: number,
  height: number,
  boardDark: boolean
) {
  if (stroke.points.length === 0) return;

  const toPx = (p: Point) => ({ x: p.x * width, y: p.y * height });
  const bgColor = boardDark ? '#0D131D' : '#FFFFFF';
  const strokeColor =
    stroke.tool === 'eraser'
      ? bgColor
      : !boardDark && stroke.color === '#FFFFFF'
      ? '#0B0F15'
      : stroke.color;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.35 : 1;
  ctx.lineWidth =
    stroke.tool === 'highlighter'
      ? stroke.size * 3.5
      : stroke.tool === 'eraser'
      ? stroke.size * 4
      : stroke.size;

  if (stroke.tool === 'line') {
    const start = toPx(stroke.points[0]);
    const end = toPx(stroke.points[stroke.points.length - 1]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (stroke.tool === 'rect') {
    const start = toPx(stroke.points[0]);
    const end = toPx(stroke.points[stroke.points.length - 1]);
    ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    ctx.restore();
    return;
  }

  if (stroke.tool === 'circle') {
    const start = toPx(stroke.points[0]);
    const end = toPx(stroke.points[stroke.points.length - 1]);
    const rx = Math.abs(end.x - start.x) / 2;
    const ry = Math.abs(end.y - start.y) / 2;
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Freehand pen / highlighter / eraser
  const pts = stroke.points.map(toPx);
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i += 1) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

export function RoomWhiteboard({
  open,
  onClose,
  courseCode,
  hasJitsiSession,
  onToggleJitsiWhiteboard,
  onExported,
}: RoomWhiteboardProps) {
  const { t } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>('#69B6FF');
  const [size, setSize] = useState<number>(4);
  const [boardDark, setBoardDark] = useState<boolean>(true);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [draftStroke, setDraftStroke] = useState<WhiteboardStroke | null>(null);

  const isDrawingRef = useRef(false);
  const draftRef = useRef<WhiteboardStroke | null>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background fill
    ctx.fillStyle = boardDark ? '#0D131D' : '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Subtle dot grid
    ctx.fillStyle = boardDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.09)';
    const step = 28;
    for (let x = step; x < rect.width; x += step) {
      for (let y = step; y < rect.height; y += step) {
        ctx.fillRect(x, y, 1.25, 1.25);
      }
    }

    strokes.forEach((s) => drawStroke(ctx, s, rect.width, rect.height, boardDark));
    if (draftStroke) {
      drawStroke(ctx, draftStroke, rect.width, rect.height, boardDark);
    }

    ctx.restore();
  }, [boardDark, strokes, draftStroke]);

  useEffect(() => {
    if (!open) return;
    renderCanvas();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => renderCanvas());
    ro.observe(container);
    return () => ro.disconnect();
  }, [open, renderCanvas]);

  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height))),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getNormalizedPoint(e);
    const next: WhiteboardStroke = {
      tool,
      color,
      size,
      points: [pt],
    };
    isDrawingRef.current = true;
    draftRef.current = next;
    setDraftStroke(next);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !draftRef.current) return;
    const pt = getNormalizedPoint(e);
    const current = draftRef.current;
    const updatedPoints =
      current.tool === 'line' || current.tool === 'rect' || current.tool === 'circle'
        ? [current.points[0], pt]
        : [...current.points, pt];
    const next: WhiteboardStroke = {
      ...current,
      points: updatedPoints,
    };
    draftRef.current = next;
    setDraftStroke(next);
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (draftRef.current) {
      const committed = draftRef.current;
      setStrokes((prev) => [...prev, committed]);
    }
    draftRef.current = null;
    setDraftStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setDraftStroke(null);
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${courseCode || 'sabeel'}-whiteboard.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onExported?.();
  };

  const toolButtons: Array<{
    id: ToolType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'pen', label: t.meeting.whiteboard.pen, icon: PenTool },
    { id: 'highlighter', label: t.meeting.whiteboard.highlighter, icon: Highlighter },
    { id: 'line', label: t.meeting.whiteboard.line, icon: Minus },
    { id: 'rect', label: t.meeting.whiteboard.rect, icon: Square },
    { id: 'circle', label: t.meeting.whiteboard.circle, icon: Circle },
    { id: 'eraser', label: t.meeting.whiteboard.eraser, icon: Eraser },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.16 }}
          className="absolute inset-0 z-20 flex flex-col bg-[#0D131D]"
        >
          {/* Whiteboard Toolbar */}
          <div className="px-3 sm:px-4 py-2.5 bg-[#121822] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-white me-1.5">
                {t.meeting.whiteboard.title}
              </span>

              <div className="flex items-center gap-1 bg-[#0B0F15] p-1 rounded-[10px] border border-white/[0.08]">
                {toolButtons.map((tb) => {
                  const Icon = tb.icon;
                  const active = tool === tb.id;
                  return (
                    <button
                      key={tb.id}
                      type="button"
                      title={tb.label}
                      aria-label={tb.label}
                      aria-pressed={active}
                      onClick={() => setTool(tb.id)}
                      className={`p-1.5 rounded-[7px] transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#69B6FF] text-[#0B0F15]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1 px-1.5">
                {COLORS.map((c) => {
                  const displayColor = !boardDark && c === '#FFFFFF' ? '#0B0F15' : c;
                  const active = color === c && tool !== 'eraser';
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      onClick={() => {
                        setColor(c);
                        if (tool === 'eraser') setTool('pen');
                      }}
                      className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                        active
                          ? 'scale-125 border-white ring-2 ring-[#69B6FF]/60'
                          : 'border-white/25 hover:scale-110'
                      }`}
                      style={{ backgroundColor: displayColor }}
                    />
                  );
                })}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-1 bg-[#0B0F15] p-1 rounded-[10px] border border-white/[0.08]">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                    className={`w-6 h-6 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                      size === s
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="rounded-full bg-current block"
                      style={{ width: s + 2, height: s + 2 }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                title={boardDark ? t.meeting.whiteboard.lightBoard : t.meeting.whiteboard.darkBoard}
                aria-label={
                  boardDark ? t.meeting.whiteboard.lightBoard : t.meeting.whiteboard.darkBoard
                }
                onClick={() => setBoardDark((prev) => !prev)}
                className="p-1.5 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-colors cursor-pointer"
              >
                {boardDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                title={t.meeting.whiteboard.undo}
                aria-label={t.meeting.whiteboard.undo}
                disabled={strokes.length === 0}
                onClick={handleUndo}
                className="p-1.5 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                title={t.meeting.whiteboard.clear}
                aria-label={t.meeting.whiteboard.clear}
                disabled={strokes.length === 0}
                onClick={handleClear}
                className="p-1.5 rounded-[8px] bg-white/[0.06] hover:bg-red-500/20 text-slate-300 hover:text-red-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                title={t.meeting.whiteboard.exportPng}
                aria-label={t.meeting.whiteboard.exportPng}
                onClick={handleExportPng}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-[#69B6FF]/15 hover:bg-[#69B6FF]/25 text-xs font-medium text-[#69B6FF] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.meeting.whiteboard.exportPng}</span>
              </button>

              {hasJitsiSession && onToggleJitsiWhiteboard && (
                <button
                  type="button"
                  onClick={onToggleJitsiWhiteboard}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden md:inline">{t.meeting.whiteboard.jitsiBoard}</span>
                </button>
              )}

              <button
                type="button"
                aria-label={t.common.close}
                onClick={onClose}
                className="p-1.5 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.14] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawing Canvas */}
          <div ref={containerRef} className="flex-1 min-h-0 relative select-none">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
              className="w-full h-full block touch-none cursor-crosshair"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

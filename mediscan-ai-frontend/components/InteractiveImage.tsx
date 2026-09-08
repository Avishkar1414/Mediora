"use client";

import {
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Maximize2, Minimize2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

type InteractiveImageProps = {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const RESET_ZOOM = 1;

interface Position {
  x: number;
  y: number;
}

interface DragState {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

export default function InteractiveImage({
  src,
  alt,
  className = "",
  containerClassName = "",
}: InteractiveImageProps) {
  const [zoom, setZoom] = useState(RESET_ZOOM);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [rotation, setRotation] = useState(0);

  const dragStateRef = useRef<DragState>({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const canPan = zoom > RESET_ZOOM;

  const resetView = useCallback(() => {
    setZoom(RESET_ZOOM);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const zoomTo = useCallback((newZoom: number, resetPosition = true) => {
    setZoom((prev) => {
      const clamped = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
      if (resetPosition && prev !== RESET_ZOOM && clamped === RESET_ZOOM) {
        setPosition({ x: 0, y: 0 });
      }
      return clamped;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleWheel = useCallback(
    (e: ReactWheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => {
        const next = Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM);
        if (prev !== RESET_ZOOM && next === RESET_ZOOM) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (!canPan) return;
      e.preventDefault();
      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: position.x,
        originY: position.y,
      };
      setIsDragging(true);
    },
    [canPan, position]
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!isDragging) return;
      const { startX, startY, originX, originY } = dragStateRef.current;
      setPosition({
        x: originX + (e.clientX - startX),
        y: originY + (e.clientY - startY),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (!isLightboxOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      switch (e.key) {
        case "Escape":
          setIsLightboxOpen(false);
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleZoomIn, handleZoomOut]);

  const cursorStyle = isDragging ? "cursor-grabbing" : canPan ? "cursor-grab" : "cursor-default";

  const imageTransform = {
    transform: `scale(${zoom}) rotate(${rotation}deg)`,
    transformOrigin: "center center",
  };

  const imageStyle = {
    ...imageTransform,
    translate: `${position.x}px ${position.y}px`,
  };

  return (
    <>
      <div className={containerClassName}>
        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Zoom out"
              title="Zoom out (scroll down)"
            >
              <ZoomOut size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Out</span>
            </button>
            <output
              className="min-w-[3rem] text-center font-medium text-slate-700"
              aria-live="polite"
              aria-label={`Zoom level: ${Math.round(zoom * 100)}%`}
            >
              {Math.round(zoom * 100)}%
            </output>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Zoom in"
              title="Zoom in (scroll up)"
            >
              <ZoomIn size={15} aria-hidden="true" />
              <span className="hidden sm:inline">In</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRotate}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
              aria-label="Rotate image 90 degrees"
              title="Rotate 90°"
            >
              <RotateCw size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Rotate</span>
            </button>
            <button
              onClick={resetView}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
              aria-label="Reset image view"
              title="Reset view"
            >
              <span className="font-medium">Reset</span>
            </button>
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
              aria-label="Open fullscreen view"
              title="View fullscreen"
            >
              <Maximize2 size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Full</span>
            </button>
          </div>
        </div>

        {/* Image Viewport */}
        <div
          ref={containerRef}
          className={`relative overflow-hidden rounded-2xl bg-slate-900 ${cursorStyle}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={`max-h-[520px] max-w-full object-contain ${className}`}
            style={imageStyle}
            draggable={false}
          />

          {/* Zoom hint */}
          {zoom === RESET_ZOOM && (
            <div
              className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white"
              role="status"
              aria-live="polite"
            >
              Scroll to zoom{canPan ? " • Drag to pan" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Full size image view"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsLightboxOpen(false)}
        >
          {/* Controls */}
          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-black/70 px-4 py-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= MIN_ZOOM}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-white transition hover:bg-white/20 disabled:opacity-40"
              aria-label="Zoom out"
            >
              <ZoomOut size={18} aria-hidden="true" />
            </button>
            <output
              className="min-w-[3rem] text-center text-sm font-medium text-white"
              aria-live="polite"
              aria-label={`Zoom level: ${Math.round(zoom * 100)}%`}
            >
              {Math.round(zoom * 100)}%
            </output>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= MAX_ZOOM}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-white transition hover:bg-white/20 disabled:opacity-40"
              aria-label="Zoom in"
            >
              <ZoomIn size={18} aria-hidden="true" />
            </button>
            <div className="mx-2 h-6 w-px bg-white/30" aria-hidden="true" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRotate();
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-white transition hover:bg-white/20"
              aria-label="Rotate image 90 degrees"
            >
              <RotateCw size={18} aria-hidden="true" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetView();
              }}
              className="rounded-lg px-2 py-1.5 text-sm text-white transition hover:bg-white/20"
              aria-label="Reset image view"
            >
              Reset
            </button>
            <div className="mx-2 h-6 w-px bg-white/30" aria-hidden="true" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-white transition hover:bg-white/20"
              aria-label="Close fullscreen view"
            >
              <Minimize2 size={18} aria-hidden="true" />
              <span className="text-sm">Close</span>
            </button>
          </div>

          {/* Image Container */}
          <div
            className={`max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg ${cursorStyle}`}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={`max-h-[85vh] max-w-[90vw] object-contain ${className}`}
              style={imageStyle}
              draggable={false}
            />
          </div>

          {/* Keyboard hint */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white/80"
            role="status"
            aria-live="polite"
          >
            ESC to close • Scroll to zoom • Drag to pan
          </div>
        </div>
      )}
    </>
  );
}

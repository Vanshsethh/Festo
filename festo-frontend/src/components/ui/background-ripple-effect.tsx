"use client";;
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils.js";

export const BackgroundRippleEffect = ({
  rows = 8,
  cols = 27,
  cellSize = 56,
  interactive = true,
  autoRipple = false,
}: { rows?: number; cols?: number; cellSize?: number; interactive?: boolean; autoRipple?: boolean }) => {
  const [clickedCell, setClickedCell] = useState<{ row: number; col: number } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!autoRipple || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ripple = () => {
      setClickedCell({ row: Math.floor(Math.random() * rows), col: Math.floor(Math.random() * cols) });
      setRippleKey((key) => key + 1);
    };
    ripple();
    const timer = window.setInterval(ripple, 4200);
    return () => window.clearInterval(timer);
  }, [autoRipple, rows, cols]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 h-full w-full",
        "[--cell-border-color:rgba(139,126,255,0.15)] [--cell-fill-color:rgba(23,21,37,0.22)] [--cell-shadow-color:rgba(101,83,222,0.18)]",
      )}
    >
      <div className="relative h-auto w-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className="festo-ripple-grid"
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive={interactive}
        />
      </div>
    </div>
  );
};

const DivGrid = ({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = "#3f3f46",
  fillColor = "rgba(14,165,233,0.3)",
  clickedCell = null,
  onCellClick = () => {},
  interactive = true
}: { className?: string; rows?: number; cols?: number; cellSize?: number; borderColor?: string; fillColor?: string; clickedCell?: { row: number; col: number } | null; onCellClick?: (row: number, col: number) => void; interactive?: boolean }) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  return (
    <div className={cn("relative z-[3]", className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0; // ms
        const duration = 200 + distance * 80; // ms

        const style = clickedCell
          ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
            }
          : {};

        return (
          <div
            key={idx}
            className={cn(
              "festo-ripple-cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80",
              clickedCell && "animate-cell-ripple",
              !interactive && "pointer-events-none",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
};

"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Shows its children at a desktop width, scaled down to fit the pane it sits
 * in - so the preview keeps a real page's proportions instead of squashing to
 * a narrow column. The wrapper takes the scaled height so nothing is clipped
 * and there is no dead space underneath.
 */
export default function PreviewFrame({ width = 1200, maxHeight, children }: {
  width?: number;
  maxHeight?: string;
  children: React.ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const s = Math.min(1, o.clientWidth / width);
      setScale(s);
      setHeight(i.scrollHeight * s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={outer} className="overflow-y-auto overflow-x-hidden" style={{ maxHeight }}>
      <div style={{ height }}>
        <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

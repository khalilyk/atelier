"use client";
import Image from "next/image";
import { useImage } from "./ImagesProvider";

/**
 * A CMS-managed image slot.
 *
 * - Filled slot  → renders the uploaded photo.
 * - Empty slot   → renders `fallback` if one is supplied, otherwise NOTHING.
 *   Empty placeholders stay hidden on the live site by design.
 *
 * Wrap in <ManagedImageSlot> when the surrounding layout should also collapse.
 */
export default function ManagedImage({
  slot, alt, fallback, className, sizes, priority, fill = true,
}: {
  slot: string;
  alt: string;
  /** Optional existing/stock image to use until a real photo is uploaded. */
  fallback?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const url = useImage(slot) || fallback || "";
  if (!url) return null;
  return <Image src={url} alt={alt} fill={fill} className={className} sizes={sizes} priority={priority} />;
}

/**
 * Renders `children` only when the slot has an image (or a fallback exists).
 * Use it to hide an entire section/figure around an empty placeholder.
 */
export function ManagedImageSlot({
  slot, fallback, children,
}: { slot: string; fallback?: string; children: React.ReactNode }) {
  const url = useImage(slot) || fallback || "";
  if (!url) return null;
  return <>{children}</>;
}

/** True when the slot is an unfilled placeholder. */
export function useIsEmptySlot(slot: string, fallback?: string) {
  const url = useImage(slot) || fallback || "";
  return !url;
}

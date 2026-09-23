"use client";
import { Fragment } from "react";
import GenericBlock from "./GenericBlock";
import { BlockScope, useContentOverrides } from "./ContentProvider";
import { GENERIC_BY_TYPE, parseBlocks, type Block } from "@/lib/page-blocks";
import type { PageKind } from "@/lib/section-layout";

/**
 * Renders a page from its saved blocks. Page sections come from `sections`
 * (ready-made elements that read their text with useT) or `render` (a function
 * given the block). Each block's own text is laid over the page content.
 */
export default function BlockPage({ kind, raw, layoutKey, sections, render, variant }: {
  kind: PageKind;
  raw?: string;
  layoutKey?: string;
  sections?: Record<string, React.ReactNode>;
  render?: (block: Block) => React.ReactNode;
  /** "article" renders the blocks as plain journal content in one column. */
  variant?: "page" | "article";
}) {
  const overrides = useContentOverrides();
  const blocks = parseBlocks(raw ?? (layoutKey ? overrides[layoutKey] : ""), kind);
  return (
    <>
      {blocks.filter((b) => !b.hidden).map((b) => (
        <Fragment key={b.uid}>
          {GENERIC_BY_TYPE[b.type] ? (
            <GenericBlock block={b} variant={variant} />
          ) : (
            <BlockScope data={b.data}>{render ? render(b) : sections?.[b.type] ?? null}</BlockScope>
          )}
        </Fragment>
      ))}
    </>
  );
}

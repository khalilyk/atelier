"use client";
import BlockPage from "../../components/BlockPage";

/** A project's story: the general-purpose blocks, in order. */
export default function ProjectBody({ body, children }: { body: string; children?: React.ReactNode }) {
  return (
    <div className="px-6 md:px-8 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        <BlockPage kind="project" raw={body} variant="article" />
        {children}
      </div>
    </div>
  );
}

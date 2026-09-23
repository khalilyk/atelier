"use client";
import BlockPage from "../../components/BlockPage";

/** An article's body: the general-purpose blocks, in order. */
export default function ArticleBody({ body, children }: { body: string; children?: React.ReactNode }) {
  return (
    <div className="px-6 md:px-8 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        <BlockPage kind="journal-post" raw={body} variant="article" />
        {children}
      </div>
    </div>
  );
}

// Renders schema.org structured data. "<" is escaped so content can't close the tag.
export default function JsonLd({ data }: { data: object | (object | null)[] | null }) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!list.length) return null;
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}

// Renders a string where `backticks` mark inline code. Nothing else.
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((p) => (p.startsWith('`') && p.endsWith('`') ? <code>{p.slice(1, -1)}</code> : p))}
    </>
  );
}

export function Zone({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h1>{title}</h1>
      <p className="sub">{sub}</p>
    </>
  );
}
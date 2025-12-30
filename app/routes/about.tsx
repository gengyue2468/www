export function loader() {
  return null;
}

export function meta() {
  return [{ title: "About" }];
}

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="text-neutral-500 mt-4">此页留空。</p>
    </div>
  );
}

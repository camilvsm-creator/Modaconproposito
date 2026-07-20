export default function AlliesLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-5">
        <div className="h-8 w-56 rounded-lg bg-primary/10" />
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-lg bg-primary/10" />
          <div className="h-10 w-32 rounded-lg bg-primary/5" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 rounded-lg bg-primary/10" />
          <div className="h-10 w-28 rounded-lg bg-primary/5" />
          <div className="h-10 w-28 rounded-lg bg-primary/5" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-lg bg-primary/5" />
        ))}
      </div>
    </div>
  );
}

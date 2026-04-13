export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 animate-pulse rounded bg-slate-200 ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-[#2563EB] to-blue-700 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
            <div className="flex-1 space-y-4">
              <SkeletonBlock className="h-6 w-32 !bg-white/20" />
              <SkeletonBlock className="h-10 w-3/4 !bg-white/20" />
              <SkeletonBlock className="h-10 w-1/2 !bg-white/20" />
              <SkeletonBlock className="h-5 w-full !bg-white/15" />
              <SkeletonBlock className="h-5 w-4/5 !bg-white/15" />
            </div>
            <SkeletonBlock className="h-56 w-56 shrink-0 !rounded-full !bg-white/15" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SkeletonBlock className="mx-auto mb-8 h-8 w-48" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-slate-100 p-5">
              <SkeletonBlock className="h-40 w-full" />
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SkeletonBlock className="mb-2 h-8 w-56" />
        <SkeletonBlock className="mb-8 h-5 w-80" />
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonBlock key={i} className="h-9 w-20 !rounded-full" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-slate-100 bg-white p-5">
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimpleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SkeletonBlock className="mx-auto mb-6 h-8 w-64" />
      <SkeletonText lines={4} className="mb-8" />
      <SkeletonBlock className="mb-4 h-48 w-full" />
      <SkeletonText lines={3} />
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SkeletonBlock className="mb-6 h-8 w-48" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-white p-5">
            <SkeletonBlock className="mb-2 h-4 w-20" />
            <SkeletonBlock className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBlock key={i} className="h-9 w-24 !rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonBlock key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

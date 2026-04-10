export default function NewsCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card" aria-hidden="true">
      {!compact && <div className="h-44 skeleton" />}
      <div className={compact ? 'p-4' : 'p-5'}>
        {/* Tag pills */}
        <div className="flex gap-1.5 mb-3">
          <div className="skeleton h-5 w-14 rounded-md" />
          <div className="skeleton h-5 w-16 rounded-md" />
        </div>
        {/* Title */}
        <div className="skeleton h-4 w-full rounded mb-2" />
        <div className="skeleton h-4 w-4/5 rounded mb-4" />
        {!compact && (
          <>
            <div className="skeleton h-3 w-full rounded mb-1.5" />
            <div className="skeleton h-3 w-3/4 rounded mb-4" />
          </>
        )}
        {/* Footer */}
        <div className="pt-3 border-t border-slate-50 flex justify-between">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
      </div>
    </div>
  )
}

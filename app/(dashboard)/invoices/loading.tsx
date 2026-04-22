import { SkeletonStatCard, SkeletonTableRow } from '../../../components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="w-48 h-6 bg-[var(--bg-overlay)] rounded-md animate-pulse" />
        </div>
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="p-4 w-8"><div className="w-4 h-4 bg-[var(--bg-overlay)] rounded-sm animate-pulse" /></th>
                <th className="p-4"><div className="w-24 h-4 bg-[var(--bg-overlay)] rounded-md animate-pulse" /></th>
                <th className="p-4"><div className="w-32 h-4 bg-[var(--bg-overlay)] rounded-md animate-pulse" /></th>
                <th className="p-4"><div className="w-20 h-4 bg-[var(--bg-overlay)] rounded-md animate-pulse" /></th>
                <th className="p-4"><div className="w-16 h-4 bg-[var(--bg-overlay)] rounded-md animate-pulse" /></th>
                <th className="p-4"><div className="w-20 h-4 bg-[var(--bg-overlay)] rounded-md animate-pulse" /></th>
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRow />
              <SkeletonTableRow />
              <SkeletonTableRow />
              <SkeletonTableRow />
              <SkeletonTableRow />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-6">
          <div className="w-48 h-6 bg-[var(--bg-overlay)] rounded-md animate-pulse mb-8" />
          <div className="h-64 bg-[var(--bg-overlay)] rounded-xl animate-pulse" />
        </div>
        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-6">
          <div className="w-40 h-6 bg-[var(--bg-overlay)] rounded-md animate-pulse mb-8" />
          <div className="space-y-4">
            <div className="h-12 bg-[var(--bg-overlay)] rounded-lg animate-pulse" />
            <div className="h-12 bg-[var(--bg-overlay)] rounded-lg animate-pulse" />
            <div className="h-12 bg-[var(--bg-overlay)] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

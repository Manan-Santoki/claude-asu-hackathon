import { useDataSourceStore, type DataSourceKey } from '@/stores/useDataSourceStore'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

interface DataSourceBadgeProps {
  sourceKey: DataSourceKey
  className?: string
}

export default function DataSourceBadge({ sourceKey, className = '' }: DataSourceBadgeProps) {
  const status = useDataSourceStore((s) => s.sources[sourceKey])

  if (status === 'idle') return null

  if (status === 'loading') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground ${className}`}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading
      </span>
    )
  }

  if (status === 'live') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ${className}`}
      >
        <Wifi className="h-3 w-3" />
        Live API
      </span>
    )
  }

  // demo
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 ${className}`}
    >
      <WifiOff className="h-3 w-3" />
      Demo Data
    </span>
  )
}

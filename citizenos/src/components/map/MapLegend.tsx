import { useMapStore } from '@/stores/useMapStore'

export default function MapLegend() {
  const colorMode = useMapStore((s) => s.colorMode)

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur-sm">
        {colorMode === 'bill_activity' && <BillActivityLegend />}
        {colorMode === 'party_control' && <PartyControlLegend />}
        {colorMode === 'civic_score' && <CivicScoreLegend />}
      </div>
    </div>
  )
}

function BillActivityLegend() {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Bill Activity
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div
          className="h-3 w-24 rounded-sm"
          style={{
            background: 'linear-gradient(to right, #e5e7eb, #374151)',
          }}
        />
        <span className="text-[10px] text-muted-foreground">High</span>
      </div>
    </div>
  )
}

function PartyControlLegend() {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Party Control
      </p>
      <div className="flex flex-col gap-1.5">
        <LegendItem color="#3b82f6" label="Democrat" />
        <LegendItem color="#ef4444" label="Republican" />
        <LegendItem color="#8b5cf6" label="Split" />
      </div>
    </div>
  )
}

function CivicScoreLegend() {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Civic Score
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div
          className="h-3 w-24 rounded-sm"
          style={{
            background: 'linear-gradient(to right, #bbf7d0, #15803d)',
          }}
        />
        <span className="text-[10px] text-muted-foreground">High</span>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

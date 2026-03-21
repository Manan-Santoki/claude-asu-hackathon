import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type ColorMode } from '@/stores/useMapStore'

const colorModeOptions: { value: ColorMode; label: string }[] = [
  { value: 'bill_activity', label: 'Bill Activity' },
  { value: 'party_control', label: 'Party Control' },
  { value: 'civic_score', label: 'Civic Score' },
]

export default function MapControls() {
  const colorMode = useMapStore((s) => s.colorMode)
  const setColorMode = useMapStore((s) => s.setColorMode)

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur-sm">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Color by
        </label>
        <Select
          value={colorMode}
          onValueChange={(v) => setColorMode(v as ColorMode)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {colorModeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

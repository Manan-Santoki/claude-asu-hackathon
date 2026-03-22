import { X, Globe, Briefcase, GraduationCap, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/stores/useDemoStore'

const ICONS: Record<string, React.ElementType> = {
  Globe,
  Briefcase,
  GraduationCap,
  Store,
}

/**
 * Small badge shown in the header during active demo playback.
 * Shows current persona name + exit button.
 */
export default function DemoBadge() {
  const isActive = useDemoStore(s => s.isActive)
  const phase = useDemoStore(s => s.phase)
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const exitDemo = useDemoStore(s => s.exitDemo)

  if (!isActive || phase !== 'playing' || !selectedPersona) return null

  const Icon = ICONS[selectedPersona.icon] || Globe

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${selectedPersona.color} px-2.5 py-1 text-xs font-medium text-white shadow-md`}>
      <Icon className="h-3 w-3" />
      <span>Demo: {selectedPersona.name.split(' ')[0]}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={exitDemo}
        className="text-white/80 hover:text-white hover:bg-white/20 ml-0.5"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/stores/useDemoStore'

export default function DemoButton() {
  const startDemo = useDemoStore(s => s.startDemo)
  const isActive = useDemoStore(s => s.isActive)

  if (isActive) return null

  return (
    <Button
      onClick={startDemo}
      size="sm"
      className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25 animate-demo-pulse"
    >
      <Play className="h-3.5 w-3.5 fill-current" />
      <span className="font-semibold">Try Demo</span>
    </Button>
  )
}

import { useDemoStore } from '@/stores/useDemoStore'
import DemoEmailCapture from './DemoEmailCapture'
import DemoPersonaPicker from './DemoPersonaPicker'
import DemoNarratorBar from './DemoNarratorBar'
import DemoSpotlight from './DemoSpotlight'
import DemoProgressRail from './DemoProgressRail'
import DemoCTA from './DemoCTA'
import DemoEngine from './DemoEngine'
import DemoTransition from './DemoTransition'
import DemoCursor from './DemoCursor'
import DemoNotification from './DemoNotification'

/**
 * DemoOverlay — root demo component rendered at the app level.
 * Manages phase-specific UI and includes all demo visual layers.
 *
 * Z-index layering:
 *   10000 — email/picker/cta modals
 *   10001 — spotlight overlay
 *   10002 — progress rail + narrator bar
 *   10005 — cursor
 *   10006 — notification
 *   10010 — page transition (topmost)
 */
export default function DemoOverlay() {
  const isActive = useDemoStore(s => s.isActive)
  const phase = useDemoStore(s => s.phase)

  if (!isActive) return null

  return (
    <>
      {/* Headless orchestrator — no visual output */}
      <DemoEngine />

      {/* Phase-specific modals */}
      {phase === 'email' && <DemoEmailCapture />}
      {phase === 'picker' && <DemoPersonaPicker />}
      {phase === 'cta' && <DemoCTA />}

      {/* Always-on layers during playback */}
      {phase === 'playing' && (
        <>
          <DemoSpotlight />
          <DemoProgressRail />
          <DemoNarratorBar />
          <DemoCursor />
          <DemoNotification />
        </>
      )}

      {/* Page transition — shows during any phase */}
      <DemoTransition />
    </>
  )
}

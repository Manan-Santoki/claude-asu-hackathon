import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useMapStore } from '@/stores/useMapStore'
import { getStateByCode } from '@/lib/states'
import { getStatStats } from '@/api/map'
import BillList from '@/components/billbreaker/BillList'
import RepList from '@/components/repscore/RepList'
import ActionFeed from '@/components/actions/ActionFeed'
import CandidateList from '@/components/votemap/CandidateList'
import DataSourceBadge from '@/components/shared/DataSourceBadge'

export default function StatePanel() {
  const selectedState = useMapStore((s) => s.selectedState)
  const setSelectedState = useMapStore((s) => s.setSelectedState)

  const state = selectedState ? getStateByCode(selectedState) : null
  const stats = selectedState ? getStatStats(selectedState) : null

  const partyLabel =
    stats?.partyControl === 'D' ? 'Democrat' :
    stats?.partyControl === 'R' ? 'Republican' : 'Split'

  const partyColor =
    stats?.partyControl === 'D' ? 'bg-blue-100 text-blue-800' :
    stats?.partyControl === 'R' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'

  return (
    <Sheet
      open={!!selectedState}
      onOpenChange={(open) => {
        if (!open) setSelectedState(null)
      }}
    >
      <SheetContent side="right" className="w-[520px] sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg flex items-center gap-2">
            {state?.name ?? 'Unknown State'}
            <Badge variant="secondary" className={partyColor}>
              {partyLabel}
            </Badge>
          </SheetTitle>
          <SheetDescription className="flex items-center gap-3">
            <span>{state?.code}</span>
            {stats && (
              <span className="font-medium text-foreground">
                {stats.billCount.toLocaleString()} bills this year
              </span>
            )}
            <DataSourceBadge sourceKey="map" />
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="px-4 pb-4">
          <Tabs defaultValue="bills">
            <TabsList className="w-full">
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="reps">Reps</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
            </TabsList>

            <TabsContent value="bills" className="mt-4">
              {selectedState && <BillList stateFilter={selectedState} compact />}
            </TabsContent>

            <TabsContent value="actions" className="mt-4">
              {selectedState && <ActionFeed stateFilter={selectedState} compact limit={5} />}
            </TabsContent>

            <TabsContent value="reps" className="mt-4">
              {selectedState && <RepList stateFilter={selectedState} compact />}
            </TabsContent>

            <TabsContent value="candidates" className="mt-4">
              {selectedState && <CandidateList stateFilter={selectedState} />}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

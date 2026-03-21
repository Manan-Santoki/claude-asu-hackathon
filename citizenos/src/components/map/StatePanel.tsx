import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useMapStore } from '@/stores/useMapStore'
import { getStateByCode } from '@/lib/states'
import BillList from '@/components/billbreaker/BillList'
import RepList from '@/components/repscore/RepList'
import ActionFeed from '@/components/actions/ActionFeed'
import CandidateList from '@/components/votemap/CandidateList'

export default function StatePanel() {
  const selectedState = useMapStore((s) => s.selectedState)
  const setSelectedState = useMapStore((s) => s.setSelectedState)

  const state = selectedState ? getStateByCode(selectedState) : null

  return (
    <Sheet
      open={!!selectedState}
      onOpenChange={(open) => {
        if (!open) setSelectedState(null)
      }}
    >
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">
            {state?.name ?? 'Unknown State'}
          </SheetTitle>
          <SheetDescription>
            {state?.code} — FIPS {state?.fips}
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
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="bills" className="mt-4">
              {selectedState && <BillList stateFilter={selectedState} />}
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

            <TabsContent value="stats" className="mt-4">
              <p className="text-sm text-muted-foreground">
                State statistics coming soon.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

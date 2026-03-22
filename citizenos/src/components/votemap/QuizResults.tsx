import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuizStore } from '@/stores/useQuizStore'
import MatchList from './MatchList'
import PolicyRadar from './PolicyRadar'
import CandidateCompare from './CandidateCompare'
import { BarChart3, Radar, GitCompareArrows, CheckCircle } from 'lucide-react'

export default function QuizResults() {
  const matches = useQuizStore((s) => s.matches)
  const answers = useQuizStore((s) => s.answers)
  const policyCount = Object.keys(answers).length

  return (
    <div className="space-y-6">
      {/* Results header with gradient accent */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Your Matches</h2>
              <p className="text-sm text-primary-foreground/80">
                Based on your answers across {policyCount} policy areas
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <Tabs defaultValue="matches">
            <TabsList className="w-full sm:w-auto bg-muted/50">
              <TabsTrigger value="matches" className="gap-1.5 data-[state=active]:shadow-sm">
                <BarChart3 className="h-4 w-4" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="radar" className="gap-1.5 data-[state=active]:shadow-sm">
                <Radar className="h-4 w-4" />
                Policy Map
              </TabsTrigger>
              <TabsTrigger value="compare" className="gap-1.5 data-[state=active]:shadow-sm">
                <GitCompareArrows className="h-4 w-4" />
                Compare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="mt-5">
              <MatchList matches={matches} />
            </TabsContent>

            <TabsContent value="radar" className="mt-5">
              <PolicyRadar
                matches={matches.slice(0, 3)}
                userAnswers={answers}
              />
            </TabsContent>

            <TabsContent value="compare" className="mt-5">
              <CandidateCompare matches={matches} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

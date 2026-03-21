import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuizStore } from '@/stores/useQuizStore'
import MatchList from './MatchList'
import PolicyRadar from './PolicyRadar'
import CandidateCompare from './CandidateCompare'
import { BarChart3, Radar, GitCompareArrows } from 'lucide-react'

export default function QuizResults() {
  const matches = useQuizStore((s) => s.matches)
  const answers = useQuizStore((s) => s.answers)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Your Matches</h2>
        <p className="text-sm text-muted-foreground">
          Based on your answers across {Object.keys(answers).length} policy
          areas, here are your closest candidate matches.
        </p>
      </div>

      <Tabs defaultValue="matches">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="matches" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Rankings
          </TabsTrigger>
          <TabsTrigger value="radar" className="gap-1.5">
            <Radar className="h-4 w-4" />
            Policy Map
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-1.5">
            <GitCompareArrows className="h-4 w-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-4">
          <MatchList matches={matches} />
        </TabsContent>

        <TabsContent value="radar" className="mt-4">
          <PolicyRadar
            matches={matches.slice(0, 3)}
            userAnswers={answers}
          />
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <CandidateCompare matches={matches} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

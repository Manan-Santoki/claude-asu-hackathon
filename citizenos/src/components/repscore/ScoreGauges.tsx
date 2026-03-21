import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { RepScores } from '@/api/reps'

interface ScoreGaugesProps {
  scores: RepScores | null
  isLoading: boolean
}

function GaugeChart({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: string
}) {
  const data = [{ value, fill: color }]

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <RadialBarChart
          width={120}
          height={120}
          cx={60}
          cy={60}
          innerRadius={40}
          outerRadius={55}
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={5}
            background={{ fill: 'hsl(var(--muted))' }}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1 text-center">{label}</span>
    </div>
  )
}

export default function ScoreGauges({ scores, isLoading }: ScoreGaugesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Accountability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[140px] w-[120px] rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!scores) return null

  const alignColor =
    scores.promise_alignment_score >= 70
      ? '#22c55e'
      : scores.promise_alignment_score >= 40
      ? '#eab308'
      : '#ef4444'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Accountability Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around flex-wrap gap-4">
          <GaugeChart
            value={scores.promise_alignment_score}
            label="Promise Alignment"
            color={alignColor}
          />
          <GaugeChart
            value={scores.party_loyalty_score}
            label="Party Loyalty"
            color="#3b82f6"
          />
          <GaugeChart
            value={scores.attendance_score}
            label="Attendance"
            color="#8b5cf6"
          />
        </div>
        <div className="mt-3 pt-3 border-t text-center">
          <span className="text-sm text-muted-foreground">Overall Accountability: </span>
          <span className="font-bold text-lg">{scores.overall_accountability_score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </CardContent>
    </Card>
  )
}

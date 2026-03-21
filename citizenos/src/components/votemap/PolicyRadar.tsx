import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { POLICY_AXES } from '@/lib/policyAxes'
import type { MatchResult } from '@/api/quiz'

interface Props {
  matches: MatchResult[]
  userAnswers: Record<string, number>
}

const CANDIDATE_COLORS = ['#f59e0b', '#10b981', '#8b5cf6']

// Convert -2..+2 to 0..4 for radar display
function normalize(val: number): number {
  return val + 2
}

export default function PolicyRadar({ matches, userAnswers }: Props) {
  const data = POLICY_AXES.map((axis) => {
    const entry: Record<string, string | number> = {
      axis: axis.label,
      fullLabel: axis.label,
      user: normalize(userAnswers[axis.id] ?? 0),
    }
    matches.forEach((m, i) => {
      const bd = m.axis_breakdown[axis.id]
      entry[`cand${i}`] = bd ? normalize(bd.candidate) : 2
      entry[`cand${i}Name`] = m.candidate.name
    })
    return entry
  })

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-2">Policy Alignment Radar</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Outer = Strongly Agree (+2), Inner = Strongly Disagree (-2). Overlap means alignment.
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 4]}
            tickCount={5}
            tick={{ fontSize: 9 }}
            tickFormatter={(v: number) => {
              const labels: Record<number, string> = { 0: '-2', 1: '-1', 2: '0', 3: '+1', 4: '+2' }
              return labels[v] ?? ''
            }}
          />

          {/* User */}
          <Radar
            name="You"
            dataKey="user"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
          />

          {/* Candidates */}
          {matches.map((m, i) => (
            <Radar
              key={m.candidate.id}
              name={m.candidate.name}
              dataKey={`cand${i}`}
              stroke={CANDIDATE_COLORS[i]}
              fill={CANDIDATE_COLORS[i]}
              fillOpacity={0.08}
              strokeWidth={1.5}
              strokeDasharray={i > 0 ? '5 5' : undefined}
            />
          ))}

          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null
              return (
                <div className="bg-popover border rounded-lg shadow-lg p-3 text-xs">
                  <p className="font-semibold mb-1">{label}</p>
                  {payload.map((p) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.name}: {Number(p.value) - 2}</span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  )
}

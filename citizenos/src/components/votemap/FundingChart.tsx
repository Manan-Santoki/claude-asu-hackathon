import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  donors: { name: string; amount: number }[]
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']

function formatAmount(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val}`
}

export default function FundingChart({ donors }: Props) {
  if (donors.length === 0) return null

  const data = donors.map((d) => ({
    name: d.name.length > 25 ? d.name.slice(0, 22) + '...' : d.name,
    fullName: d.name,
    amount: d.amount,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis
          type="number"
          tickFormatter={formatAmount}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value) => formatAmount(Number(value))}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.fullName ?? ''
          }
        />
        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

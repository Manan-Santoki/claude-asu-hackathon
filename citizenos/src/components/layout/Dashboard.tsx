import { Link } from 'react-router-dom'
import { FileText, Users, ClipboardList, Zap } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageWrapper from '@/components/layout/PageWrapper'
import RepList from '@/components/repscore/RepList'
import ActionFeed from '@/components/actions/ActionFeed'

const quickLinks = [
  {
    to: '/bill/latest',
    icon: FileText,
    title: 'Saved Bills',
    description: 'Review bills you bookmarked',
  },
  {
    to: '/actions',
    icon: Zap,
    title: 'Gov Actions',
    description: 'Track orders, rules & rulings',
  },
  {
    to: '/reps',
    icon: Users,
    title: 'Followed Reps',
    description: 'Track your representatives',
  },
  {
    to: '/vote',
    icon: ClipboardList,
    title: 'Policy Quiz',
    description: 'Find your political match',
  },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Welcome back{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="text-muted-foreground mb-6">
        Here is a quick overview of your CitizenOS activity.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.to} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <link.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{link.title}</CardTitle>
              </div>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={link.to}>Go &rarr;</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions feed */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Government Actions For You</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/actions">View All</Link>
          </Button>
        </div>
        <ActionFeed limit={4} compact />
      </div>

      {user?.state_code && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Representatives</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/reps">View All</Link>
            </Button>
          </div>
          <RepList stateFilter={user.state_code} compact />
        </div>
      )}
    </PageWrapper>
  )
}

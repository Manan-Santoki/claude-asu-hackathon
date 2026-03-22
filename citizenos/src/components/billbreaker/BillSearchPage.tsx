import PageWrapper from '@/components/layout/PageWrapper'
import BillList from './BillList'

export default function BillSearchPage() {
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Bills</h1>
      <BillList />
    </PageWrapper>
  )
}

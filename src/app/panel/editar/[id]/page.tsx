import BusinessForm from '@/components/BusinessForm';

export default function EditBusinessPage({ params }: { params: { id: string } }) {
  return <BusinessForm businessId={params.id} />;
}

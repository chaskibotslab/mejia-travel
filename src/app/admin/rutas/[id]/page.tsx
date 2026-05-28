import RouteForm from '../RouteForm';

export default function EditRoutePage({ params }: { params: { id: string } }) {
  return <RouteForm routeId={params.id} />;
}

import { mockProperties } from "@/lib/mock-data";
import { PropertyDetail } from "@/components/properties/property-detail";
import { LocalPropertyLoader } from "@/components/properties/local-property-loader";

interface Props {
  params: { id: string };
}

export default function PropertyPage({ params }: Props) {
  const property = mockProperties.find(p => p.id === params.id);
  if (property) return <PropertyDetail property={property} />;
  return <LocalPropertyLoader id={params.id} />;
}

export function generateStaticParams() {
  return mockProperties.map(p => ({ id: p.id }));
}

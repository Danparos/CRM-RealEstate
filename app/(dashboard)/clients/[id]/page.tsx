import { mockClients } from "@/lib/mock-data";
import { ClientDetail } from "@/components/clients/client-detail";
import { LocalClientLoader } from "@/components/clients/local-client-loader";

interface Props {
  params: { id: string };
}

export default function ClientPage({ params }: Props) {
  const client = mockClients.find(c => c.id === params.id);

  if (client) {
    return <ClientDetail client={client} />;
  }

  // Any non-mock client — load from Supabase
  return <LocalClientLoader id={params.id} />;
}

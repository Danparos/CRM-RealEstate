import Link from "next/link";
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

  if (params.id.startsWith("local-")) {
    return <LocalClientLoader id={params.id} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="font-serif text-xl text-stone-500">Client not found</p>
      <Link href="/clients" className="text-sm text-[#B8960C] hover:underline">
        ← Back to Clients
      </Link>
    </div>
  );
}

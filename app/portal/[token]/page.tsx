import { ClientPortalView } from "@/components/portal/client-portal-view";

interface PortalData {
  client: {
    id: string;
    first_name: string;
    last_name: string;
    client_class: string;
    stage: string;
    primary_agent?: string;
    email?: string;
    phone?: string;
    language?: string;
  };
  properties: {
    id: string;
    property_ref: string;
    property_title: string;
    sent_at: string;
    thumbnail: string | null;
    token?: string;
  }[];
  documents: {
    id: string;
    file_name: string;
    file_size?: number;
    storage_path: string;
    created_at: string;
  }[];
}

async function getPortalData(token: string): Promise<PortalData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/portal/${token}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<PortalData>;
  } catch {
    return null;
  }
}

export default async function PortalPage({ params }: { params: { token: string } }) {
  const data = await getPortalData(params.token);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center text-center px-4">
        <div className="h-1.5 w-full fixed top-0 left-0 bg-gradient-to-r from-[#B8960C] via-[#e6c84a] to-[#B8960C]" />
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="font-serif text-xl font-semibold text-stone-700 mb-2">
          Portal Unavailable
        </p>
        <p className="text-stone-400 text-sm max-w-sm">
          This portal link is invalid or has expired. Please contact your agent for a new link.
        </p>
        <p className="mt-6 text-[12px] text-[#B8960C] font-semibold tracking-wide">
          Errikos Kohls Immobilien
        </p>
      </div>
    );
  }

  return (
    <ClientPortalView
      client={data.client as Parameters<typeof ClientPortalView>[0]["client"]}
      properties={data.properties}
      documents={data.documents}
    />
  );
}

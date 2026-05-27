"use client";

import ContactDetailPage from "@/app/(dashboard)/contacts/[id]/page";

export default function NewContactPage() {
  return <ContactDetailPage params={{ id: "new" }} />;
}

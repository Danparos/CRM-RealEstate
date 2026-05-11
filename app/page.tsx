import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Avatar } from "@/components/ui/avatar"
import { ClientClassBadge } from "@/components/crm/client-class-badge"
import { PriceGroupBadge } from "@/components/crm/price-group-badge"
import { PipelineStageBadge } from "@/components/crm/pipeline-stage-badge"
import { Search, Plus, Mail } from "lucide-react"

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-warm-50 p-12">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* Header */}
        <div className="border-b border-warm-200 pb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-gold-500 font-medium mb-2">Design System</p>
          <h1 className="font-serif text-5xl font-light text-warm-900 tracking-wide">
            Dan Paul
          </h1>
          <p className="text-warm-500 mt-2 tracking-widest text-sm uppercase">Immobilien Consulting · Paros, Greece</p>
        </div>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">Typography</h2>
          <div className="space-y-3">
            <h1 className="font-serif text-5xl font-light text-warm-900">Luxury Property in Paros</h1>
            <h2 className="font-serif text-3xl font-medium text-warm-800">Naoussa Seafront Villa</h2>
            <h3 className="font-serif text-xl text-warm-700">3 Bedrooms · 280 m² · Sea View</h3>
            <p className="text-warm-600 leading-relaxed max-w-xl">
              An exceptional property nestled on the hillside of Naoussa, offering panoramic views
              of the Aegean Sea. Designed with traditional Cycladic architecture and modern amenities.
            </p>
            <p className="text-sm text-warm-400">Supporting text · Labels · Captions</p>
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">Brand Colors</h2>
          <div className="flex gap-3 flex-wrap">
            {[
              { bg: "bg-gold-500",   label: "Gold 500",   hex: "#B8960C" },
              { bg: "bg-gold-400",   label: "Gold 400",   hex: "#E8C20A" },
              { bg: "bg-gold-200",   label: "Gold 200",   hex: "#F5E07A" },
              { bg: "bg-gold-50",    label: "Gold 50",    hex: "#FDF8E7" },
              { bg: "bg-bronze-500", label: "Bronze 500", hex: "#CD853F" },
              { bg: "bg-bronze-300", label: "Bronze 300", hex: "#EFB366" },
              { bg: "bg-warm-900",   label: "Warm 900",   hex: "#3D3832" },
              { bg: "bg-warm-200",   label: "Warm 200",   hex: "#EDE9E2" },
              { bg: "bg-warm-50",    label: "Warm 50",    hex: "#FAFAF8" },
            ].map(({ bg, label, hex }) => (
              <div key={hex} className="flex flex-col items-center gap-2">
                <div className={`h-12 w-12 rounded-lg shadow-card ${bg}`} />
                <div className="text-center">
                  <p className="text-xs font-medium text-warm-700">{label}</p>
                  <p className="text-[10px] text-warm-400 font-mono">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">Buttons</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Button>Add Client</Button>
            <Button variant="outline">View Details</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">Skip</Button>
            <Button variant="destructive">Delete</Button>
            <Button isLoading>Saving...</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Plus size={16} /></Button>
            <Button leftIcon={<Plus size={14} />}>New Property</Button>
            <Button variant="outline" leftIcon={<Mail size={14} />}>Send Email</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">Badges</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="gold">Gold</Badge>
            <Badge variant="bronze">Bronze</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="error">Overdue</Badge>
            <Badge variant="muted">Archived</Badge>
            <Badge size="sm">Small</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </section>

        {/* CRM Badges */}
        <section className="space-y-6">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">CRM Classifications</h2>

          <div className="space-y-3">
            <p className="text-xs text-warm-400 uppercase tracking-wider">Client Maturity</p>
            <div className="flex gap-3 items-center flex-wrap">
              <ClientClassBadge clientClass="A" />
              <ClientClassBadge clientClass="B" />
              <ClientClassBadge clientClass="C" />
              <ClientClassBadge clientClass="A" showLabel size="lg" />
              <ClientClassBadge clientClass="B" showLabel size="lg" />
              <ClientClassBadge clientClass="C" showLabel size="lg" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-warm-400 uppercase tracking-wider">Price Groups</p>
            <div className="flex gap-3 items-center flex-wrap">
              {(["entry","mid","premium","luxury","ultra"] as const).map(g => (
                <PriceGroupBadge key={g} group={g} showRange />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-warm-400 uppercase tracking-wider">Pipeline Stages</p>
            <div className="flex gap-2 items-center flex-wrap">
              {["new_inquiry","qualified","property_presentation","offer_submitted","negotiation","legal_process","signed_closed"].map(s => (
                <PipelineStageBadge key={s} stage={s} />
              ))}
            </div>
          </div>
        </section>

        {/* Avatars */}
        <section className="space-y-4">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">Avatars</h2>
          <div className="flex gap-4 items-center">
            <Avatar name="Dan Paul" size="xl" />
            <Avatar name="Anna Papadopoulos" size="lg" />
            <Avatar name="Klaus Weber" size="default" />
            <Avatar name="Marie Dubois" size="sm" />
            <Avatar name="John Smith" size="xs" />
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">Cards</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card with shadow</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-warm-600">Card content goes here.</p></CardContent>
              <CardFooter><Button size="sm" variant="outline">Action</Button></CardFooter>
            </Card>
            <Card variant="luxury">
              <CardHeader>
                <CardTitle>Luxury Card</CardTitle>
                <CardDescription>Gold left-border accent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-warm-600">Used for premium clients or featured listings.</p>
              </CardContent>
            </Card>
            <Card variant="hover">
              <CardHeader>
                <CardTitle>Hover Card</CardTitle>
                <CardDescription>Lifts on hover</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-warm-600">Used for property listings and client rows.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form */}
        <section className="space-y-4">
          <h2 className="text-xs tracking-[0.2em] uppercase text-warm-400 font-medium">Form Controls</h2>
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <Input label="Client Name" placeholder="Hans Müller" />
            <Input label="Email" placeholder="hans@example.com" type="email" leftIcon={<Mail size={14} />} />
            <Input label="With Error" placeholder="Search..." error="This field is required" />
            <Input label="With Hint" placeholder="Search..." hint="Start typing to search properties" leftIcon={<Search size={14} />} />
            <Select
              label="Maturity Class"
              placeholder="Select class..."
              options={[
                { value: "A", label: "A — Hot (0–3 months)" },
                { value: "B", label: "B — Warm (3–12 months)" },
                { value: "C", label: "C — Cold (12+ months)" },
              ]}
            />
            <Select
              label="Price Group"
              placeholder="Select group..."
              options={[
                { value: "entry",   label: "Entry — up to €300K" },
                { value: "mid",     label: "Mid — €300K–€700K" },
                { value: "premium", label: "Premium — €700K–€1.5M" },
                { value: "luxury",  label: "Luxury — €1.5M–€3M" },
                { value: "ultra",   label: "Ultra — €3M+" },
              ]}
            />
          </div>
        </section>

      </div>
    </main>
  )
}

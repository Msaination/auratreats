import type { Metadata } from "next";
import { BookingHeader } from "./booking-header";
import { BookingProgress } from "./progress";
import { ServiceSelector } from "./service-selector";
import { getPackageCatalog, getServiceCatalog } from "@/lib/latepoint";

export const metadata: Metadata = {
  title: "Choose a Treatment | Aura Spa",
  description: "Choose your Aura Spa treatment and begin your booking.",
};

export const dynamic = "force-dynamic";

type BookPageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const initialCategory = requestedCategory === "packages" ? "packages" : undefined;
  const [catalog, packageCatalog] = await Promise.all([
    getServiceCatalog().catch(() => null),
    getPackageCatalog().catch(() => null),
  ]);

  return (
    <main className="booking-flow min-h-screen bg-[#f3eee9] text-[#352d2a]">
      <BookingHeader />

      <BookingProgress
        steps={[
          { label: "Services", current: true },
          { label: "Agents" },
          { label: "Date & Time" },
          { label: "Your Details" },
          { label: "Review" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="booking-radius mb-8 overflow-hidden border border-[#d8c9c0] bg-[linear-gradient(135deg,#f9f4f1_0%,#f4e8e1_40%,#efe2db_100%)] px-5 py-7 shadow-[0_18px_40px_rgba(90,72,64,0.06)] sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a756c] sm:text-xs">
                Step one · Ritual booking
              </p>
              <h1 className="font-serif text-4xl leading-[0.94] text-[#2e2725] sm:text-5xl lg:text-6xl">
                Available Services
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#635955] sm:text-base">
                Curated therapies, calming rituals, and elevated beauty rituals designed to slow the rhythm of the day and restore your glow.
              </p>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#695a55] lg:text-right">
              Relax . Restore . Rejuvenate
            </div>
          </div>
        </div>

        {catalog ? (
          <ServiceSelector
            key={initialCategory ?? "default"}
            {...catalog}
            packages={packageCatalog?.packages ?? []}
            initialCategory={initialCategory}
          />
        ) : (
          <section className="booking-radius border border-[#d9c9bf] bg-[#faf6f3] py-16 text-center shadow-[0_18px_40px_rgba(90,72,64,0.04)]">
            <h2 className="font-serif text-3xl text-[#352d2a]">Treatments are unavailable</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
              We could not reach the booking service. Please refresh the page in a moment.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
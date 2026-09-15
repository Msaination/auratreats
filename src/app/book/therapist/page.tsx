import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingProgress } from "../progress";
import { TherapistSelector } from "./therapist-selector";
import { getTherapistCatalog } from "@/lib/latepoint";

export const metadata: Metadata = {
  title: "Choose a Therapist | Aura Spa",
  description: "Choose your preferred Aura Spa therapist.",
};

export const dynamic = "force-dynamic";

type TherapistPageProps = {
  searchParams: Promise<{
    serviceId?: string | string[];
  }>;
};

export default async function TherapistPage({
  searchParams,
}: TherapistPageProps) {
  const params = await searchParams;
  const serviceIdValue = Array.isArray(params.serviceId)
    ? params.serviceId[0]
    : params.serviceId;
  const serviceId = Number(serviceIdValue);

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    redirect("/book");
  }

  const catalog = await getTherapistCatalog(serviceId).catch(() => null);

  return (
    <main className="min-h-screen bg-[#f3eee9] text-[#352d2a]">
      <header className="border-b border-[#cbbdb6] bg-[#f8f4f1]">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link className="font-serif text-2xl" href="/">
            Aura Spa
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#806b62]">
            Book an appointment
          </span>
        </div>
      </header>

      <BookingProgress
        steps={[
          { label: "Services", href: "/book", complete: true },
          { label: "Agents", current: true },
          { label: "Date & Time" },
          { label: "Your Details" },
          { label: "Review" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a756c]">
            Step two
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Available Agents
          </h1>
          <p className="mt-4 text-base leading-7 text-[#746760]">
            Select the Aura specialist you&apos;d prefer for your treatment.
          </p>
        </div>

        {catalog ? (
          <TherapistSelector {...catalog} />
        ) : (
          <section className="border-y border-[#cbbdb6] py-16 text-center">
            <h2 className="font-serif text-3xl">Therapists are unavailable</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
              We could not load therapists for this treatment. Return to the
              treatment list and try again.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center border border-[#6f5047] px-5 text-sm font-semibold text-[#6f5047]"
              href="/book"
            >
              Back to treatments
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
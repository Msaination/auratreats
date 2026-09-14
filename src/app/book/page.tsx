import type { Metadata } from "next";
import Link from "next/link";
import { ServiceSelector } from "./service-selector";
import { getServiceCatalog } from "@/lib/latepoint";

export const metadata: Metadata = {
  title: "Choose a Treatment | Aura Spa",
  description: "Choose your Aura Spa treatment and begin your booking.",
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const catalog = await getServiceCatalog().catch(() => null);

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

      <nav aria-label="Booking progress" className="border-b border-[#d9cec8]">
        <ol className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] sm:px-8">
          <li className="shrink-0 text-[#5f4037]">01 Services</li>
          <li className="shrink-0 text-[#a79790]">02 Therapist</li>
          <li className="shrink-0 text-[#a79790]">03 Date &amp; time</li>
          <li className="shrink-0 text-[#a79790]">04 Details</li>
          <li className="shrink-0 text-[#a79790]">05 Review</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a756c]">
            Step one
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Choose your treatment
          </h1>
          <p className="mt-4 text-base leading-7 text-[#746760]">
            Explore Aura&apos;s treatment menu and select the experience that
            feels right for you.
          </p>
        </div>

        {catalog ? (
          <ServiceSelector {...catalog} />
        ) : (
          <section className="border-y border-[#cbbdb6] py-16 text-center">
            <h2 className="font-serif text-3xl">Treatments are unavailable</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
              We could not reach the booking service. Please refresh the page
              in a moment.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
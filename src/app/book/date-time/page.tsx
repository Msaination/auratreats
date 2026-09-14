import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DateTimeSelector } from "./date-time-selector";
import { getAvailability } from "@/lib/latepoint";

export const metadata: Metadata = {
  title: "Choose a Date & Time | Aura Spa",
  description: "Choose an available date and time for your Aura Spa treatment.",
};

export const dynamic = "force-dynamic";

type DateTimePageProps = {
  searchParams: Promise<{
    serviceId?: string | string[];
    therapistId?: string | string[];
    duration?: string | string[];
    startDate?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function todayInJohannesburg() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${value.year}-${value.month}-${value.day}`;
}

export default async function DateTimePage({ searchParams }: DateTimePageProps) {
  const params = await searchParams;
  const serviceId = Number(firstValue(params.serviceId));
  const duration = Number(firstValue(params.duration));
  const therapistValue = firstValue(params.therapistId);
  const therapistId = therapistValue === "any" ? "any" : Number(therapistValue);
  const today = todayInJohannesburg();
  const requestedStartDate = firstValue(params.startDate);
  const startDate =
    requestedStartDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedStartDate)
      ? requestedStartDate
      : today;

  if (
    !Number.isInteger(serviceId) ||
    serviceId <= 0 ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    (therapistId !== "any" &&
      (!Number.isInteger(therapistId) || therapistId <= 0))
  ) {
    redirect("/book");
  }

  const catalog = await getAvailability({
    serviceId,
    therapistId,
    duration,
    startDate,
  }).catch(() => null);

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
          <li className="shrink-0 text-[#806b62]">
            <Link href="/book">01 Services</Link>
          </li>
          <li className="shrink-0 text-[#806b62]">
            <Link href={`/book/therapist?serviceId=${serviceId}`}>
              02 Therapist
            </Link>
          </li>
          <li className="shrink-0 text-[#5f4037]">03 Date &amp; time</li>
          <li className="shrink-0 text-[#a79790]">04 Details</li>
          <li className="shrink-0 text-[#a79790]">05 Review</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a756c]">
            Step three
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Choose a date and time
          </h1>
          <p className="mt-4 text-base leading-7 text-[#746760]">
            Times shown are live from the Aura booking calendar.
          </p>
        </div>

        {catalog ? (
          <DateTimeSelector
            catalog={catalog}
            key={startDate}
            rangeStart={startDate}
            today={today}
          />
        ) : (
          <section className="border-y border-[#cbbdb6] py-16 text-center">
            <h2 className="font-serif text-3xl">Times are unavailable</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
              We could not load the live calendar. Return to your therapist
              selection and try again.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center border border-[#6f5047] px-5 text-sm font-semibold text-[#6f5047]"
              href={`/book/therapist?serviceId=${serviceId}`}
            >
              Back to therapists
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
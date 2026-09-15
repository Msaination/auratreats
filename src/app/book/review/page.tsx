import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewBooking } from "./review-booking";
import { getAvailability, getReview } from "@/lib/latepoint";

export const metadata: Metadata = {
  title: "Review Your Booking | Aura Spa",
  description: "Review your Aura Spa appointment and payment choice.",
};

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams: Promise<{
    serviceId?: string | string[];
    therapistId?: string | string[];
    duration?: string | string[];
    startDate?: string | string[];
    startMinutes?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const serviceId = Number(firstValue(params.serviceId));
  const therapistId = Number(firstValue(params.therapistId));
  const duration = Number(firstValue(params.duration));
  const startDate = firstValue(params.startDate) ?? "";
  const startMinutes = Number(firstValue(params.startMinutes));

  if (
    !Number.isInteger(serviceId) ||
    serviceId <= 0 ||
    !Number.isInteger(therapistId) ||
    therapistId <= 0 ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !Number.isInteger(startMinutes) ||
    startMinutes < 0 ||
    startMinutes >= 24 * 60
  ) {
    redirect("/book");
  }

  const [availability, review] = await Promise.all([
    getAvailability({
      serviceId,
      therapistId,
      duration,
      startDate,
      days: 1,
    }).catch(() => null),
    getReview(serviceId, duration).catch(() => null),
  ]);
  const selectedSlot = availability?.dates[0]?.slots.find(
    (slot) =>
      slot.startMinutes === startMinutes &&
      slot.therapistIds.includes(therapistId),
  );
  const dateTimeParams = new URLSearchParams({
    serviceId: String(serviceId),
    therapistId: String(therapistId),
    duration: String(duration),
    startDate,
  });

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
            <Link href="/book">01 Available Services</Link>
          </li>
          <li className="shrink-0 text-[#806b62]">
            <Link href={`/book/therapist?serviceId=${serviceId}`}>
              02 Available Agents
            </Link>
          </li>
          <li className="shrink-0 text-[#806b62]">
            <Link href={`/book/date-time?${dateTimeParams}`}>03 Date &amp; Time Selection</Link>
          </li>
          <li className="shrink-0 text-[#806b62]">04 Customer Information</li>
          <li className="shrink-0 text-[#5f4037]">05 Verify Order Details</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a756c]">
            Step five
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Verify Order Details
          </h1>
          <p className="mt-4 text-base leading-7 text-[#746760]">
            Check your appointment details before confirming your booking.
          </p>
        </div>

        {availability && review && selectedSlot ? (
          <ReviewBooking
            availability={availability}
            review={review}
            slot={selectedSlot}
          />
        ) : (
          <section className="border-y border-[#cbbdb6] py-16 text-center">
            <h2 className="font-serif text-3xl">This time is no longer available</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
              The live calendar changed while you were booking. Choose another
              appointment time to continue.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center border border-[#6f5047] px-5 text-sm font-semibold text-[#6f5047]"
              href={`/book/date-time?${dateTimeParams}`}
            >
              Choose another time
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
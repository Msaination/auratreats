"use client";

import {
  ArrowLeft,
  CalendarClock,
  Check,
  CreditCard,
  Landmark,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type {
  AvailabilityCatalog,
  AvailabilitySlot,
  ReviewCatalog,
} from "@/lib/latepoint";

type CustomerDetails = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

function parseDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(value));
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function readBookingDraft(): Record<string, unknown> {
  try {
    const draft = JSON.parse(
      sessionStorage.getItem("aura-booking-draft") ?? "{}",
    );

    return draft && typeof draft === "object" && !Array.isArray(draft)
      ? (draft as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function subscribeToBookingDraft() {
  return () => {};
}

function getBookingDraftSnapshot() {
  return sessionStorage.getItem("aura-booking-draft");
}

function getServerBookingDraftSnapshot() {
  return "";
}

export function ReviewBooking({
  availability,
  review,
  slot,
}: {
  availability: AvailabilityCatalog;
  review: ReviewCatalog;
  slot: AvailabilitySlot;
}) {
  const router = useRouter();
  const serializedDraft = useSyncExternalStore(
    subscribeToBookingDraft,
    getBookingDraftSnapshot,
    getServerBookingDraftSnapshot,
  );
  const storedDraft = serializedDraft ? readBookingDraft() : null;
  const savedCustomer = storedDraft?.customer;
  const customer =
    savedCustomer && typeof savedCustomer === "object" && !Array.isArray(savedCustomer)
      ? (savedCustomer as CustomerDetails)
      : null;
  const [paymentMethod, setPaymentMethod] = useState<string | null>(
    review.paymentMethods[0]?.id ?? null,
  );
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const appointmentDate = availability.dates[0].date;
  const detailsParams = new URLSearchParams({
    serviceId: String(review.service.id),
    therapistId: String(availability.therapist.id),
    duration: String(review.service.duration),
    startDate: appointmentDate,
    startMinutes: String(slot.startMinutes),
  });

  function choosePayment(methodId: string) {
    setPaymentMethod(methodId);
    setCheckoutError("");
  }

  function addMoreItems() {
    const draft = readBookingDraft();
    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        ...draft,
        customer: draft.customer,
      }),
    );
    router.push("/book");
  }

  async function startCheckout() {
    if (!paymentMethod) {
      return;
    }

    const draft = readBookingDraft();
    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({ ...draft, paymentMethod }),
    );
    setIsStartingCheckout(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: review.service.id,
          therapistId: availability.therapist.id,
          duration: review.service.duration,
          startDate: appointmentDate,
          startMinutes: slot.startMinutes,
          customer,
          paymentMethod,
          idempotencyKey: crypto.randomUUID(),
          returnUrl: location.href,
          company: "",
        }),
      });
      const result = (await response.json()) as {
        checkoutUrl?: string;
        confirmation?: Record<string, unknown>;
        message?: string;
      };

      if (!response.ok || (!result.checkoutUrl && !result.confirmation)) {
        throw new Error(result.message ?? "Checkout could not be started.");
      }

      if (result.confirmation) {
        sessionStorage.setItem(
          "aura-booking-confirmation",
          JSON.stringify(result.confirmation),
        );
        router.push("/book/confirmation");
        return;
      }

      location.assign(result.checkoutUrl!);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Secure checkout is temporarily unavailable.",
      );
      setIsStartingCheckout(false);
    }
  }

  if (serializedDraft === "") {
    return <p className="py-12 text-sm text-[#746760]">Loading your booking...</p>;
  }

  if (!customer?.email) {
    return (
      <section className="border-y border-[#cbbdb6] py-14 text-center">
        <UserRound aria-hidden="true" className="mx-auto size-7 text-[#8a756c]" />
        <h2 className="mt-4 font-serif text-3xl">Your details are needed</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
          Add your contact details before reviewing this appointment.
        </p>
        <Link
          className="mt-6 inline-flex h-11 items-center justify-center border border-[#6f5047] px-5 text-sm font-semibold text-[#6f5047]"
          href={`/book/details?${detailsParams}`}
        >
          Enter your details
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <div className="min-w-0 space-y-9">
        <section aria-labelledby="appointment-heading">
          <div className="flex items-center justify-between gap-4 border-b border-[#cbbdb6] pb-4">
            <h2 id="appointment-heading" className="font-serif text-2xl">
              Appointment
            </h2>
            <Link
              className="text-sm font-semibold text-[#6f5047]"
              href={`/book/date-time?serviceId=${review.service.id}&therapistId=${availability.therapist.id}&duration=${review.service.duration}&startDate=${appointmentDate}`}
            >
              Change
            </Link>
          </div>
          <dl className="grid gap-5 py-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Treatment</dt>
              <dd className="mt-1 font-semibold text-[#493d38]">{review.service.name}</dd>
              <dd className="mt-1 text-sm text-[#746760]">{review.service.duration} minutes</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Therapist</dt>
              <dd className="mt-1 font-semibold text-[#493d38]">{availability.therapist.name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Date &amp; time</dt>
              <dd className="mt-1 font-semibold text-[#493d38]">
                {formatDate(appointmentDate)}, {formatTime(slot.startMinutes)} - {formatTime(slot.endMinutes)}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="customer-heading">
          <div className="flex items-center justify-between gap-4 border-b border-[#cbbdb6] pb-4">
            <h2 id="customer-heading" className="font-serif text-2xl">Your details</h2>
            <Link className="text-sm font-semibold text-[#6f5047]" href={`/book/details?${detailsParams}`}>
              Edit
            </Link>
          </div>
          <div className="grid gap-5 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Name</p>
              <p className="mt-1 font-semibold text-[#493d38]">
                {[customer.first_name, customer.last_name].filter(Boolean).join(" ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Contact</p>
              <p className="mt-1 break-all font-semibold text-[#493d38]">{customer.email}</p>
              {customer.phone ? <p className="mt-1 text-sm text-[#746760]">{customer.phone}</p> : null}
            </div>
            {customer.notes ? (
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Comments</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#746760]">{customer.notes}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="payment-heading">
          <div className="border-b border-[#cbbdb6] pb-4">
            <h2 id="payment-heading" className="font-serif text-2xl">Payment method</h2>
            <p className="mt-2 text-sm text-[#746760]">Banking details will be sent via email.</p>
          </div>
          {review.paymentMethods.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {review.paymentMethods.map((method) => {
                const isBankTransfer = method.id === "bacs";
                const isPayLater = method.id === "local";
                const isPayViaEft = isPayLater || isBankTransfer;
                const isSelected = paymentMethod === method.id;
                const Icon = isPayLater
                  ? CalendarClock
                  : isBankTransfer
                    ? Landmark
                    : CreditCard;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`grid min-h-32 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-3 border p-4 text-left transition ${
                      isSelected
                        ? "border-[#6f5047] bg-[#eee2dc]"
                        : "border-[#cbbdb6] bg-white/55 hover:border-[#9a7d72]"
                    }`}
                    key={method.id}
                    onClick={() => choosePayment(method.id)}
                    type="button"
                  >
                    <span className="flex size-11 items-center justify-center bg-[#ded0c9] text-[#6f5047]">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-[#493d38]">
                        {isPayViaEft ? "Pay Via EFT" : method.name}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-[#746760]">
                        {isPayLater || isBankTransfer
                          ? "Booking will automatically be cancelled if payment is not reflected or processed in our system."
                          : "Pay securely online through WooCommerce checkout."}
                      </span>
                    </span>
                    {isSelected ? <Check aria-hidden="true" className="size-5 text-[#6f5047]" /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 border-y border-[#cbbdb6] py-8 text-sm text-[#746760]">
              No payment methods are currently enabled. Please contact Aura Spa.
            </p>
          )}
        </section>
      </div>

      <aside className="border border-[#cbbdb6] bg-[#f8f4f1] p-5 lg:sticky lg:top-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a756c]">Total</p>
        <div className="mt-5 flex items-end justify-between gap-4 border-b border-[#d9cec8] pb-5">
          <span className="text-sm text-[#746760]">Appointment total</span>
          <strong className="font-serif text-3xl font-normal text-[#352d2a]">{review.total.formatted}</strong>
        </div>
        <p aria-live="polite" className="mt-6 min-h-10 text-center text-xs leading-5 text-[#786b65]">
          {checkoutError ||
            "Your appointment is booked when you confirm below."}
        </p>
        <button
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 bg-[#352d2a] px-5 font-semibold text-white transition enabled:hover:bg-[#5f4037] disabled:cursor-not-allowed disabled:bg-[#a99c96]"
          disabled={!paymentMethod || isStartingCheckout}
          onClick={startCheckout}
          type="button"
        >
          {isStartingCheckout
            ? paymentMethod === "local"
              ? "Confirming booking..."
              : "Preparing checkout..."
            : paymentMethod === "local"
              ? "Confirm booking"
              : "Proceed to secure checkout"}
          <ShieldCheck aria-hidden="true" className="size-4" />
        </button>
        <Link
          className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#6f5047]"
          href={`/book/details?${detailsParams}`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to details
        </Link>
        <button
          className="mt-3 flex w-full items-center justify-center gap-2 border border-[#6f5047] px-4 py-3 text-sm font-semibold text-[#6f5047] transition opacity-50 cursor-not-allowed"
          disabled
          onClick={addMoreItems}
          type="button"
        >
          Add more items to this order
        </button>
      </aside>
    </div>
  );
}
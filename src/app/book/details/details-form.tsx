"use client";

import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useSyncExternalStore, useTransition } from "react";
import type {
  AvailabilityCatalog,
  AvailabilitySlot,
  CustomerField,
} from "@/lib/latepoint";

function parseDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
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

const autocompleteByField: Record<CustomerField["name"], string> = {
  first_name: "given-name",
  last_name: "family-name",
  email: "email",
  phone: "tel",
  notes: "off",
};

export function DetailsForm({
  catalog,
  fields,
  slot,
}: {
  catalog: AvailabilityCatalog;
  fields: CustomerField[];
  slot: AvailabilitySlot;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const serializedDraft = useSyncExternalStore(
    subscribeToBookingDraft,
    getBookingDraftSnapshot,
    getServerBookingDraftSnapshot,
  );
  const storedDraft = serializedDraft ? readBookingDraft() : null;
  const storedCustomer =
    storedDraft?.customer &&
    typeof storedDraft.customer === "object" &&
    !Array.isArray(storedDraft.customer)
      ? (storedDraft.customer as Record<string, unknown>)
      : {};
  const appointmentDate = catalog.dates[0].date;
  const dateTimeParams = new URLSearchParams({
    serviceId: String(catalog.service.id),
    therapistId: String(catalog.therapist.id),
    duration: String(catalog.duration),
    startDate: appointmentDate,
  });

  function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customer = Object.fromEntries(
      fields.map((field) => [field.name, String(formData.get(field.name) ?? "").trim()]),
    );
    const draft = readBookingDraft();

    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        ...draft,
        serviceId: catalog.service.id,
        serviceName: catalog.service.name,
        durationMinutes: catalog.duration,
        therapistId: catalog.therapist.id,
        therapistName: catalog.therapist.name,
        startDate: appointmentDate,
        startMinutes: slot.startMinutes,
        endMinutes: slot.endMinutes,
        slotTherapistId: slot.therapistIds[0],
        customer,
      }),
    );

    const reviewParams = new URLSearchParams({
      serviceId: String(catalog.service.id),
      therapistId: String(catalog.therapist.id),
      duration: String(catalog.duration),
      startDate: appointmentDate,
      startMinutes: String(slot.startMinutes),
    });
    startTransition(() => {
      router.push(`/book/review?${reviewParams}`);
    });
  }

  if (serializedDraft === "") {
    return <p className="py-12 text-sm text-[#746760]">Loading your details...</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <form className="min-w-0" onSubmit={saveDetails}>
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <label
              className={field.type === "textarea" ? "sm:col-span-2" : ""}
              key={field.name}
            >
              <span className="mb-2 block text-sm font-semibold text-[#493d38]">
                {field.label}
                {field.required ? (
                  <span aria-hidden="true" className="ml-1 text-[#8a5145]">
                    *
                  </span>
                ) : null}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  autoComplete={autocompleteByField[field.name]}
                  className="min-h-32 w-full resize-y border border-[#cbbdb6] bg-white/65 px-4 py-3 text-base outline-none transition placeholder:text-[#aa9c95] focus:border-[#6f5047] focus:ring-1 focus:ring-[#6f5047]"
                  defaultValue={
                    typeof storedCustomer[field.name] === "string"
                      ? (storedCustomer[field.name] as string)
                      : ""
                  }
                  maxLength={1000}
                  name={field.name}
                  required={field.required}
                />
              ) : (
                <input
                  autoComplete={autocompleteByField[field.name]}
                  className="h-12 w-full border border-[#cbbdb6] bg-white/65 px-4 text-base outline-none transition placeholder:text-[#aa9c95] focus:border-[#6f5047] focus:ring-1 focus:ring-[#6f5047]"
                  defaultValue={
                    typeof storedCustomer[field.name] === "string"
                      ? (storedCustomer[field.name] as string)
                      : ""
                  }
                  maxLength={field.type === "email" ? 254 : 100}
                  name={field.name}
                  required={field.required}
                  type={field.type}
                />
              )}
            </label>
          ))}
        </div>

        <div className="mt-7 flex items-start gap-3 border-t border-[#d9cec8] pt-5 text-sm leading-6 text-[#746760]">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#806b62]" />
          <p>Your details are used only to manage and confirm your appointment.</p>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="flex h-12 items-center justify-center gap-2 border border-[#6f5047] px-5 font-semibold text-[#6f5047]"
            href={`/book/date-time?${dateTimeParams}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Change time
          </Link>
          <button
            className="flex h-12 items-center justify-center gap-2 bg-[#352d2a] px-6 font-semibold text-white transition hover:bg-[#5f4037]"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Loading review..." : "Review booking"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </form>

      <aside className="border border-[#cbbdb6] bg-[#f8f4f1] p-5 lg:sticky lg:top-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a756c]">
          Your appointment
        </p>
        <dl className="mt-5 space-y-4">
          <div className="border-b border-[#d9cec8] pb-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
              Treatment
            </dt>
            <dd className="mt-1 font-serif text-2xl text-[#352d2a]">
              {catalog.service.name}
            </dd>
            <dd className="mt-1 text-sm text-[#746760]">
              {catalog.duration} minutes
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
              Therapist
            </dt>
            <dd className="mt-1 font-semibold text-[#493d38]">
              {catalog.therapist.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
              Date &amp; time
            </dt>
            <dd className="mt-1 font-semibold text-[#493d38]">
              {formatDate(appointmentDate)}, {formatTime(slot.startMinutes)}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
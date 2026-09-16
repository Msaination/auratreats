"use client";

import { ArrowLeft, ArrowRight, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
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

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function isValidCellPhone(value: string) {
  const normalized = normalizePhoneNumber(value);
  return /^0\d{9}$/.test(normalized);
}

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
  const [, setDraftVersion] = useState(0);
  const serializedDraft = useSyncExternalStore(
    subscribeToBookingDraft,
    getBookingDraftSnapshot,
    getServerBookingDraftSnapshot,
  );
  const storedDraft = serializedDraft ? readBookingDraft() : null;
  const addonServices = Array.isArray(storedDraft?.addonServices)
    ? (storedDraft.addonServices as Array<Record<string, unknown>>)
    : [];
  const primaryServiceId = Number(
    storedDraft?.primaryServiceId ?? storedDraft?.serviceId ?? catalog.service.id,
  );
  const primaryServiceName = String(
    storedDraft?.primaryServiceName ?? storedDraft?.serviceName ?? catalog.service.name,
  );
  const primaryDurationMinutes = Number(
    storedDraft?.primaryDurationMinutes ??
      storedDraft?.durationMinutes ??
      catalog.duration,
  );
  const totalDurationMinutes = Number(
    storedDraft?.totalDurationMinutes ?? primaryDurationMinutes,
  );
  const totalPrice = Number(
    storedDraft?.totalPrice ?? storedDraft?.price ?? 0,
  );
  const totalAttendees = Number(
    storedDraft?.totalAttendees ?? storedDraft?.selectedTotalAttendees ?? 1,
  );
  const storedCustomer =
    storedDraft?.customer &&
    typeof storedDraft.customer === "object" &&
    !Array.isArray(storedDraft.customer)
      ? (storedDraft.customer as Record<string, unknown>)
      : {};
  const appointmentDate = catalog.dates[0].date;
  const dateTimeParams = new URLSearchParams({
    serviceId: String(primaryServiceId),
    therapistId: String(catalog.therapist.id),
    duration: String(primaryDurationMinutes),
    startDate: appointmentDate,
  });

  function removeAddonService(serviceId: number) {
    const draft = readBookingDraft();
    const currentAddonServices = Array.isArray(draft.addonServices)
      ? (draft.addonServices as Array<Record<string, unknown>>)
      : [];
    const nextAddonServices = currentAddonServices.filter(
      (item) => Number(item.serviceId ?? item.id ?? 0) !== serviceId,
    );
    const primaryDurationMinutesFromDraft = Number(
      draft.primaryDurationMinutes ?? draft.durationMinutes ?? catalog.duration,
    );
    const primaryPriceFromDraft = Number(
      draft.primaryPrice ?? draft.price ?? 0,
    );
    const nextDurationMinutes =
      primaryDurationMinutesFromDraft +
      nextAddonServices.reduce(
        (sum, item) => sum + Number(item.durationMinutes ?? 0),
        0,
      );
    const nextPrice =
      primaryPriceFromDraft +
      nextAddonServices.reduce((sum, item) => sum + Number(item.price ?? item.amount ?? 0), 0);

    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        ...draft,
        addonServices: nextAddonServices,
        totalDurationMinutes: nextDurationMinutes,
        totalPrice: nextPrice,
        durationMinutes: nextDurationMinutes,
        price: nextPrice,
      }),
    );
    setDraftVersion((value) => value + 1);
  }

  function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customer = Object.fromEntries(
      fields.map((field) => [field.name, String(formData.get(field.name) ?? "").trim()]),
    );
    const phoneValue = normalizePhoneNumber(String(customer.phone ?? ""));

    if (!isValidCellPhone(phoneValue)) {
      const phoneField = event.currentTarget.querySelector<HTMLInputElement>('input[name="phone"]');
      if (phoneField) {
        phoneField.setCustomValidity("Cell number must be exactly 10 digits starting with 0.");
        phoneField.reportValidity();
        phoneField.setCustomValidity("");
      }
      return;
    }

    customer.phone = phoneValue;
    const draft = readBookingDraft();
    const storedAddonServices = Array.isArray(draft.addonServices)
      ? (draft.addonServices as Array<Record<string, unknown>>)
      : [];
    const primaryServiceIdFromDraft = Number(
      draft.primaryServiceId ?? draft.serviceId ?? catalog.service.id,
    );
    const primaryServiceNameFromDraft = String(
      draft.primaryServiceName ?? draft.serviceName ?? catalog.service.name,
    );
    const primaryDurationMinutesFromDraft = Number(
      draft.primaryDurationMinutes ?? draft.durationMinutes ?? catalog.duration,
    );
    const totalDurationMinutesFromDraft = Number(
      draft.totalDurationMinutes ?? primaryDurationMinutesFromDraft,
    );
    const totalPriceFromDraft = Number(
      draft.totalPrice ?? draft.price ?? 0,
    );

    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        ...draft,
        primaryServiceId: primaryServiceIdFromDraft,
        primaryServiceName: primaryServiceNameFromDraft,
        primaryDurationMinutes: primaryDurationMinutesFromDraft,
        addonServices: storedAddonServices,
        totalDurationMinutes: totalDurationMinutesFromDraft,
        totalPrice: totalPriceFromDraft,
        totalAttendees: Number(
          draft.totalAttendees ?? draft.selectedTotalAttendees ?? totalAttendees,
        ),
        selectedTotalAttendees: Number(
          draft.totalAttendees ?? draft.selectedTotalAttendees ?? totalAttendees,
        ),
        serviceId: primaryServiceIdFromDraft,
        serviceName: primaryServiceNameFromDraft,
        durationMinutes: primaryDurationMinutesFromDraft,
        price: totalPriceFromDraft,
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
      serviceId: String(primaryServiceIdFromDraft),
      therapistId: String(catalog.therapist.id),
      duration: String(primaryDurationMinutesFromDraft),
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
                  inputMode={field.name === "phone" ? "numeric" : undefined}
                  maxLength={field.type === "email" ? 254 : field.name === "phone" ? 10 : 100}
                  name={field.name}
                  onChange={(event) => {
                    if (field.name === "phone") {
                      event.target.value = normalizePhoneNumber(event.target.value);
                    }
                  }}
                  pattern={field.name === "phone" ? "0[0-9]{9}" : undefined}
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
              Primary treatment
            </dt>
            <dd className="mt-1 font-serif text-2xl text-[#352d2a]">
              {primaryServiceName}
            </dd>
            <dd className="mt-1 text-sm text-[#746760]">
              {primaryDurationMinutes} minutes
            </dd>
          </div>

          {addonServices.length ? (
            <div className="border-b border-[#d9cec8] pb-4">
              <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
                Optional add-ons
              </dt>
              <dd className="mt-2 space-y-2">
                {addonServices.map((item, index) => {
                  const serviceId = Number(item.serviceId ?? item.id ?? 0);
                  const serviceName = String(item.serviceName ?? item.name ?? "Add-on");
                  const durationMinutes = Number(item.durationMinutes ?? 0);
                  const price = Number(item.price ?? item.amount ?? 0);

                  return (
                    <div
                      className="flex items-center justify-between gap-3 rounded-full border border-[#d9cec8] bg-white/50 px-3 py-2 text-sm"
                      key={String(item.serviceId ?? item.id ?? item.name ?? `addon-${index}`)}
                    >
                      <div className="flex min-w-0 items-center gap-2 text-[#493d38]">
                        <span className="truncate font-medium">{serviceName}</span>
                        <span className="text-[#746760]">{durationMinutes} min</span>
                        <span className="font-semibold text-[#5f4037]">
                          {new Intl.NumberFormat("en-ZA", {
                            style: "currency",
                            currency: "ZAR",
                          }).format(price)}
                        </span>
                      </div>
                      <button
                        aria-label={`Remove ${serviceName}`}
                        className="inline-flex size-6 items-center justify-center rounded-full bg-[#5f4037] text-white transition hover:bg-[#43332f]"
                        onClick={() => removeAddonService(serviceId)}
                        type="button"
                      >
                        <X aria-hidden="true" className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </dd>
            </div>
          ) : null}

          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
              Therapist
            </dt>
            <dd className="mt-1 font-semibold text-[#493d38]">
              {catalog.therapist.name}
            </dd>
          </div>

          <div className="rounded-[1rem] border border-[#d9cec8] bg-white/60 p-3">
            <div className="flex items-center justify-between text-sm text-[#746760]">
              <span>Bundle total</span>
              <span>{totalDurationMinutes} min</span>
            </div>
            <div className="mt-2 flex items-center justify-between font-serif text-xl text-[#352d2a]">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                }).format(totalPrice)}
              </span>
            </div>
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
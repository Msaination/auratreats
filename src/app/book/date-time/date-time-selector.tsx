"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AvailabilityCatalog, AvailabilitySlot } from "@/lib/latepoint";

function parseDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function shiftDate(value: string, days: number) {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "UTC",
    ...options,
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

export function DateTimeSelector({
  catalog,
  rangeStart,
  today,
}: {
  catalog: AvailabilityCatalog;
  rangeStart: string;
  today: string;
}) {
  const router = useRouter();
  const firstAvailableDate =
    catalog.dates.find((day) => day.slots.length > 0)?.date ??
    catalog.dates[0]?.date ??
    rangeStart;
  const [selectedDate, setSelectedDate] = useState(firstAvailableDate);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedDay = catalog.dates.find((day) => day.date === selectedDate);
  const queryBase = new URLSearchParams({
    serviceId: String(catalog.service.id),
    therapistId: String(catalog.therapist.id),
    duration: String(catalog.duration),
  });
  const previousStart = shiftDate(rangeStart, -14);
  const nextStart = shiftDate(rangeStart, 14);

  function rangeHref(startDate: string) {
    const params = new URLSearchParams(queryBase);
    params.set("startDate", startDate);
    return `/book/date-time?${params}`;
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function chooseSlot(slot: AvailabilitySlot) {
    setSelectedSlot(slot);
  }

  function saveSelection() {
    if (!selectedSlot) {
      return;
    }

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
        startDate: selectedDate,
        startMinutes: selectedSlot.startMinutes,
        endMinutes: selectedSlot.endMinutes,
        slotTherapistId: selectedSlot.therapistIds[0],
      }),
    );

    const params = new URLSearchParams({
      serviceId: String(catalog.service.id),
      therapistId: String(selectedSlot.therapistIds[0]),
      duration: String(catalog.duration),
      startDate: selectedDate,
      startMinutes: String(selectedSlot.startMinutes),
    });

    startTransition(() => {
      router.push(`/book/details?${params}`);
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3 border-b border-[#cbbdb6] pb-4">
          <Link
            aria-disabled={previousStart < today}
            className={`flex h-10 items-center gap-2 px-3 text-sm font-semibold ${
              previousStart < today
                ? "pointer-events-none text-[#b8aaa3]"
                : "text-[#6f5047]"
            }`}
            href={rangeHref(previousStart)}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Earlier
          </Link>
          <p className="text-center text-sm text-[#746760]">
            {formatDate(rangeStart, { month: "short", day: "numeric" })} -{" "}
            {formatDate(shiftDate(rangeStart, 13), {
              month: "short",
              day: "numeric",
            })}
          </p>
          <Link
            className="flex h-10 items-center gap-2 px-3 text-sm font-semibold text-[#6f5047]"
            href={rangeHref(nextStart)}
          >
            Later
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {catalog.dates.map((day) => {
            const isSelected = selectedDate === day.date;
            const hasSlots = day.slots.length > 0;

            return (
              <button
                aria-label={`${formatDate(day.date, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}, ${hasSlots ? `${day.slots.length} times available` : "unavailable"}`}
                aria-pressed={isSelected}
                className={`min-h-20 border px-2 py-3 text-center transition ${
                  isSelected
                    ? "border-[#6f5047] bg-[#6f5047] text-white"
                    : hasSlots
                      ? "border-[#cbbdb6] bg-white/55 text-[#493d38] hover:border-[#9a7d72]"
                      : "border-[#ded5d0] text-[#aa9c95]"
                }`}
                key={day.date}
                onClick={() => chooseDate(day.date)}
                type="button"
              >
                <span className="block text-xs font-semibold uppercase">
                  {formatDate(day.date, { weekday: "short" })}
                </span>
                <span className="mt-1 block font-serif text-2xl">
                  {formatDate(day.date, { day: "numeric" })}
                </span>
                <span className="block text-[0.7rem]">
                  {formatDate(day.date, { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>

        <section className="mt-8" aria-labelledby="available-times-heading">
          <div className="flex items-center gap-3">
            <Clock3 aria-hidden="true" className="size-5 text-[#806b62]" />
            <h2 id="available-times-heading" className="font-serif text-2xl">
              {formatDate(selectedDate, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
          </div>

          {selectedDay?.slots.length ? (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {selectedDay.slots.map((slot) => {
                const isSelected =
                  selectedSlot?.startMinutes === slot.startMinutes &&
                  selectedSlot?.endMinutes === slot.endMinutes;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`h-12 border text-sm font-semibold transition ${
                      isSelected
                        ? "border-[#6f5047] bg-[#6f5047] text-white"
                        : "border-[#cbbdb6] bg-white/55 text-[#493d38] hover:border-[#9a7d72]"
                    }`}
                    key={`${slot.startMinutes}-${slot.endMinutes}`}
                    onClick={() => chooseSlot(slot)}
                    type="button"
                  >
                    {formatTime(slot.startMinutes)}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 border-y border-[#cbbdb6] py-12 text-center">
              <CalendarDays
                aria-hidden="true"
                className="mx-auto size-6 text-[#8a756c]"
              />
              <p className="mt-3 font-semibold text-[#493d38]">
                No times available on this date
              </p>
              <p className="mt-1 text-sm text-[#746760]">
                Choose another day or view the next two weeks.
              </p>
            </div>
          )}
        </section>
      </div>

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
          {selectedSlot ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
                Date &amp; time
              </dt>
              <dd className="mt-1 font-semibold text-[#493d38]">
                {formatDate(selectedDate, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                , {formatTime(selectedSlot.startMinutes)}
              </dd>
            </div>
          ) : null}
        </dl>

        {selectedSlot ? (
          <>
            <button
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-[#352d2a] px-5 font-semibold text-white transition hover:bg-[#5f4037]"
              disabled={isPending}
              onClick={saveSelection}
              type="button"
            >
              {isPending ? "Loading details..." : "Continue"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : (
          <p className="mt-5 text-sm leading-6 text-[#786b65]">
            Choose an available time to continue.
          </p>
        )}

        <p className="mt-4 text-xs leading-5 text-[#8a7c75]">
          Times shown in {catalog.timezone.replace("/", ", ")}.
        </p>
      </aside>
    </div>
  );
}
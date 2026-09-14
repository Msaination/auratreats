"use client";

import { ArrowLeft, ArrowRight, Check, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TherapistCatalog } from "@/lib/latepoint";

type TherapistChoice = number | "any";

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

export function TherapistSelector({
  allowAny,
  service,
  therapists,
}: TherapistCatalog) {
  const router = useRouter();
  const [selection, setSelection] = useState<TherapistChoice | null>(null);
  const [isPending, startTransition] = useTransition();

  function chooseTherapist(choice: TherapistChoice) {
    setSelection(choice);
  }

  function saveSelection() {
    if (selection === null) {
      return;
    }

    const draft = readBookingDraft();
    const therapist =
      selection === "any"
        ? null
        : therapists.find((candidate) => candidate.id === selection) ?? null;

    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        ...draft,
        serviceId: service.id,
        serviceName: service.name,
        therapistId: selection,
        therapistName: therapist?.name ?? "Any available therapist",
      }),
    );

    const duration =
      typeof draft.durationMinutes === "number"
        ? draft.durationMinutes
        : service.durationMinutes;
    const params = new URLSearchParams({
      serviceId: String(service.id),
      therapistId: String(selection),
      duration: String(duration),
    });

    startTransition(() => {
      router.push(`/book/date-time?${params}`);
    });
  }

  const selectedTherapist =
    typeof selection === "number"
      ? therapists.find((therapist) => therapist.id === selection) ?? null
      : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <div>
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#cbbdb6] pb-4">
          <p className="text-sm text-[#746760]">
            {therapists.length} available{" "}
            {therapists.length === 1 ? "therapist" : "therapists"}
          </p>
          <Link
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6f5047]"
            href="/book"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Change treatment
          </Link>
        </div>

        {allowAny ? (
          <button
            aria-pressed={selection === "any"}
            className={`mb-4 grid w-full grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 border p-4 text-left transition sm:p-5 ${
              selection === "any"
                ? "border-[#6f5047] bg-[#eee2dc]"
                : "border-[#cbbdb6] bg-white/55 hover:border-[#9a7d72]"
            }`}
            onClick={() => chooseTherapist("any")}
            type="button"
          >
            <span className="flex size-14 items-center justify-center bg-[#ded0c9] text-[#6f5047]">
              <Sparkles aria-hidden="true" className="size-6" />
            </span>
            <span>
              <span className="block text-base font-semibold text-[#352d2a] sm:text-lg">
                Any available therapist
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#746760]">
                We&apos;ll match you with the first available specialist.
              </span>
            </span>
            {selection === "any" ? (
              <Check aria-hidden="true" className="size-5 text-[#6f5047]" />
            ) : null}
          </button>
        ) : null}

        {therapists.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {therapists.map((therapist) => {
              const isSelected = selection === therapist.id;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`min-h-44 border p-5 text-left transition ${
                    isSelected
                      ? "border-[#6f5047] bg-[#eee2dc]"
                      : "border-[#cbbdb6] bg-white/55 hover:border-[#9a7d72]"
                  }`}
                  key={therapist.id}
                  onClick={() => chooseTherapist(therapist.id)}
                  type="button"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span
                      className="flex size-16 shrink-0 items-center justify-center bg-[#ded0c9] bg-cover bg-center font-serif text-xl text-[#654b43]"
                      style={
                        therapist.avatarUrl
                          ? { backgroundImage: `url(${therapist.avatarUrl})` }
                          : undefined
                      }
                    >
                      {!therapist.avatarUrl ? therapist.initials : null}
                    </span>
                    {isSelected ? (
                      <span className="flex size-8 items-center justify-center bg-[#6f5047] text-white">
                        <Check aria-hidden="true" className="size-4" />
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-5 block font-serif text-2xl text-[#352d2a]">
                    {therapist.name}
                  </span>
                  {therapist.title ? (
                    <span className="mt-1 block text-sm font-semibold text-[#7b635a]">
                      {therapist.title}
                    </span>
                  ) : null}
                  {therapist.bio ? (
                    <span className="mt-3 line-clamp-3 block text-sm leading-6 text-[#746760]">
                      {therapist.bio}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="border-y border-[#cbbdb6] py-16 text-center">
            <UserRound
              aria-hidden="true"
              className="mx-auto size-7 text-[#8a756c]"
            />
            <h2 className="mt-4 font-serif text-3xl">No therapists available</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
              No active therapists are connected to this treatment yet. Choose
              another treatment or update its LatePoint connections.
            </p>
          </div>
        )}
      </div>

      <aside className="border border-[#cbbdb6] bg-[#f8f4f1] p-5 lg:sticky lg:top-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a756c]">
          Your appointment
        </p>
        <div className="mt-5 border-b border-[#d9cec8] pb-4">
          <span className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
            Treatment
          </span>
          <h2 className="mt-1 font-serif text-2xl text-[#352d2a]">
            {service.name}
          </h2>
        </div>

        {selection !== null ? (
          <div className="mt-4">
            <span className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">
              Therapist
            </span>
            <p className="mt-1 font-semibold text-[#493d38]">
              {selection === "any"
                ? "Any available therapist"
                : selectedTherapist?.name}
            </p>
            <button
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-[#352d2a] px-5 font-semibold text-white transition hover:bg-[#5f4037]"
              onClick={saveSelection}
              disabled={isPending}
              type="button"
            >
              {isPending ? "Loading times..." : "Continue"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[#786b65]">
            Choose who you&apos;d like to see for this treatment.
          </p>
        )}
      </aside>
    </div>
  );
}
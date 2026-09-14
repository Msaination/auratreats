"use client";

import {
  CalendarDays,
  Check,
  Clock3,
  Download,
  ReceiptText,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

type Confirmation = {
  code: string;
  serviceName: string;
  therapistName: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  status: string;
  paymentMethod: string;
  total: string;
  calendarQr: string;
  calendarDataUri: string;
};

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return sessionStorage.getItem("aura-booking-confirmation");
}

function getServerSnapshot() {
  return "";
}

function parseConfirmation(value: string | null): Confirmation | null {
  if (!value) {
    return null;
  }

  try {
    const confirmation = JSON.parse(value) as Partial<Confirmation>;
    return confirmation.code &&
      confirmation.serviceName &&
      confirmation.therapistName &&
      confirmation.date &&
      Number.isInteger(confirmation.startMinutes) &&
      Number.isInteger(confirmation.endMinutes)
      ? (confirmation as Confirmation)
      : null;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function BookingConfirmation() {
  const router = useRouter();
  const serializedConfirmation = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const confirmation = parseConfirmation(serializedConfirmation);

  function closeConfirmation() {
    sessionStorage.removeItem("aura-booking-confirmation");
    sessionStorage.removeItem("aura-booking-draft");
    router.replace("/");
  }

  useEffect(() => {
    if (serializedConfirmation !== "" && !confirmation) {
      router.replace("/");
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        sessionStorage.removeItem("aura-booking-confirmation");
        sessionStorage.removeItem("aura-booking-draft");
        router.replace("/");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmation, router, serializedConfirmation]);

  if (!confirmation) {
    return <p className="relative text-sm text-white/75">Loading confirmation...</p>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-8 sm:items-center sm:px-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeConfirmation();
        }
      }}
    >
      <section
        aria-labelledby="confirmation-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-4xl border border-[#cbbdb6] bg-[#f8f4f1] shadow-2xl"
        role="dialog"
      >
        <button
          aria-label="Close confirmation and return home"
          className="absolute right-4 top-4 flex size-10 items-center justify-center border border-[#cbbdb6] bg-[#f8f4f1] text-[#5f4037] transition hover:bg-[#eee2dc]"
          onClick={closeConfirmation}
          title="Close"
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <div className="border-b border-[#d9cec8] px-6 py-8 pr-16 sm:px-10 sm:py-10 sm:pr-20">
          <div className="flex size-12 items-center justify-center bg-[#6f5047] text-white">
            <Check aria-hidden="true" className="size-6" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a756c]">
            Booking confirmed
          </p>
          <h1 id="confirmation-title" className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
            Your time is reserved
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#746760]">
            Confirmation code <strong className="text-[#493d38]">{confirmation.code}</strong>
          </p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="grid content-start gap-6 px-6 py-8 sm:grid-cols-2 sm:px-10 sm:py-10">
            <div className="flex gap-3">
              <ReceiptText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8a756c]" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Treatment</p>
                <p className="mt-1 font-semibold text-[#493d38]">{confirmation.serviceName}</p>
                <p className="mt-1 text-sm text-[#746760]">{confirmation.duration} minutes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <UserRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8a756c]" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Therapist</p>
                <p className="mt-1 font-semibold text-[#493d38]">{confirmation.therapistName}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8a756c]" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Date</p>
                <p className="mt-1 font-semibold text-[#493d38]">{formatDate(confirmation.date)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock3 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8a756c]" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Time</p>
                <p className="mt-1 font-semibold text-[#493d38]">
                  {formatTime(confirmation.startMinutes)} - {formatTime(confirmation.endMinutes)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <WalletCards aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8a756c]" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Payment</p>
                <p className="mt-1 font-semibold text-[#493d38]">
                  {confirmation.paymentMethod} · {confirmation.total}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#d9cec8] bg-[#eee2dc] p-6 text-center lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#806b62]">Calendar QR</p>
            {confirmation.calendarQr ? (
              <Image
                alt="Calendar event QR code"
                className="mx-auto mt-4 size-44 bg-white p-2"
                height={176}
                src={confirmation.calendarQr}
                unoptimized
                width={176}
              />
            ) : null}
            <a
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 border border-[#6f5047] px-4 text-sm font-semibold text-[#6f5047] transition hover:bg-[#f8f4f1]"
              download={`aura-spa-${confirmation.code}.ics`}
              href={confirmation.calendarDataUri}
            >
              <Download aria-hidden="true" className="size-4" />
              Add to calendar
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
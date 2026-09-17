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
  primaryServiceName?: string;
  therapistName: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  totalDurationMinutes?: number;
  status: string;
  paymentMethod: string;
  total: string;
  totalPrice?: number;
  addonServices?: Array<Record<string, unknown>>;
  calendarQr: string;
  calendarDataUri: string;
};

const celebrationSprinkles = [
  { left: "10%", top: "12%", x: -22, y: 86, delay: "0s", duration: "1.4s", color: "#e9c7a6" },
  { left: "18%", top: "16%", x: 42, y: 96, delay: "0.05s", duration: "1.55s", color: "#d7a78f" },
  { left: "24%", top: "10%", x: 72, y: 84, delay: "0.1s", duration: "1.5s", color: "#c6d9c6" },
  { left: "32%", top: "16%", x: -38, y: 96, delay: "0.15s", duration: "1.4s", color: "#f0d7ae" },
  { left: "42%", top: "8%", x: 30, y: 92, delay: "0.18s", duration: "1.55s", color: "#d9b8b4" },
  { left: "50%", top: "18%", x: 64, y: 90, delay: "0.22s", duration: "1.6s", color: "#c9d0bd" },
  { left: "58%", top: "10%", x: -46, y: 96, delay: "0.26s", duration: "1.45s", color: "#e8d3b7" },
  { left: "68%", top: "18%", x: 38, y: 96, delay: "0.3s", duration: "1.5s", color: "#d4b7d5" },
  { left: "76%", top: "12%", x: -28, y: 98, delay: "0.34s", duration: "1.6s", color: "#efc2a8" },
  { left: "84%", top: "18%", x: 40, y: 100, delay: "0.38s", duration: "1.55s", color: "#c6d5c2" },
  { left: "12%", top: "30%", x: 52, y: 112, delay: "0.04s", duration: "1.5s", color: "#d6c7aa" },
  { left: "22%", top: "34%", x: -56, y: 118, delay: "0.12s", duration: "1.6s", color: "#d0b497" },
  { left: "34%", top: "30%", x: 64, y: 110, delay: "0.18s", duration: "1.55s", color: "#c6d5ae" },
  { left: "46%", top: "36%", x: -40, y: 114, delay: "0.24s", duration: "1.5s", color: "#f1d8b8" },
  { left: "58%", top: "30%", x: 52, y: 110, delay: "0.3s", duration: "1.4s", color: "#d8b7ae" },
  { left: "72%", top: "34%", x: -48, y: 106, delay: "0.34s", duration: "1.55s", color: "#c7d7de" },
  { left: "82%", top: "30%", x: 42, y: 112, delay: "0.4s", duration: "1.6s", color: "#e8c7c1" },
  { left: "18%", top: "46%", x: 18, y: 118, delay: "0.12s", duration: "1.5s", color: "#d5c3b4" },
  { left: "64%", top: "46%", x: -34, y: 118, delay: "0.32s", duration: "1.6s", color: "#f2d9ab" },
  { left: "88%", top: "46%", x: 34, y: 120, delay: "0.46s", duration: "1.55s", color: "#c6d5c2" },
  { left: "30%", top: "52%", x: 26, y: 128, delay: "0.16s", duration: "1.55s", color: "#d8c0bd" },
  { left: "54%", top: "52%", x: -28, y: 126, delay: "0.28s", duration: "1.6s", color: "#d4b6a5" },
  { left: "74%", top: "52%", x: 30, y: 126, delay: "0.4s", duration: "1.55s", color: "#c2c9d9" },
];

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return sessionStorage.getItem("aura-booking-confirmation");
}

function getServerSnapshot() {
  return "";
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

function getDurationDisplayLabel(draft: Record<string, unknown>, fallbackMinutes: number, fallbackPrice: number) {
  const selectedPrimary = Array.isArray(draft.selectedServices)
    ? (draft.selectedServices as Array<Record<string, unknown>>)[0]
    : null;
  const durationLabel =
    typeof selectedPrimary?.durationLabel === "string"
      ? (selectedPrimary.durationLabel as string).trim()
      : "";
  const durationName =
    typeof selectedPrimary?.durationName === "string"
      ? (selectedPrimary.durationName as string).trim()
      : "";

  if (durationLabel) {
    return durationLabel;
  }

  const price = Number.isFinite(fallbackPrice) ? fallbackPrice : 0;
  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  });

  if (durationName) {
    return `${durationName} · ${formatter.format(price)}`;
  }

  return `${Number.isFinite(fallbackMinutes) ? fallbackMinutes : 0} min`;
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
  const draft = readBookingDraft();
  const primaryServiceName =
    confirmation?.primaryServiceName ?? confirmation?.serviceName ?? "Treatment";
  const addonServices = Array.isArray(confirmation?.addonServices)
    ? (confirmation.addonServices as Array<Record<string, unknown>>)
    : [];
  const totalDurationMinutes = Number(
    confirmation?.totalDurationMinutes ?? confirmation?.duration ?? 0,
  );
  const primaryDurationLabel = getDurationDisplayLabel(
    draft,
    totalDurationMinutes,
    Number(draft.primaryPrice ?? draft.totalPrice ?? 0),
  );
  const totalAmount =
    typeof confirmation?.total === "string" && confirmation.total.trim().length > 0
      ? confirmation.total
      : new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: "ZAR",
        }).format(Number(confirmation?.totalPrice ?? 0));

  async function clearBookingState() {
    sessionStorage.removeItem("aura-booking-confirmation");
    sessionStorage.removeItem("aura-booking-draft");

    if (typeof window !== "undefined" && "caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      } catch {
        // Ignore cache-clearing failures; booking data should still be cleared.
      }
    }
  }

  function closeConfirmation() {
    void clearBookingState();
    router.replace("/");
  }

  useEffect(() => {
    if (serializedConfirmation !== "" && !confirmation) {
      router.replace("/");
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        void clearBookingState();
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
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {celebrationSprinkles.map((sprinkle, index) => (
            <span
              key={`${sprinkle.left}-${sprinkle.top}-${index}`}
              className="sprinkle-piece"
              style={{
                left: sprinkle.left,
                top: sprinkle.top,
                background: sprinkle.color,
                animationDelay: sprinkle.delay,
                animationDuration: sprinkle.duration,
                ["--x" as string]: `${sprinkle.x}px`,
                ["--y" as string]: `${sprinkle.y}px`,
              }}
            />
          ))}
        </div>

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
            <div className="flex gap-3 sm:col-span-2">
              <ReceiptText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8a756c]" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Primary treatment</p>
                <p className="mt-1 font-semibold text-[#493d38]">{primaryServiceName}</p>
                <p className="mt-1 text-sm text-[#746760]">{primaryDurationLabel}</p>
              </div>
            </div>

            {addonServices.length ? (
              <div className="flex gap-3 sm:col-span-2">
                <ReceiptText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8a756c]" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8a756c]">Optional add-ons</p>
                  <div className="mt-2 space-y-2">
                    {addonServices.map((item, index) => {
                      const serviceName = String(item.serviceName ?? item.name ?? "Add-on");
                      const durationMinutes = Number(item.durationMinutes ?? 0);
                      const addonPrice = Number(item.price ?? item.amount ?? 0);

                      return (
                        <div
                          className="flex items-center justify-between gap-3 rounded-full border border-[#d9cec8] bg-white/60 px-3 py-2 text-sm"
                          key={String(item.serviceId ?? item.id ?? item.name ?? `addon-${index}`)}
                        >
                          <span className="font-medium text-[#493d38]">{serviceName}</span>
                          <div className="flex items-center gap-2 text-[#746760]">
                            <span>{durationMinutes} min</span>
                            <span className="font-semibold text-[#5f4037]">
                              {new Intl.NumberFormat("en-ZA", {
                                style: "currency",
                                currency: "ZAR",
                              }).format(addonPrice)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

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
                  {confirmation.paymentMethod} · {totalAmount}
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
            <div className="mt-4 rounded-[1rem] border border-[#d9cec8] bg-white/70 p-3 text-left">
              <div className="flex items-center justify-between text-sm text-[#746760]">
                <span>Bundle total</span>
                <span>{totalDurationMinutes} min</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-serif text-xl text-[#352d2a]">
                <span>Total</span>
                <span>{totalAmount}</span>
              </div>
            </div>
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

      <style jsx>{`
        .sprinkle-piece {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          opacity: 0;
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 204, 150, 0.8);
          animation: sprinkle-burst 1.5s ease-out forwards;
        }

        @keyframes sprinkle-burst {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.25) rotate(0deg);
          }
          20% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1.1) rotate(40deg);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--x), var(--y), 0) scale(1.35) rotate(220deg);
          }
        }
      `}</style>
    </div>
  );
}
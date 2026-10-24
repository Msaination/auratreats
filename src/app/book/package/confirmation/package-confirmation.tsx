"use client";

import { Check, Home, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type IncludedService = {
  id: number;
  name: string;
  quantity: number;
  durationMinutes: number;
};

type PurchasedPackage = {
  id: number;
  name: string;
  includedServices: IncludedService[];
  deposit: {
    amount: number;
    formatted: string;
  };
};

type PackageConfirmationData = {
  type: "package";
  code: string;
  packages: PurchasedPackage[];
  paymentMethod: string;
  total: string;
  totalPrice: number;
};

function isPackageConfirmation(value: unknown): value is PackageConfirmationData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const confirmation = value as Partial<PackageConfirmationData>;
  return confirmation.type === "package" &&
    typeof confirmation.code === "string" &&
    Array.isArray(confirmation.packages) &&
    confirmation.packages.length > 0 &&
    typeof confirmation.paymentMethod === "string" &&
    typeof confirmation.total === "string";
}

function clearSelectedPackageFromDraft() {
  let draft: unknown;

  try {
    draft = JSON.parse(sessionStorage.getItem("aura-booking-draft") ?? "{}");
  } catch {
    return;
  }

  if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
    return;
  }

  try {
    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        ...draft,
        selectedPackageId: null,
        selectedPackageName: "",
        packagePrice: 0,
      }),
    );
  } catch {
    // The purchase confirmation must remain visible if draft cleanup is unavailable.
  }
}

function scheduleServiceSession(serviceId: number) {
  const draft = {
    selectedServices: [{ serviceId, extras: [] }],
  };
  try {
    sessionStorage.setItem("aura-booking-draft", JSON.stringify(draft));
  } catch {
    // Fallback: proceed without draft preservation.
  }
  window.location.href = "/book";
}

export function PackageConfirmation({ checkoutToken }: { checkoutToken?: string }) {
  const [confirmation, setConfirmation] = useState<PackageConfirmationData | null>(null);
  const [errorMessage, setErrorMessage] = useState(
    checkoutToken ? "" : "The package confirmation link is missing its payment token.",
  );
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!checkoutToken) {
      return;
    }

    const token = checkoutToken;
    let isActive = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = Date.now() + 60_000;

    async function loadConfirmation() {
      attempts += 1;

      try {
        const response = await fetch(
          `/api/checkout-confirmation?token=${encodeURIComponent(token)}`,
          { cache: "no-store", signal: AbortSignal.timeout(5000) },
        );
        const result = (await response.json()) as {
          packageConfirmation?: unknown;
          message?: string;
        };

        if (response.ok && isPackageConfirmation(result.packageConfirmation)) {
          if (isActive) {
            clearSelectedPackageFromDraft();
            setConfirmation(result.packageConfirmation);
          }
          return;
        }

        if (response.status !== 202 && response.status < 500) {
          if (isActive) {
            setErrorMessage(result.message ?? "We could not verify this package purchase.");
          }
          return;
        }
      } catch {
        // Retry temporary network errors while the payment provider confirms the order.
      }

      if (!isActive) {
        return;
      }

      if (attempts >= 30 || Date.now() >= deadline) {
        setErrorMessage("We have not received payment confirmation yet. Do not pay again. Contact Aura Spa to verify the transaction.");
        return;
      }

      timer = setTimeout(() => void loadConfirmation(), 2000);
    }

    void loadConfirmation();
    return () => {
      isActive = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [checkoutToken, retryCount]);

  if (!confirmation) {
    return (
      <section className="flex w-full max-w-lg flex-col items-center border border-white/20 bg-[#f8f4f1] p-8 text-center shadow-2xl sm:p-10">
        <PackageCheck aria-hidden="true" className="size-9 text-[#6f5047]" />
        <h1 className="mt-5 font-serif text-3xl text-[#352d2a]">
          {errorMessage ? "Purchase confirmation needed" : "Confirming your purchase"}
        </h1>
        <p aria-live="polite" className="mt-3 text-sm leading-6 text-[#746760]">
          {errorMessage || "We are verifying your package payment."}
        </p>
        {errorMessage ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {checkoutToken ? (
              <button
                className="h-11 border border-[#6f5047] px-4 text-sm font-semibold text-[#6f5047]"
                onClick={() => {
                  setErrorMessage("");
                  setRetryCount((count) => count + 1);
                }}
                type="button"
              >
                Check payment again
              </button>
            ) : null}
            <Link className="inline-flex h-11 items-center gap-2 bg-[#352d2a] px-4 text-sm font-semibold text-white" href="/">
              <Home aria-hidden="true" className="size-4" />
              Aura home
            </Link>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="w-full max-w-2xl border border-[#cbbdb6] bg-[#f8f4f1] shadow-2xl">
      <div className="border-b border-[#d9cec8] px-6 py-8 sm:px-10 sm:py-10">
        <span className="flex size-12 items-center justify-center bg-[#6f5047] text-white">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a756c]">
          Package purchased
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-[#352d2a]">
          Your sessions are ready
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#746760]">
          Order code <strong className="text-[#493d38]">{confirmation.code}</strong>
        </p>
      </div>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-sm leading-6 text-[#746760]">
          Your package sessions are attached to your LatePoint order. Each session includes a date and time — select "Schedule" below to book your first appointment, or choose dates and agents on the booking page.
        </p>

        {confirmation.packages.map((pkgItem) => (
          <section className="border-y border-[#d9cec8] py-5" key={pkgItem.id}>
            <h2 className="font-serif text-2xl text-[#352d2a]">{pkgItem.name}</h2>
            <ul className="mt-4 space-y-3">
              {pkgItem.includedServices.map((service) => (
                <li className="flex items-start justify-between gap-4 text-sm" key={`${pkgItem.id}-${service.id}`}>
                  <span className="font-medium text-[#493d38]">{service.name}</span>
                  <span className="shrink-0 text-right text-[#746760]">
                    {service.quantity > 1 ? `${service.quantity} × ` : ""}
                    {service.durationMinutes} min
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-3">
              {pkgItem.includedServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => scheduleServiceSession(service.id)}
                  className="inline-flex h-10 items-center justify-center gap-1.5 bg-[#6f5047] px-4 text-sm font-semibold text-white transition hover:bg-[#5f4037]"
                >
                  Schedule {service.name}
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-[#746760]">{confirmation.paymentMethod}</span>
          <span className="font-serif text-2xl text-[#352d2a]">{confirmation.total}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 bg-[#352d2a] px-5 text-sm font-semibold text-white transition hover:bg-[#5f4037]"
            href="/book"
          >
            <Home aria-hidden="true" className="size-4" />
            Schedule sessions
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 border border-[#6f5047] px-5 text-sm font-semibold text-[#6f5047] transition hover:bg-[#f3eee9]"
            href="/"
          >
            <Home aria-hidden="true" className="size-4" />
            Return to Aura home
          </Link>
        </div>
      </div>
    </section>
  );
}

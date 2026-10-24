"use client";

import { ArrowLeft, ArrowRight, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import type { LatePointPackage, PaymentMethod } from "@/lib/latepoint";

type PackageCustomer = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
};

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function getSelectedPaymentMethod(
  methods: PaymentMethod[],
  requestedId: string,
): PaymentMethod | null {
  return methods.find((method) => method.id === requestedId) ?? methods[0] ?? null;
}

export function PackageCheckout({
  pkg,
  paymentMethods,
}: {
  pkg: LatePointPackage;
  paymentMethods: PaymentMethod[];
}) {
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const includedSessionCount = pkg.includedServices.reduce(
    (total, service) => total + service.quantity,
    0,
  );

  async function purchasePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customer: PackageCustomer = {
      first_name: String(formData.get("first_name") ?? "").trim(),
      last_name: String(formData.get("last_name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: normalizePhoneNumber(String(formData.get("phone") ?? "")),
      notes: String(formData.get("notes") ?? "").trim(),
    };

    if (!/^0\d{9}$/.test(customer.phone)) {
      const phoneInput = event.currentTarget.elements.namedItem("phone");
      if (phoneInput instanceof HTMLInputElement) {
        phoneInput.setCustomValidity("Cell number must be 10 digits and start with 0.");
        phoneInput.reportValidity();
        phoneInput.setCustomValidity("");
      }
      return;
    }

    const selectedPaymentMethod = getSelectedPaymentMethod(paymentMethods, paymentMethodId);
    if (!selectedPaymentMethod) {
      setErrorMessage("No online payment method is currently available.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundles: [{ packageId: pkg.id }],
          customer,
          paymentMethod: selectedPaymentMethod.id,
          idempotencyKey: crypto.randomUUID(),
          returnUrl: `${window.location.origin}/book/package/confirmation`,
          company: "",
        }),
      });
      const result = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
      };

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.message ?? "Package checkout could not be started.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Package checkout is temporarily unavailable.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <form className="min-w-0 space-y-8" onSubmit={purchasePackage}>
        <section aria-labelledby="package-customer-heading">
          <h2 id="package-customer-heading" className="mb-5 border-b border-[#cbbdb6] pb-3 font-serif text-2xl">
            Your details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#493d38]">First name</span>
              <input autoComplete="given-name" className="h-12 w-full border border-[#cbbdb6] bg-white/65 px-4 outline-none focus:border-[#6f5047]" maxLength={100} name="first_name" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#493d38]">Last name</span>
              <input autoComplete="family-name" className="h-12 w-full border border-[#cbbdb6] bg-white/65 px-4 outline-none focus:border-[#6f5047]" maxLength={100} name="last_name" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#493d38]">Email</span>
              <input autoComplete="email" className="h-12 w-full border border-[#cbbdb6] bg-white/65 px-4 outline-none focus:border-[#6f5047]" maxLength={254} name="email" required type="email" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#493d38]">Cell number</span>
              <input
                autoComplete="tel"
                className="h-12 w-full border border-[#cbbdb6] bg-white/65 px-4 outline-none focus:border-[#6f5047]"
                inputMode="numeric"
                maxLength={10}
                name="phone"
                onChange={(event) => {
                  event.target.value = normalizePhoneNumber(event.target.value);
                }}
                pattern="0[0-9]{9}"
                required
                type="tel"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#493d38]">Notes <span className="font-normal text-[#8a756c]">(optional)</span></span>
              <textarea className="min-h-28 w-full resize-y border border-[#cbbdb6] bg-white/65 px-4 py-3 outline-none focus:border-[#6f5047]" maxLength={1000} name="notes" />
            </label>
          </div>
        </section>

        <section aria-labelledby="package-payment-heading">
          <h2 id="package-payment-heading" className="mb-5 border-b border-[#cbbdb6] pb-3 font-serif text-2xl">
            Payment method
          </h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const isSelected = method.id === paymentMethodId;
              return (
                <label
                  className={`flex cursor-pointer items-start gap-3 border p-4 transition ${isSelected ? "border-[#6f5047] bg-[#eee2dc]" : "border-[#cbbdb6] bg-white/55 hover:border-[#9a7d72]"}`}
                  key={method.id}
                >
                  <input
                    checked={isSelected}
                    className="mt-1 accent-[#6f5047]"
                    name="paymentMethod"
                    onChange={() => setPaymentMethodId(method.id)}
                    type="radio"
                    value={method.id}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[#352d2a]">{method.name}</span>
                    {method.description ? (
                      <span className="mt-1 block text-sm leading-5 text-[#746760]">{method.description}</span>
                    ) : null}
                  </span>
                  <CreditCard aria-hidden="true" className="size-5 shrink-0 text-[#806b62]" />
                </label>
              );
            })}
          </div>
        </section>

        {errorMessage ? (
          <p aria-live="polite" className="border border-[#c27b63] bg-[#fff1eb] px-4 py-3 text-sm text-[#873d2e]">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-[#d9cec8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link className="flex h-12 items-center justify-center gap-2 border border-[#6f5047] px-5 font-semibold text-[#6f5047]" href="/book">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Change package
          </Link>
          <button className="flex h-12 items-center justify-center gap-2 bg-[#352d2a] px-6 font-semibold text-white transition hover:bg-[#5f4037] disabled:cursor-not-allowed disabled:opacity-50" disabled={isSubmitting || paymentMethods.length === 0} type="submit">
            {isSubmitting ? "Preparing secure checkout..." : "Pay for package"}
            {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
          </button>
        </div>
      </form>

      <aside className="border border-[#cbbdb6] bg-[#f8f4f1] p-5 lg:sticky lg:top-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a756c]">Package summary</p>
        <h2 className="mt-4 font-serif text-2xl text-[#352d2a]">{pkg.name}</h2>
        {pkg.shortDescription ? (
          <p className="booking-radius mt-3 border border-[#e2cfc6] bg-[#f8eee9] px-3 py-2.5 text-sm leading-6 text-[#746760]">
            {pkg.shortDescription}
          </p>
        ) : null}
        <div className="mt-5 space-y-3 border-y border-[#d9cec8] py-4">
          {pkg.includedServices.map((service) => (
            <div className="flex items-start justify-between gap-3 text-sm" key={service.id}>
              <span className="font-medium text-[#493d38]">{service.name}</span>
              <span className="shrink-0 text-right text-[#746760]">
                {service.quantity > 1 ? `${service.quantity} × ` : ""}
                {service.durationMinutes} min
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-[#746760]">
          <span>{includedSessionCount} included session{includedSessionCount === 1 ? "" : "s"}</span>
          <ShieldCheck aria-hidden="true" className="size-4 text-[#806b62]" />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-[#d9cec8] pt-4">
          <span className="text-sm font-semibold text-[#493d38]">Total</span>
          <span className="font-serif text-2xl text-[#352d2a]">{pkg.price.formatted}</span>
        </div>
      </aside>
    </div>
  );
}

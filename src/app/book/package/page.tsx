import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingHeader } from "../booking-header";
import { BookingProgress } from "../progress";
import { PackageCheckout } from "./package-checkout";
import { getPackageCatalog, getPaymentMethods } from "@/lib/latepoint";

export const metadata: Metadata = {
  title: "Purchase a Package | Aura Spa",
  description: "Choose an Aura Spa package and complete your secure purchase.",
};

export const dynamic = "force-dynamic";

type PackagePageProps = {
  searchParams: Promise<{ packageId?: string | string[] }>;
};

export default async function PackagePage({ searchParams }: PackagePageProps) {
  const params = await searchParams;
  const packageIdValue = Array.isArray(params.packageId)
    ? params.packageId[0]
    : params.packageId;
  const packageId = Number(packageIdValue);

  if (!Number.isInteger(packageId) || packageId <= 0) {
    redirect("/book");
  }

  const [packageCatalog, paymentMethods] = await Promise.all([
    getPackageCatalog().catch(() => null),
    getPaymentMethods("package").catch(() => []),
  ]);
  const pkg = packageCatalog?.packages.find((candidate) => candidate.id === packageId);

  if (!packageCatalog || !pkg) {
    notFound();
  }

  return (
    <main className="booking-flow min-h-screen bg-[#f3eee9] text-[#352d2a]">
      <BookingHeader />
      <BookingProgress
        steps={[
          { label: "Services", href: "/book", complete: true },
          { label: "Package", complete: true },
          { label: "Checkout", current: true },
          { label: "Confirmation", href: "/book/package/confirmation" },
        ]}
      />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a756c]">
            Aura Spa package
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Complete your purchase
          </h1>
          <p className="mt-4 text-base leading-7 text-[#746760]">
            Package sessions are added to your LatePoint order. Choose dates for included treatments separately after purchase.
          </p>
        </div>

        {paymentMethods.length ? (
          <PackageCheckout pkg={pkg} paymentMethods={paymentMethods} />
        ) : (
          <section className="border-y border-[#cbbdb6] py-14 text-center">
            <h2 className="font-serif text-3xl">Online payment is unavailable</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
              No online payment method is currently enabled for package purchases.
            </p>
            <Link
              className="booking-radius mt-6 inline-flex h-11 items-center justify-center border border-[#6f5047] px-5 text-sm font-semibold text-[#6f5047]"
              href="/book"
            >
              Return to treatments
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

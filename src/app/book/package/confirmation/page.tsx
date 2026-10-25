import type { Metadata } from "next";
export const runtime = "edge";
import { PackageConfirmation } from "./package-confirmation";

export const metadata: Metadata = {
  title: "Package Purchase | Aura Spa",
  description: "Your Aura Spa package purchase confirmation.",
};

export const dynamic = "force-dynamic";

type PackageConfirmationPageProps = {
  searchParams: Promise<{ checkoutToken?: string | string[] }>;
};

export default async function PackageConfirmationPage({
  searchParams,
}: PackageConfirmationPageProps) {
  const params = await searchParams;
  const checkoutToken = Array.isArray(params.checkoutToken)
    ? params.checkoutToken[0]
    : params.checkoutToken;

  return (
    <main className="booking-flow flex min-h-screen items-center justify-center bg-[#302925] px-4 py-8 text-[#352d2a] sm:px-8">
      <PackageConfirmation checkoutToken={checkoutToken} />
    </main>
  );
}

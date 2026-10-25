import type { Metadata } from "next";
export const runtime = "edge";
import { BookingConfirmation } from "./booking-confirmation";

export const metadata: Metadata = {
  title: "Booking Confirmed | Aura Spa",
  description: "Your Aura Spa appointment confirmation.",
};

type ConfirmationPageProps = {
  searchParams: Promise<{ checkoutToken?: string | string[] }>;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const checkoutToken = Array.isArray(params.checkoutToken)
    ? params.checkoutToken[0]
    : params.checkoutToken;

  return (
    <main className="booking-flow relative flex min-h-screen items-center justify-center overflow-hidden bg-[#302925] px-4 py-8 text-[#352d2a] sm:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(211,184,170,0.2),transparent_38%),linear-gradient(135deg,#302925_0%,#5d4840_100%)]"
      />
      <BookingConfirmation checkoutToken={checkoutToken} />
    </main>
  );
}
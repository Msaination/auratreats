export const runtime = "edge";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/latepoint";

const getCheckoutApiUrl = () => getApiBaseUrl().replace(/\/$/, "");

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (!/^[A-Za-z0-9]{48}$/.test(token)) {
    return NextResponse.json(
      { message: "The confirmation link is invalid." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${getCheckoutApiUrl()}/checkout-confirmation/${token}`,
      { cache: "no-store", headers: { Accept: "application/json" } },
    );
    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Payment confirmation is temporarily unavailable." },
      { status: 502 },
    );
  }
}
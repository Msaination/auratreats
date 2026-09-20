import { NextResponse } from "next/server";

const apiBaseUrl =
  process.env.AURA_API_URL ??
  "https://backend.monticarlo.co.za/wp-json/aura/v1";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "The checkout request is invalid." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/checkout-intents`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    const result = (await response.json()) as {
      checkoutUrl?: string;
      confirmation?: Record<string, unknown>;
      message?: string;
    };

    if (!response.ok || (!result.checkoutUrl && !result.confirmation)) {
      return NextResponse.json(
        { message: result.message ?? "Checkout could not be started." },
        { status: response.status || 502 },
      );
    }

    return NextResponse.json(
      result.confirmation
        ? { confirmation: result.confirmation }
        : { checkoutUrl: result.checkoutUrl },
    );
  } catch {
    return NextResponse.json(
      { message: "Secure checkout is temporarily unavailable." },
      { status: 502 },
    );
  }
}
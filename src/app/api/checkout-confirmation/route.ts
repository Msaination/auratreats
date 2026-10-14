import { NextResponse } from "next/server";

const apiBaseUrl =
  process.env.AURA_API_URL ??
  "http://localhost:8888/AuraDev/backend/wp-json/aura/v1";

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
      `${apiBaseUrl.replace(/\/$/, "")}/checkout-confirmation/${token}`,
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
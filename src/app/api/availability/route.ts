export const runtime = "edge";
import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/latepoint";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const serviceId = Number(params.get("serviceId"));
  const therapistId = Number(params.get("therapistId"));
  const duration = Number(params.get("duration"));
  const startDate = params.get("startDate") ?? "";

  if (
    !Number.isInteger(serviceId) ||
    serviceId <= 0 ||
    !Number.isInteger(therapistId) ||
    therapistId <= 0 ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
  ) {
    return NextResponse.json(
      { message: "The availability request is invalid." },
      { status: 400 },
    );
  }

  try {
    const availability = await getAvailability({
      serviceId,
      therapistId,
      duration,
      startDate,
      days: 1,
    });

    return NextResponse.json(availability);
  } catch {
    return NextResponse.json(
      { message: "Appointment availability is temporarily unavailable." },
      { status: 502 },
    );
  }
}

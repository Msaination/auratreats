const productionApiBaseUrl = "https://spa.auraretreat.co.za/wp-json/aura/v1";

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return productionApiBaseUrl;
  }

  return process.env.AURA_API_URL ?? productionApiBaseUrl;
}

async function fetchAura(path: string): Promise<Response> {
  const secureUrl = `${getApiBaseUrl().replace(/\/$/, "")}${path}`;
  const request = {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (compatible; AuraSpaBooking/1.0; +https://auratreats.pages.dev)",
      Origin: "https://auratreats.pages.dev",
      Referer: "https://auratreats.pages.dev/book",
    },
  } as const;
  return fetch(secureUrl, request);
}

export type ServiceDuration = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  formattedPrice: string;
};

export type ServiceExtra = {
  id: number;
  name: string;
  shortDescription: string;
  durationMinutes: number;
  price: {
    amount: number;
    formatted: string;
  };
};

export type LatePointService = {
  id: number;
  categoryId: number;
  name: string;
  shortDescription: string;
  imageUrl: string | null;
  durationMinutes: number;
  capacityMin: number;
  capacityMax: number;
  price: {
    amount: number;
    formatted: string;
    min: number;
    max: number;
    isVariable: boolean;
  };
  durations: ServiceDuration[];
  extras?: ServiceExtra[];
};

export type ServiceCategory = {
  id: number;
  parentId: number | null;
  name: string;
  shortDescription: string;
  imageUrl: string | null;
  services: LatePointService[];
};

export type ServiceCatalog = {
  categories: ServiceCategory[];
  total: number;
};

export type LatePointPackage = {
  id: number;
  name: string;
  shortDescription: string;
  price: {
    amount: number;
    formatted: string;
  };
  deposit: {
    amount: number;
    formatted: string;
  };
  includedServices: Array<{
    id: number;
    name: string;
    quantity: number;
    durationMinutes: number;
  }>;
};

export type PackageCatalog = {
  packages: LatePointPackage[];
  total: number;
};

export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
};

export type Therapist = {
  id: number;
  name: string;
  title: string;
  bio: string;
  initials: string;
  avatarUrl: string | null;
  bioImageUrl: string | null;
  features: Array<{
    label: string;
    value: string;
  }>;
};

export type TherapistCatalog = {
  service: {
    id: number;
    name: string;
    durationMinutes: number;
  };
  allowAny: boolean;
  therapists: Therapist[];
  total: number;
};

export type AvailabilitySlot = {
  startMinutes: number;
  endMinutes: number;
  therapistIds: number[];
};

export type AvailabilityDay = {
  date: string;
  slots: AvailabilitySlot[];
};

export type AvailabilityCatalog = {
  service: {
    id: number;
    name: string;
  };
  therapist: {
    id: number | "any";
    name: string;
  };
  duration: number;
  timezone: string;
  dates: AvailabilityDay[];
};

export type CustomerField = {
  name: "first_name" | "last_name" | "email" | "phone" | "notes";
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  required: boolean;
};

export type CustomerFieldCatalog = {
  fields: CustomerField[];
};

export type ReviewCatalog = {
  service: {
    id: number;
    name: string;
    duration: number;
  };
  total: {
    amount: number;
    formatted: string;
  };
  deposit: {
    amount: number;
    formatted: string;
  };
  paymentMethods: PaymentMethod[];
};

export async function getPackageCatalog(): Promise<PackageCatalog> {
  const response = await fetchAura("/packages");

  if (!response.ok) {
    throw new Error(`Aura packages request failed: ${response.status}`);
  }

  const catalog = (await response.json()) as Partial<PackageCatalog>;

  if (!Array.isArray(catalog.packages) || typeof catalog.total !== "number") {
    throw new Error("Aura packages returned an invalid response.");
  }

  return catalog as PackageCatalog;
}

export async function getPaymentMethods(
  type: "appointment" | "package" = "appointment",
): Promise<PaymentMethod[]> {
  const params = new URLSearchParams({ type });
  const response = await fetchAura(`/payment-methods?${params}`);

  if (!response.ok) {
    throw new Error(`Aura payment methods request failed: ${response.status}`);
  }

  const result = (await response.json()) as { paymentMethods?: PaymentMethod[] };

  if (!Array.isArray(result.paymentMethods)) {
    throw new Error("Aura payment methods returned an invalid response.");
  }

  return result.paymentMethods;
}

export async function getServiceCatalog(): Promise<ServiceCatalog> {
  const response = await fetchAura("/services");

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    const responseDetails = responseText
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 600);
    throw new Error(
      `Aura services request failed: ${response.status}${responseDetails ? ` — ${responseDetails}` : ""}`,
    );
  }

  const catalog = (await response.json()) as Partial<ServiceCatalog>;

  if (!Array.isArray(catalog.categories) || typeof catalog.total !== "number") {
    throw new Error("Aura services returned an invalid response.");
  }

  return catalog as ServiceCatalog;
}

export async function getTherapistCatalog(
  serviceId: number,
): Promise<TherapistCatalog> {
  const response = await fetchAura(`/services/${serviceId}/therapists`);

  if (!response.ok) {
    throw new Error(`Aura therapists request failed: ${response.status}`);
  }

  const catalog = (await response.json()) as Partial<TherapistCatalog>;

  if (
    !catalog.service ||
    !Array.isArray(catalog.therapists) ||
    typeof catalog.allowAny !== "boolean" ||
    typeof catalog.total !== "number"
  ) {
    throw new Error("Aura therapists returned an invalid response.");
  }

  return catalog as TherapistCatalog;
}

export async function getAvailability({
  serviceId,
  therapistId,
  duration,
  startDate,
  days = 14,
}: {
  serviceId: number;
  therapistId: number | "any";
  duration: number;
  startDate: string;
  days?: number;
}): Promise<AvailabilityCatalog> {
  const params = new URLSearchParams({
    serviceId: String(serviceId),
    therapistId: String(therapistId),
    duration: String(duration),
    startDate,
    days: String(days),
  });
  const response = await fetchAura(`/availability?${params}`);

  if (!response.ok) {
    throw new Error(`Aura availability request failed: ${response.status}`);
  }

  const catalog = (await response.json()) as Partial<AvailabilityCatalog>;

  if (
    !catalog.service ||
    !catalog.therapist ||
    !Array.isArray(catalog.dates) ||
    typeof catalog.duration !== "number" ||
    typeof catalog.timezone !== "string"
  ) {
    throw new Error("Aura availability returned an invalid response.");
  }

  return catalog as AvailabilityCatalog;
}

export async function getCustomerFields(): Promise<CustomerFieldCatalog> {
  const response = await fetchAura("/customer-fields");

  if (!response.ok) {
    throw new Error(`Aura customer fields request failed: ${response.status}`);
  }

  const catalog = (await response.json()) as Partial<CustomerFieldCatalog>;

  if (!Array.isArray(catalog.fields)) {
    throw new Error("Aura customer fields returned an invalid response.");
  }

  return catalog as CustomerFieldCatalog;
}

export async function getReview(
  serviceId: number,
  duration: number,
): Promise<ReviewCatalog> {
  const params = new URLSearchParams({
    serviceId: String(serviceId),
    duration: String(duration),
  });
  const response = await fetchAura(`/review?${params}`);

  if (!response.ok) {
    throw new Error(`Aura review request failed: ${response.status}`);
  }

  const catalog = (await response.json()) as Partial<ReviewCatalog>;

  if (
    !catalog.service ||
    !catalog.total ||
    !Array.isArray(catalog.paymentMethods)
  ) {
    throw new Error("Aura review returned an invalid response.");
  }

  return catalog as ReviewCatalog;
}

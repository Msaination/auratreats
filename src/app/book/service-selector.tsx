"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Footprints,
  Gem,
  Hand,
  HeartPulse,
  Leaf,
  ScanFace,
  Scissors,
  Search,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type {
  LatePointService,
  ServiceCatalog,
  ServiceDuration,
} from "@/lib/latepoint";

type Selection = {
  service: LatePointService;
  duration: ServiceDuration;
};

function readBookingDraft(): Record<string, unknown> {
  try {
    const draft = JSON.parse(
      sessionStorage.getItem("aura-booking-draft") ?? "{}",
    );

    return draft && typeof draft === "object" && !Array.isArray(draft)
      ? (draft as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function subscribeToBookingDraft() {
  return () => {};
}

function getBookingDraftSnapshot() {
  return sessionStorage.getItem("aura-booking-draft");
}

function getServerBookingDraftSnapshot() {
  return "";
}

function clampAttendees(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getPriceLabel(service: LatePointService) {
  if (service.price.amount <= 0) {
    return "Price varies";
  }

  return `${service.price.isVariable ? "From " : ""}${service.price.formatted}`;
}

function getDurationLabel(duration: Pick<ServiceDuration, "name" | "durationMinutes">) {
  const customName = (duration.name ?? "").trim();
  return customName || `${duration.durationMinutes} min`;
}

function getDurationSectionLabel(
  service: Pick<LatePointService, "durations">,
  isSelected: boolean,
) {
  const hasCustomNames = service.durations.some(
    (duration) => (duration.name ?? "").trim().length > 0,
  );

  if (hasCustomNames) {
    return isSelected ? "Choose option" : "Available options";
  }

  return isSelected ? "Choose duration" : "Available durations";
}

function restoreSelectedServices(
  draft: Record<string, unknown>,
  categories: ServiceCatalog["categories"],
): Selection[] {
  const draftSelections = Array.isArray(draft.selectedServices)
    ? (draft.selectedServices as Array<Record<string, unknown>>)
    : [];
  const services = categories.flatMap((category) => category.services);

  return draftSelections
    .map((entry) => {
      const service = services.find(
        (candidate) => candidate.id === Number(entry.serviceId),
      );

      if (!service) {
        return null;
      }

      const duration =
        service.durations.find(
          (candidate) => candidate.id === String(entry.durationId),
        ) ??
        service.durations[0] ?? {
          id: "default",
          name: "",
          durationMinutes: service.durationMinutes,
          price: service.price.amount,
          formattedPrice: service.price.formatted,
        };

      return { service, duration } satisfies Selection;
    })
    .filter((entry): entry is Selection => entry !== null);
}

function getCapacityBounds(service: LatePointService | null) {
  const minimum = Math.max(
    1,
    Number.isFinite(service?.capacityMin)
      ? Number(service?.capacityMin ?? 1)
      : 1,
  );
  const maximum = Math.max(
    1,
    Number.isFinite(service?.capacityMax)
      ? Number(service?.capacityMax ?? 1)
      : 1,
  );

  return { minimum, maximum };
}

export function ServiceSelector({ categories }: ServiceCatalog) {
  const serializedDraft = useSyncExternalStore(
    subscribeToBookingDraft,
    getBookingDraftSnapshot,
    getServerBookingDraftSnapshot,
  );
  const storedDraft = serializedDraft ? readBookingDraft() : {};
  const cartBookings = Array.isArray(storedDraft.cartBookings)
    ? (storedDraft.cartBookings as Array<Record<string, unknown>>)
    : [];
  const nestedCategoryConfigs = [
    {
      name: "Waxing",
      normalizedName: "waxing",
      childNames: ["body waxing", "intimate waxing", "face waxing"],
    },
    {
      name: "Body Treatments",
      normalizedName: "body treatments",
      childNames: ["body scrubs", "mud body wraps", "mud & body wraps"],
    },
    {
      name: "Aura Kids",
      normalizedName: "aura kids",
      childNames: ["kid's massage", "kid's nails"],
    },
  ];
  const nestedCategoryGroups = nestedCategoryConfigs.flatMap((config) => {
    const parentCategory = categories.find(
      (category) =>
        category.parentId === null &&
        category.name.trim().toLowerCase() === config.normalizedName,
    );
    const parentId =
      parentCategory?.id ??
      categories.find(
        (category) =>
          category.parentId !== null &&
          config.childNames.includes(category.name.trim().toLowerCase()),
      )?.parentId ??
      null;

    if (parentId === null) {
      return [];
    }

    const subcategories = categories.filter(
      (category) => category.parentId === parentId && category.services.length > 0,
    );

    if (!subcategories.length) {
      return [];
    }

    return [
      {
        parentId,
        subcategories,
        section: {
          id: parentId,
          parentId: null,
          name: config.name,
          shortDescription: "",
          imageUrl: null,
          services: subcategories.flatMap((subcategory) => subcategory.services),
        },
      },
    ];
  });
  const nestedParentIds = new Set(nestedCategoryGroups.map((group) => group.parentId));
  const nestedSubcategoryIds = new Set(
    nestedCategoryGroups.flatMap((group) => group.subcategories.map((subcategory) => subcategory.id)),
  );
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<number, boolean>>(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.id, false]),
      ) as Record<number, boolean>,
  );
  const [query, setQuery] = useState("");
  const restoredSelectedServices = restoreSelectedServices(storedDraft, categories);
  const draftAddonServices = Array.isArray(storedDraft.addonServices)
    ? (storedDraft.addonServices as Array<Record<string, unknown>>)
    : [];
  const restoredSelectedExtraIds = draftAddonServices
    .map((entry) => Number(entry.serviceId ?? entry.id))
    .filter((value) => Number.isFinite(value) && value > 0);
  const storedAttendeeCount = Number(
    storedDraft.totalAttendees ?? storedDraft.selectedTotalAttendees ?? 1,
  );
  const restoredTotalAttendees =
    Number.isFinite(storedAttendeeCount) && storedAttendeeCount > 0
      ? storedAttendeeCount
      : 1;
  const [selectedServicesOverride, setSelectedServicesOverride] = useState<
    Selection[] | null
  >(null);
  const selectedServices = selectedServicesOverride ?? restoredSelectedServices;
  const [selectedExtraIdsOverride, setSelectedExtraIdsOverride] = useState<
    number[] | null
  >(null);
  const selectedExtraIds =
    selectedExtraIdsOverride ?? restoredSelectedExtraIds;
  const [totalAttendeesOverride, setTotalAttendeesOverride] = useState<
    number | null
  >(null);
  const totalAttendees = totalAttendeesOverride ?? restoredTotalAttendees;
  const [activeNestedSubcategoryIds, setActiveNestedSubcategoryIds] = useState<
    Record<number, number | null>
  >({});
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const router = useRouter();
  const selectedPrimary = selectedServices[0] ?? null;
  const selectedPrimaryExtras = selectedPrimary?.service.extras ?? [];
  const { minimum: minCapacity, maximum: maxCapacity } = getCapacityBounds(
    selectedPrimary?.service ?? null,
  );

  const effectiveTotalAttendees = clampAttendees(totalAttendees, minCapacity, maxCapacity);
  const selectedExtraDurationMinutes = selectedPrimaryExtras
    .filter((extra) => selectedExtraIds.includes(extra.id))
    .reduce((sum, extra) => sum + extra.durationMinutes, 0);
  const selectedExtraPrice = selectedPrimaryExtras
    .filter((extra) => selectedExtraIds.includes(extra.id))
    .reduce((sum, extra) => sum + Number(extra.price.amount ?? 0), 0);

  const selectedServicePrice = selectedServices.reduce(
    (sum, entry) => sum + Number(entry.duration.price ?? entry.service.price.amount ?? 0),
    0,
  );
  const primaryServiceTotal = selectedServicePrice * effectiveTotalAttendees;
  const bundleDurationMinutes =
    selectedServices.reduce((sum, entry) => sum + entry.duration.durationMinutes, 0) +
    selectedExtraDurationMinutes;
  const bundlePrice = primaryServiceTotal + selectedExtraPrice;

  const displayCategories = nestedCategoryGroups.length
    ? [
        ...nestedCategoryGroups.map((group) => group.section),
        ...categories.filter(
          (category) =>
            !nestedParentIds.has(category.id) &&
            !nestedSubcategoryIds.has(category.id),
        ),
      ]
    : categories;

  const categoryTabs = displayCategories;

  const visibleCategories = displayCategories
    .filter((category) => activeCategoryId === "all" || category.id === activeCategoryId)
    .map((category) => ({
      ...category,
      services: category.services.filter((service) => {
        if (!deferredQuery) {
          return true;
        }

        return `${service.name} ${service.shortDescription}`
          .toLocaleLowerCase()
          .includes(deferredQuery);
      }),
    }))
    .filter((category) => category.services.length > 0);

  function toggleCategory(categoryId: number) {
    const isNestedSection = nestedCategoryGroups.some((group) => group.parentId === categoryId);

    if (isNestedSection) {
      setActiveCategoryId(categoryId);
      setExpandedCategoryIds((current) => ({
        ...Object.fromEntries(
          Object.keys(current).map((key) => [Number(key), false]),
        ),
        [categoryId]: !current[categoryId],
      }));
      return;
    }

    setExpandedCategoryIds((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  function selectCategory(categoryId: number | "all") {
    setActiveCategoryId(categoryId);

    if (categoryId === "all") {
      setExpandedCategoryIds((current) =>
        Object.fromEntries(
          Object.keys(current).map((key) => [Number(key), false]),
        ),
      );
      return;
    }

    setExpandedCategoryIds((current) => ({
      ...Object.fromEntries(
        Object.keys(current).map((key) => [Number(key), false]),
      ),
      [categoryId]: true,
    }));
  }

  const visibleTotal = visibleCategories.reduce((count, category) => {
    const nestedGroup = nestedCategoryGroups.find((group) => group.parentId === category.id);

    if (nestedGroup) {
      const selectedSubcategory = nestedGroup.subcategories.find(
        (subcategory) => subcategory.id === activeNestedSubcategoryIds[nestedGroup.parentId],
      );

      return count + (selectedSubcategory?.services.length ?? 0);
    }

    return count + category.services.length;
  }, 0);

  function selectService(service: LatePointService) {
    const duration = service.durations[0] ?? {
      id: "default",
      name: "",
      durationMinutes: service.durationMinutes,
      price: service.price.amount,
      formattedPrice: service.price.formatted,
    };

    const isAlreadySelected = selectedServices.some(
      (candidate) => candidate.service.id === service.id,
    );

    if (isAlreadySelected) {
      setSelectedServicesOverride(
        selectedServices.filter((candidate) => candidate.service.id !== service.id),
      );
      setSelectedExtraIdsOverride([]);
      return;
    }

    if (selectedServices.length > 0) {
      return;
    }

    setSelectedServicesOverride([{ service, duration }]);
    setSelectedExtraIdsOverride([]);
  }

  function chooseServiceDuration(service: LatePointService, duration: ServiceDuration) {
    const isAlreadySelected = selectedServices.some(
      (candidate) => candidate.service.id === service.id,
    );

    if (isAlreadySelected) {
      setSelectedServicesOverride(
        selectedServices.map((candidate) =>
          candidate.service.id === service.id ? { ...candidate, duration } : candidate,
        ),
      );
      setSelectedExtraIdsOverride([]);
      return;
    }

    if (selectedServices.length > 0) {
      return;
    }

    setSelectedServicesOverride([{ service, duration }]);
    setSelectedExtraIdsOverride([]);
  }

  function toggleExtra(extra: NonNullable<LatePointService["extras"]>[number]) {
    if (!selectedPrimary) {
      return;
    }

    setSelectedExtraIdsOverride(
      selectedExtraIds.includes(extra.id)
        ? selectedExtraIds.filter((id) => id !== extra.id)
        : [...selectedExtraIds, extra.id],
    );
  }

  function getCategoryIcon(categoryName: string) {
    const normalized = categoryName.toLowerCase();

    if (
      normalized.includes("massage") ||
      normalized.includes("body") ||
      normalized.includes("scrub") ||
      normalized.includes("therapy") ||
      normalized.includes("relax")
    ) {
      return HeartPulse;
    }

    if (
      normalized.includes("nail") ||
      normalized.includes("mani") ||
      normalized.includes("pedi") ||
      normalized.includes("fingers")
    ) {
      return Hand;
    }

    if (normalized.includes("feet") || normalized.includes("foot")) {
      return Footprints;
    }

    if (
      normalized.includes("facial") ||
      normalized.includes("skin") ||
      normalized.includes("head") ||
      normalized.includes("beauty")
    ) {
      return ScanFace;
    }

    if (
      normalized.includes("hair") ||
      normalized.includes("cut") ||
      normalized.includes("style") ||
      normalized.includes("braid")
    ) {
      return Scissors;
    }

    if (
      normalized.includes("spa") ||
      normalized.includes("wellness") ||
      normalized.includes("detox") ||
      normalized.includes("treatment")
    ) {
      return Leaf;
    }

    if (
      normalized.includes("wax") ||
      normalized.includes("lash") ||
      normalized.includes("brow") ||
      normalized.includes("makeup")
    ) {
      return Wand2;
    }

    if (normalized.includes("gem") || normalized.includes("gel")) {
      return Gem;
    }

    return Sparkles;
  }

  function removeSelectedService(serviceId: number) {
    setSelectedServicesOverride(
      selectedServices.filter((candidate) => candidate.service.id !== serviceId),
    );
    setSelectedExtraIdsOverride([]);
  }

  function saveSelection() {
    if (!selectedPrimary) {
      return;
    }

    const nextTotalAttendees = clampAttendees(
      effectiveTotalAttendees,
      minCapacity,
      maxCapacity,
    );
    const attendeeAdjustedServicePrice = selectedServices.reduce(
      (sum, entry) =>
        sum + Number(entry.duration.price ?? entry.service.price.amount ?? 0),
      0,
    ) * nextTotalAttendees;
    const selectedEntries = selectedServices.map(({ service, duration }) => ({
      serviceId: service.id,
      serviceName: service.name,
      durationId: duration.id,
      durationMinutes: duration.durationMinutes,
      durationName: duration.name,
      durationLabel: `${getDurationLabel(duration)} · ${duration.formattedPrice}`,
      price: duration.price,
    }));

    const primarySelection = selectedEntries[0];
    const addonEntries = selectedPrimaryExtras
      .filter((extra) => selectedExtraIds.includes(extra.id))
      .map((extra) => ({
        serviceId: extra.id,
        serviceName: extra.name,
        durationMinutes: extra.durationMinutes,
        price: extra.price.amount,
        type: "extra",
      }));
    const addonTotal = addonEntries.reduce((sum, item) => sum + Number(item.price ?? 0), 0);
    const totalBundlePrice = attendeeAdjustedServicePrice + addonTotal;

    const draft = readBookingDraft();
    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        ...draft,
        selectedServices: selectedEntries,
        primaryServiceId: primarySelection.serviceId,
        primaryServiceName: primarySelection.serviceName,
        primaryDurationId: primarySelection.durationId,
        primaryDurationMinutes: primarySelection.durationMinutes,
        primaryDurationName: primarySelection.durationName,
        primaryDurationLabel: primarySelection.durationLabel,
        primaryPrice: attendeeAdjustedServicePrice,
        addonTotal,
        addonServices: addonEntries,
        totalDurationMinutes: bundleDurationMinutes,
        totalPrice: totalBundlePrice,
        totalAttendees: nextTotalAttendees,
        selectedTotalAttendees: nextTotalAttendees,
        serviceId: primarySelection.serviceId,
        serviceName: primarySelection.serviceName,
        durationId: primarySelection.durationId,
        durationMinutes: primarySelection.durationMinutes,
        price: totalBundlePrice,
      }),
    );
    startTransition(() => {
      router.push(`/book/therapist?serviceId=${primarySelection.serviceId}`);
    });
  }

  return (
    <div className="booking-radius border border-[#d9c9bf] bg-[#fbf7f4] p-3 shadow-[0_18px_40px_rgba(90,72,64,0.04)] sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a756c]">
            Choose your services
          </p>
          <h2 className="font-serif text-3xl leading-none text-[#352d2a]">Select treatments</h2>
        </div>

        <div className="relative w-full max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#7a6c66]"
          />
          <label className="sr-only" htmlFor="service-search">
            Search treatments
          </label>
          <input
            id="service-search"
            className="h-12 w-full rounded-full border border-[#d5c1b8] bg-white/80 pl-12 pr-4 text-sm text-[#352d2a] outline-none transition placeholder:text-[#887872] focus:border-[#79594f] focus:ring-2 focus:ring-[#79594f]/15"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search treatments"
            type="search"
            value={query}
          />
        </div>
      </div>

      {cartBookings.length ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-[#d9cec8] py-3">
          <p className="text-sm text-[#655852]">
            {cartBookings.length} appointment{cartBookings.length === 1 ? "" : "s"} already in this order
          </p>
          <button
            className="text-sm font-semibold text-[#6f5047] underline underline-offset-4"
            onClick={() => {
              const draft = readBookingDraft();
              const lastBooking = cartBookings[cartBookings.length - 1];
              const remainingBookings = cartBookings.slice(0, -1);
              const addonServices = Array.isArray(lastBooking.addonServices)
                ? lastBooking.addonServices as Array<Record<string, unknown>>
                : [];
              const addonTotal = addonServices.reduce(
                (sum, item) => sum + Number(item.price ?? item.amount ?? 0),
                0,
              );
              const durationId = String(lastBooking.durationId ?? "");
              const durationName = String(lastBooking.durationName ?? "");
              const durationLabel = String(
                lastBooking.durationLabel ?? `${lastBooking.duration} min`,
              );
              const primaryPrice = Number(
                lastBooking.primaryPrice ?? Number(lastBooking.totalPrice ?? 0) - addonTotal,
              );
              const selectedService = {
                serviceId: Number(lastBooking.serviceId),
                serviceName: String(lastBooking.serviceName ?? "Treatment"),
                durationId,
                durationMinutes: Number(lastBooking.duration),
                durationName,
                durationLabel,
                price: primaryPrice,
              };
              sessionStorage.setItem(
                "aura-booking-draft",
                JSON.stringify({
                  ...draft,
                  cartBookings: remainingBookings,
                  selectedServices: [selectedService],
                  primaryServiceId: selectedService.serviceId,
                  primaryServiceName: selectedService.serviceName,
                  primaryDurationId: durationId,
                  primaryDurationMinutes: selectedService.durationMinutes,
                  primaryDurationName: durationName,
                  primaryDurationLabel: durationLabel,
                  primaryPrice,
                  addonServices,
                  addonTotal,
                  totalDurationMinutes: Number(lastBooking.totalDurationMinutes ?? lastBooking.duration),
                  totalPrice: Number(lastBooking.totalPrice ?? 0),
                  totalAttendees: Number(lastBooking.totalAttendees ?? 1),
                  selectedTotalAttendees: Number(lastBooking.totalAttendees ?? 1),
                  serviceId: selectedService.serviceId,
                  serviceName: selectedService.serviceName,
                  durationId,
                  durationMinutes: selectedService.durationMinutes,
                  price: Number(lastBooking.totalPrice ?? 0),
                  therapistId: Number(lastBooking.therapistId),
                  therapistName: String(lastBooking.therapistName ?? ""),
                  startDate: String(lastBooking.startDate),
                  startMinutes: Number(lastBooking.startMinutes),
                  endMinutes: Number(lastBooking.endMinutes),
                }),
              );
              const params = new URLSearchParams({
                serviceId: String(lastBooking.serviceId),
                therapistId: String(lastBooking.therapistId),
                duration: String(lastBooking.duration),
                startDate: String(lastBooking.startDate),
                startMinutes: String(lastBooking.startMinutes),
              });
              router.push(`/book/review?${params}`);
            }}
            type="button"
          >
            Return to order
          </button>
        </div>
      ) : null}

      {selectedPrimary ? (
        <div className="booking-radius mb-5 border border-[#d9b9aa] bg-[linear-gradient(135deg,#f7ece7_0%,#f2e3df_100%)] p-3 shadow-[0_12px_26px_rgba(88,68,59,0.06)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8a756c]">
                Selected treatment
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {selectedServices.map(({ service, duration }) => (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#d8b7ab] bg-[#fffaf7] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5f4037]"
                    key={service.id}
                  >
                    <span>
                      {`${service.name} · ${getDurationLabel(duration)}`}
                    </span>
                    <button
                      aria-label={`Remove ${service.name}`}
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#5f4037] text-white transition hover:bg-[#43332f]"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeSelectedService(service.id);
                      }}
                      type="button"
                    >
                      <X aria-hidden="true" className="size-2.5" />
                    </button>
                  </span>
                ))}
              </div>

              {selectedPrimaryExtras.length > 0 ? (
                <div className="mt-3">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a756c]">
                    Available add-ons
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrimaryExtras.map((extra) => {
                      const isSelectedExtra = selectedExtraIds.includes(extra.id);

                      return (
                        <button
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] transition ${
                            isSelectedExtra
                              ? "border-[#5f4037] bg-[#5f4037] text-white"
                              : "border-[#d5c0b3] bg-[#fffefc] text-[#664d45] hover:border-[#79594f]"
                          }`}
                          key={extra.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleExtra(extra);
                          }}
                          type="button"
                        >
                          <span>{extra.name}</span>
                          {extra.durationMinutes ? (
                            <span className={isSelectedExtra ? "text-white/85" : "text-[#8e736a]"}>
                              · {extra.durationMinutes} min
                            </span>
                          ) : null}
                          <span className={isSelectedExtra ? "text-white/90" : "text-[#5f4037]"}>
                            {extra.price.formatted}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {selectedPrimary ? (
                <div className="booking-radius mt-4 border border-[#d9c5bb] bg-[#fffdfb] p-3">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a756c]">
                    Total Attendees
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-black text-[#352d2a]">
                        Please select how many people are coming
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5c1b8] bg-white text-lg font-bold text-[#352d2a] transition hover:border-[#79594f] disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={effectiveTotalAttendees <= minCapacity}
                          onClick={() =>
                            setTotalAttendeesOverride(
                              clampAttendees(totalAttendees - 1, minCapacity, maxCapacity),
                            )
                          }
                          type="button"
                        >
                          −
                        </button>
                        <div className="flex h-10 min-w-14 items-center justify-center rounded-full border border-[#352d2a] bg-[#352d2a] px-4 text-lg font-black text-white">
                          {effectiveTotalAttendees}
                        </div>
                        <button
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5c1b8] bg-white text-lg font-bold text-[#352d2a] transition hover:border-[#79594f] disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={effectiveTotalAttendees >= maxCapacity}
                          onClick={() =>
                            setTotalAttendeesOverride(
                              clampAttendees(totalAttendees + 1, minCapacity, maxCapacity),
                            )
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a756c]">
                      Max capacity: {maxCapacity}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8b7ab] bg-[#fffdfb]/90 px-2.5 py-1.5 text-[11px] font-medium text-[#4f413d]">
              <span>{bundleDurationMinutes} min</span>
              <span className="h-1 w-1 rounded-full bg-[#b28d7d]" aria-hidden="true" />
              <span>
                {new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                }).format(bundlePrice)}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div
        aria-label="Treatment categories"
        className="mb-6 flex flex-wrap gap-2"
        role="tablist"
      >
        <button
          aria-selected={activeCategoryId === "all"}
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-[10px] font-black tracking-[0.02em] transition ${
            activeCategoryId === "all"
              ? "border-[#352d2a] bg-[#352d2a] text-white shadow-sm"
              : "border-[#d5c1b8] bg-transparent text-[#655852] hover:border-[#79594f]"
          }`}
          onClick={() => selectCategory("all")}
          role="tab"
          type="button"
        >
          <span>All</span>
        </button>
        {categoryTabs.map((category) => {
          const CategoryIcon = getCategoryIcon(category.name);

          return (
            <button
              aria-selected={activeCategoryId === category.id}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-[10px] font-black tracking-[0.02em] transition ${
                activeCategoryId === category.id
                  ? "border-[#352d2a] bg-[#352d2a] text-white shadow-sm"
                  : "border-[#d5c1b8] bg-transparent text-[#655852] hover:border-[#79594f]"
              }`}
              key={category.id}
              onClick={() => selectCategory(category.id)}
              role="tab"
              type="button"
            >
              <CategoryIcon className="size-3.5" aria-hidden="true" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 w-full">
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#786b65]" aria-live="polite">
          {visibleTotal} {visibleTotal === 1 ? "treatment" : "treatments"}
        </p>

        {visibleCategories.length ? (
          <div className="space-y-7">
            {visibleCategories.map((category) => {
              const isCollapsed = expandedCategoryIds[category.id] === false;
              const nestedGroup = nestedCategoryGroups.find(
                (group) => group.parentId === category.id,
              );
              const activeNestedSubcategory = nestedGroup
                ? nestedGroup.subcategories.find(
                    (subcategory) =>
                      subcategory.id === activeNestedSubcategoryIds[nestedGroup.parentId],
                  )
                : null;
              const activeNestedServices = nestedGroup
                ? activeNestedSubcategory?.services ?? []
                : category.services;

              return (
                <section aria-labelledby={`category-${category.id}`} key={category.id}>
                  <button
                    className="mb-3 flex w-full items-center justify-between gap-4 border-b border-[#d9c9bf] pb-2.5 text-left"
                    onClick={() => toggleCategory(category.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <h3
                        className="font-serif text-xl text-[#352d2a] sm:text-2xl"
                        id={`category-${category.id}`}
                      >
                        {category.name}
                      </h3>
                      <span className="rounded-full border border-[#e0d1c8] bg-[#fffdfb] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8d7970]">
                        {nestedGroup ? activeNestedServices.length : category.services.length} service{(nestedGroup ? activeNestedServices.length : category.services.length) === 1 ? "" : "s"}
                      </span>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d5c1b8] bg-white text-[#5f4037]">
                      {isCollapsed ? (
                        <ChevronDown aria-hidden="true" className="size-4" />
                      ) : (
                        <ChevronUp aria-hidden="true" className="size-4" />
                      )}
                    </span>
                  </button>

                  {!isCollapsed &&
                  nestedGroup &&
                  activeCategoryId === nestedGroup.parentId &&
                  nestedGroup.subcategories.length > 0 ? (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {nestedGroup.subcategories.map((subcategory) => {
                        const isActive =
                          subcategory.id === activeNestedSubcategoryIds[nestedGroup.parentId];

                        return (
                          <button
                            className={`inline-flex h-10 items-center rounded-full border px-3 text-[10px] font-black tracking-[0.02em] transition ${
                              isActive
                                ? "border-[#352d2a] bg-[#352d2a] text-white shadow-sm"
                                : "border-[#d5c1b8] bg-white text-[#5f4037] hover:border-[#79594f]"
                            }`}
                            key={subcategory.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveNestedSubcategoryIds((current) => ({
                                ...current,
                                [nestedGroup.parentId]: subcategory.id,
                              }));
                            }}
                            type="button"
                          >
                            {subcategory.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {!isCollapsed &&
                  (!nestedGroup ||
                    (activeCategoryId === nestedGroup.parentId && activeNestedSubcategory)) ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {activeNestedServices.map((service) => {
                        const selectedItem =
                          selectedServices.find(
                            (candidate) => candidate.service.id === service.id,
                          ) ?? null;
                        const isSelected = selectedItem !== null;
                        const isPrimary = selectedPrimary?.service.id === service.id;

                        return (
                          <Card
                            className={`h-full overflow-hidden border transition-all ${
                              isSelected
                                ? "border-[#5f4037] bg-[linear-gradient(135deg,#f7ece7_0%,#f2e3df_100%)] shadow-[0_16px_35px_rgba(88,68,59,0.08)]"
                                : "border-[#e7ddd7] bg-[linear-gradient(180deg,#ffffff_0%,#fdf9f7_100%)] hover:border-[#c9a99a] hover:shadow-[0_10px_25px_rgba(88,68,59,0.04)]"
                            }`}
                            key={service.id}
                          >
                            <button
                              aria-pressed={isSelected}
                              className="block h-full w-full flex-1 text-left"
                              onClick={() => selectService(service)}
                              type="button"
                            >
                              <CardContent className="p-3.5 sm:p-4">
                                <div className="flex items-start justify-between gap-2.5">
                                  <div className="min-w-0">
                                    <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8a756c]">
                                      <span className="inline-block h-2 w-2 rounded-full bg-[#b1887a]" />
                                      {isPrimary ? "Primary treatment" : "Signature ritual"}
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <h4 className="text-base font-semibold text-[#352d2a] sm:text-lg">
                                        {service.name}
                                      </h4>
                                      {isSelected ? (
                                        <Check
                                          aria-hidden="true"
                                          className="mt-0.5 size-4 shrink-0 text-[#7c554a]"
                                        />
                                      ) : null}
                                    </div>
                                  </div>

                                  <span className="rounded-full border border-[#d9c5bb] bg-[#fffdfb] px-2.5 py-1.5 text-right text-xs font-semibold text-[#5f4037] shadow-[0_8px_18px_rgba(85,66,59,0.04)]">
                                    {getPriceLabel(service)}
                                  </span>
                                </div>

                                {service.shortDescription ? (
                                  <p className="mt-3 text-sm leading-6 text-[#746760]">
                                    {service.shortDescription}
                                  </p>
                                ) : null}

                                {service.extras && service.extras.length > 0 ? (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {service.extras.slice(0, 3).map((extra) => (
                                      <span
                                        className="inline-flex items-center rounded-full border border-[#d9bdb2] bg-[#fffaf7] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5a453d]"
                                        key={extra.id}
                                      >
                                        {extra.name}
                                      </span>
                                    ))}
                                    {service.extras.length > 3 ? (
                                      <span className="inline-flex items-center rounded-full border border-[#d9bdb2] bg-[#fffaf7] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5a453d]">
                                        +{service.extras.length - 3}
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}

                                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#746760]">
                                  <span className="inline-flex items-center gap-1.5">
                                    <Clock aria-hidden="true" className="size-4" />
                                    {service.durationMinutes} min
                                  </span>
                                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8a756c]">
                                    {isPrimary ? "Primary" : isSelected ? "Selected" : "Available"}
                                  </span>
                                </div>
                              </CardContent>
                            </button>

                            {service.durations.length > 1 ? (
                              <CardFooter className="border-t border-[#eaded8] bg-[#faf3ef] p-3 sm:p-4">
                                <div className="w-full">
                                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#786b65]">
                                    {getDurationSectionLabel(service, isSelected)}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {service.durations.map((duration) => (
                                      <Button
                                        aria-pressed={selectedItem?.duration.id === duration.id}
                                        className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
                                          selectedItem?.duration.id === duration.id
                                            ? "border-[#5f4037] bg-[#5f4037] text-white shadow-sm hover:bg-[#5f4037]"
                                            : "border-[#d4c1b9] bg-white text-[#4e433f] hover:border-[#79594f] hover:bg-[#fffdfb]"
                                        }`}
                                        key={duration.id}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          chooseServiceDuration(service, duration);
                                        }}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                      >
                                        {getDurationLabel(duration)} · {duration.formattedPrice}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </CardFooter>
                            ) : null}
                          </Card>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="booking-radius border border-[#d9c9bf] bg-[#f9f3f0] py-16 text-center">
            <p className="font-serif text-2xl text-[#493d38]">No treatments found</p>
            <button
              className="mt-4 text-sm font-semibold text-[#79594f] underline underline-offset-4"
              onClick={() => {
                setQuery("");
                setActiveCategoryId("all");
              }}
              type="button"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#352d2a] px-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#5f4037] disabled:cursor-not-allowed disabled:bg-[#d5c4ba] disabled:text-[#7e6e67]"
          disabled={!selectedServices.length || isPending}
          onClick={saveSelection}
          type="button"
        >
          {isPending ? "Preparing..." : "Continue"}
          {!isPending ? <ArrowRight className="size-4" /> : null}
        </button>
      </div>
    </div>
  );
}
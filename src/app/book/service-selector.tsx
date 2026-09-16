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
import { useDeferredValue, useEffect, useState, useTransition } from "react";
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

function clampAttendees(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getPriceLabel(service: LatePointService) {
  if (service.price.amount <= 0) {
    return "Price varies";
  }

  return `${service.price.isVariable ? "From " : ""}${service.price.formatted}`;
}

export function ServiceSelector({ categories }: ServiceCatalog) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">(
    "all",
  );
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<number, boolean>>(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.id, false]),
      ) as Record<number, boolean>,
  );
  const [query, setQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<Selection[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);
  const [totalAttendees, setTotalAttendees] = useState<number>(1);

  useEffect(() => {
    const draft = readBookingDraft();
    const draftSelections = Array.isArray(draft.selectedServices)
      ? (draft.selectedServices as Array<Record<string, unknown>>)
      : [];
    const draftAddonServices = Array.isArray(draft.addonServices)
      ? (draft.addonServices as Array<Record<string, unknown>>)
      : [];
    const draftTotalAttendees = Number(
      draft.totalAttendees ?? draft.selectedTotalAttendees ?? 1,
    );

    if (!draftSelections.length) {
      setSelectedServices([]);
      setSelectedExtraIds(
        draftAddonServices
          .map((entry) => Number(entry.serviceId ?? entry.id))
          .filter((value) => Number.isFinite(value) && value > 0),
      );
      setTotalAttendees(Number.isFinite(draftTotalAttendees) && draftTotalAttendees > 0 ? draftTotalAttendees : 1);
      return;
    }

    const allServices = categories.flatMap((category) => category.services);

    const restoredSelections = draftSelections
      .map((entry) => {
        const service = allServices.find(
          (candidate) => candidate.id === Number(entry.serviceId),
        );

        if (!service) {
          return null;
        }

        const duration =
          service.durations.find((candidate) => candidate.id === String(entry.durationId)) ??
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

    setSelectedServices(restoredSelections);
    setSelectedExtraIds(
      draftAddonServices
        .map((entry) => Number(entry.serviceId ?? entry.id))
        .filter((value) => Number.isFinite(value) && value > 0),
    );
    setTotalAttendees(
      Number.isFinite(draftTotalAttendees) && draftTotalAttendees > 0
        ? draftTotalAttendees
        : 1,
    );
  }, [categories]);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const router = useRouter();
  const selectedPrimary = selectedServices[0] ?? null;
  const selectedPrimaryExtras = selectedPrimary?.service.extras ?? [];
  const maxCapacity = Math.max(
    1,
    Number.isFinite(selectedPrimary?.service.capacityMax)
      ? Number(selectedPrimary?.service.capacityMax ?? 1)
      : 1,
  );
  const minCapacity = Math.max(
    1,
    Number.isFinite(selectedPrimary?.service.capacityMin)
      ? Number(selectedPrimary?.service.capacityMin ?? 1)
      : 1,
  );

  useEffect(() => {
    setTotalAttendees((current) => clampAttendees(current, minCapacity, maxCapacity));
  }, [minCapacity, maxCapacity]);

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
  const bundleDurationMinutes =
    selectedServices.reduce((sum, entry) => sum + entry.duration.durationMinutes, 0) +
    selectedExtraDurationMinutes;
  const bundlePrice =
    selectedServicePrice * effectiveTotalAttendees + selectedExtraPrice;

  const visibleCategories = categories
    .filter(
      (category) =>
        activeCategoryId === "all" || category.id === activeCategoryId,
    )
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
    setExpandedCategoryIds((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  function selectCategory(categoryId: number | "all") {
    setActiveCategoryId(categoryId);

    if (categoryId === "all") {
      return;
    }

    setExpandedCategoryIds((current) => ({
      ...Object.fromEntries(
        Object.keys(current).map((key) => [Number(key), false]),
      ),
      [categoryId]: true,
    }));
  }

  const visibleTotal = visibleCategories.reduce(
    (count, category) => count + category.services.length,
    0,
  );

  function selectService(service: LatePointService) {
    const duration = service.durations[0] ?? {
      id: "default",
      name: "",
      durationMinutes: service.durationMinutes,
      price: service.price.amount,
      formattedPrice: service.price.formatted,
    };

    setSelectedServices((current) => {
      const existingIndex = current.findIndex(
        (candidate) => candidate.service.id === service.id,
      );

      if (existingIndex >= 0) {
        setSelectedExtraIds([]);
        return current.filter((candidate) => candidate.service.id !== service.id);
      }

      if (current.length > 0) {
        return current;
      }

      setSelectedExtraIds([]);
      return [{ service, duration }];
    });
  }

  function chooseServiceDuration(service: LatePointService, duration: ServiceDuration) {
    setSelectedServices((current) => {
      const existingIndex = current.findIndex(
        (candidate) => candidate.service.id === service.id,
      );

      if (existingIndex >= 0) {
        setSelectedExtraIds([]);
        return current.map((candidate) =>
          candidate.service.id === service.id ? { ...candidate, duration } : candidate,
        );
      }

      if (current.length > 0) {
        return current;
      }

      setSelectedExtraIds([]);
      return [{ service, duration }];
    });
  }

  function toggleExtra(extra: NonNullable<LatePointService["extras"]>[number]) {
    if (!selectedPrimary) {
      return;
    }

    setSelectedExtraIds((current) =>
      current.includes(extra.id)
        ? current.filter((id) => id !== extra.id)
        : [...current, extra.id],
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

  function selectDuration(serviceId: number, duration: ServiceDuration) {
    setSelectedServices((current) =>
      current.map((candidate) =>
        candidate.service.id === serviceId ? { ...candidate, duration } : candidate,
      ),
    );
  }

  function removeSelectedService(serviceId: number) {
    setSelectedServices((current) =>
      current.filter((candidate) => candidate.service.id !== serviceId),
    );
    setSelectedExtraIds([]);
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

    const totalBundlePrice = attendeeAdjustedServicePrice + selectedExtraPrice;

    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        selectedServices: selectedEntries,
        primaryServiceId: primarySelection.serviceId,
        primaryServiceName: primarySelection.serviceName,
        primaryDurationId: primarySelection.durationId,
        primaryDurationMinutes: primarySelection.durationMinutes,
        primaryPrice: attendeeAdjustedServicePrice,
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
    <div className="rounded-[1.75rem] border border-[#d9c9bf] bg-[#fbf7f4] p-3 shadow-[0_18px_40px_rgba(90,72,64,0.04)] sm:p-5 lg:p-6">
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

      {selectedPrimary ? (
        <div className="mb-5 rounded-[1.25rem] border border-[#d9b9aa] bg-[linear-gradient(135deg,#f7ece7_0%,#f2e3df_100%)] p-3 shadow-[0_12px_26px_rgba(88,68,59,0.06)] sm:p-4">
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
                      {`${service.name} · ${duration.durationMinutes} min`}
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
                <div className="mt-4 rounded-[1rem] border border-[#d9c5bb] bg-[#fffdfb] p-3">
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
                            setTotalAttendees((current) => clampAttendees(current - 1, minCapacity, maxCapacity))
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
                            setTotalAttendees((current) => clampAttendees(current + 1, minCapacity, maxCapacity))
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
        {categories.map((category) => {
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
                        {category.services.length} service{category.services.length === 1 ? "" : "s"}
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

                  {!isCollapsed ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {category.services.map((service) => {
                        const selectedItem =
                          selectedServices.find(
                            (candidate) => candidate.service.id === service.id,
                          ) ?? null;
                        const isSelected = selectedItem !== null;
                        const isPrimary = selectedPrimary?.service.id === service.id;
                        const isAddOn = false;

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
                              className="block w-full text-left"
                              onClick={() => selectService(service)}
                              type="button"
                            >
                              <CardContent className="p-3.5 sm:p-4">
                                <div className="flex items-start justify-between gap-2.5">
                                  <div className="min-w-0">
                                    <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8a756c]">
                                      <span className="inline-block h-2 w-2 rounded-full bg-[#b1887a]" />
                                      {isPrimary ? "Primary treatment" : isAddOn ? "Add-on selected" : "Signature ritual"}
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
                                    {isPrimary ? "Primary" : isAddOn ? "Add-on" : isSelected ? "Selected" : "Available"}
                                  </span>
                                </div>
                              </CardContent>
                            </button>

                            {service.durations.length > 1 ? (
                              <CardFooter className="border-t border-[#eaded8] bg-[#faf3ef] p-3 sm:p-4">
                                <div className="w-full">
                                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#786b65]">
                                    {isSelected ? "Choose duration" : "Available durations"}
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
                                        {duration.durationMinutes} min · {duration.formattedPrice}
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
          <div className="rounded-[1.5rem] border border-[#d9c9bf] bg-[#f9f3f0] py-16 text-center">
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
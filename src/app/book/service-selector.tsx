"use client";

import { ArrowRight, Check, Clock, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState, useTransition } from "react";
import type {
  LatePointService,
  ServiceCatalog,
  ServiceDuration,
} from "@/lib/latepoint";

type Selection = {
  service: LatePointService;
  duration: ServiceDuration;
};

function getPriceLabel(service: LatePointService) {
  if (service.price.amount <= 0) {
    return "Price varies";
  }

  return `${service.price.isVariable ? "From " : ""}${service.price.formatted}`;
}

export function ServiceSelector({ categories, total }: ServiceCatalog) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">(
    "all",
  );
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const router = useRouter();

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

    setSelection({ service, duration });
  }

  function selectDuration(duration: ServiceDuration) {
    if (!selection) {
      return;
    }

    setSelection({ ...selection, duration });
  }

  function saveSelection() {
    if (!selection) {
      return;
    }

    sessionStorage.setItem(
      "aura-booking-draft",
      JSON.stringify({
        serviceId: selection.service.id,
        serviceName: selection.service.name,
        durationId: selection.duration.id,
        durationMinutes: selection.duration.durationMinutes,
        price: selection.duration.price,
      }),
    );
    startTransition(() => {
      router.push(`/book/therapist?serviceId=${selection.service.id}`);
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <div className="min-w-0">
        <div className="relative mb-6">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#7a6c66]"
          />
          <label className="sr-only" htmlFor="service-search">
            Search treatments
          </label>
          <input
            id="service-search"
            className="h-13 w-full border border-[#cbbdb6] bg-white/70 pl-12 pr-4 text-base outline-none transition focus:border-[#79594f] focus:ring-2 focus:ring-[#79594f]/15"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search treatments"
            type="search"
            value={query}
          />
        </div>

        <div
          aria-label="Treatment categories"
          className="mb-10 flex gap-2 overflow-x-auto pb-2"
          role="tablist"
        >
          <button
            aria-selected={activeCategoryId === "all"}
            className={`h-10 shrink-0 border px-4 text-sm font-semibold transition ${
              activeCategoryId === "all"
                ? "border-[#352d2a] bg-[#352d2a] text-white"
                : "border-[#cbbdb6] bg-transparent text-[#655852] hover:border-[#79594f]"
            }`}
            onClick={() => setActiveCategoryId("all")}
            role="tab"
            type="button"
          >
            All {total}
          </button>
          {categories.map((category) => (
            <button
              aria-selected={activeCategoryId === category.id}
              className={`h-10 shrink-0 border px-4 text-sm font-semibold transition ${
                activeCategoryId === category.id
                  ? "border-[#352d2a] bg-[#352d2a] text-white"
                  : "border-[#cbbdb6] bg-transparent text-[#655852] hover:border-[#79594f]"
              }`}
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              role="tab"
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>

        <p className="mb-5 text-sm text-[#786b65]" aria-live="polite">
          {visibleTotal} {visibleTotal === 1 ? "treatment" : "treatments"}
        </p>

        {visibleCategories.length ? (
          <div className="space-y-12">
            {visibleCategories.map((category) => (
              <section aria-labelledby={`category-${category.id}`} key={category.id}>
                <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#cbbdb6] pb-3">
                  <h2
                    className="font-serif text-3xl text-[#352d2a]"
                    id={`category-${category.id}`}
                  >
                    {category.name}
                  </h2>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7970]">
                    {category.services.length}
                  </span>
                </div>

                <div className="divide-y divide-[#d9cec8] border-b border-[#d9cec8]">
                  {category.services.map((service) => {
                    const isSelected = selection?.service.id === service.id;

                    return (
                      <article
                        className={`transition-colors ${
                          isSelected ? "bg-[#eee2dc]" : "hover:bg-white/55"
                        }`}
                        key={service.id}
                      >
                        <button
                          aria-pressed={isSelected}
                          className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-5 px-4 py-5 text-left sm:px-5"
                          onClick={() => selectService(service)}
                          type="button"
                        >
                          <span className="min-w-0">
                            <span className="flex items-start gap-3 text-base font-semibold text-[#352d2a] sm:text-lg">
                              <span>{service.name}</span>
                              {isSelected ? (
                                <Check
                                  aria-hidden="true"
                                  className="mt-0.5 size-5 shrink-0 text-[#7c554a]"
                                />
                              ) : null}
                            </span>
                            {service.shortDescription ? (
                              <span className="mt-2 block max-w-2xl text-sm leading-6 text-[#746760]">
                                {service.shortDescription}
                              </span>
                            ) : null}
                            <span className="mt-3 flex items-center gap-1.5 text-sm text-[#746760]">
                              <Clock aria-hidden="true" className="size-4" />
                              {service.durationMinutes} min
                            </span>
                          </span>
                          <span className="pt-0.5 text-right font-semibold text-[#5f4037]">
                            {getPriceLabel(service)}
                          </span>
                        </button>

                        {isSelected && service.durations.length > 1 ? (
                          <div className="border-t border-[#d9cec8] px-4 py-4 sm:px-5">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#786b65]">
                              Choose duration
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {service.durations.map((duration) => (
                                <button
                                  aria-pressed={selection.duration.id === duration.id}
                                  className={`border px-3 py-2 text-sm transition ${
                                    selection.duration.id === duration.id
                                      ? "border-[#5f4037] bg-[#5f4037] text-white"
                                      : "border-[#bfaea6] bg-white/70 text-[#4e433f]"
                                  }`}
                                  key={duration.id}
                                  onClick={() => selectDuration(duration)}
                                  type="button"
                                >
                                  {duration.durationMinutes} min · {duration.formattedPrice}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="border-y border-[#cbbdb6] py-16 text-center">
            <p className="font-serif text-2xl text-[#493d38]">
              No treatments found
            </p>
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

      <aside className="border border-[#cbbdb6] bg-[#f8f4f1] p-5 lg:sticky lg:top-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a756c]">
          Your selection
        </p>
        {selection ? (
          <div className="mt-5">
            <h2 className="font-serif text-2xl text-[#352d2a]">
              {selection.service.name}
            </h2>
            <div className="mt-4 flex items-center justify-between border-y border-[#d9cec8] py-4 text-sm">
              <span>{selection.duration.durationMinutes} minutes</span>
              <strong>{selection.duration.formattedPrice}</strong>
            </div>
            <button
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-[#352d2a] px-5 font-semibold text-white transition hover:bg-[#5f4037] disabled:cursor-wait disabled:opacity-70"
              disabled={isPending}
              onClick={saveSelection}
              type="button"
            >
              {isPending ? "Loading therapists..." : "Continue"}
              {!isPending ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
            </button>
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-[#786b65]">
            Choose a treatment to see your booking summary.
          </p>
        )}
      </aside>
    </div>
  );
}
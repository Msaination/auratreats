"use client";

import { useEffect, useState } from "react";
import type { LatePointPackage, ServiceCatalog } from "@/lib/latepoint";
import { getPackageCatalog, getServiceCatalog } from "@/lib/latepoint";
import { ServiceSelector } from "./service-selector";

type LoaderState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      catalog: ServiceCatalog;
      packages: LatePointPackage[];
    };

export function ServiceCatalogLoader({
  initialCategory,
}: {
  initialCategory?: "packages";
}) {
  const [state, setState] = useState<LoaderState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    Promise.all([
      getServiceCatalog(),
      getPackageCatalog().catch(() => ({ packages: [], total: 0 })),
    ])
      .then(([catalog, packageCatalog]) => {
        if (active) {
          setState({
            status: "ready",
            catalog,
            packages: packageCatalog.packages,
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: "error" });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section
        aria-busy="true"
        className="booking-radius border border-[#d9c9bf] bg-[#faf6f3] px-5 py-16 text-center shadow-[0_18px_40px_rgba(90,72,64,0.04)]"
      >
        <p className="font-serif text-3xl">Loading treatments…</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="booking-radius border border-[#d9c9bf] bg-[#faf6f3] py-16 text-center shadow-[0_18px_40px_rgba(90,72,64,0.04)]">
        <h2 className="font-serif text-3xl text-[#352d2a]">
          Treatments are unavailable
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746760]">
          We could not reach the booking service. Please refresh the page in a
          moment.
        </p>
      </section>
    );
  }

  return (
    <ServiceSelector
      key={initialCategory ?? "default"}
      {...state.catalog}
      packages={state.packages}
      initialCategory={initialCategory}
    />
  );
}

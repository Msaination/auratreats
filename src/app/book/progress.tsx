import Link from "next/link";

type ProgressStep = {
  label: string;
  href?: string;
  complete?: boolean;
  current?: boolean;
};

export function BookingProgress({ steps }: { steps: ProgressStep[] }) {
  return (
    <nav aria-label="Booking progress" className="border-b border-[#e5d8d2] bg-[#f8f2ef]">
      <ol className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-4 sm:px-8">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const content = (
            <>
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition",
                  step.current
                    ? "bg-[#352d2a] text-white shadow-[0_8px_18px_rgba(53,45,42,0.18)]"
                    : step.complete
                      ? "bg-[#6f5047] text-white"
                      : "bg-white text-[#7c655d] ring-1 ring-[#d8c5bb]",
                ].join(" ")}
              >
                {stepNumber}
              </span>
              <span
                className={[
                  "text-[10px] font-semibold uppercase tracking-[0.24em] whitespace-nowrap",
                  step.current
                    ? "text-[#352d2a]"
                    : step.complete
                      ? "text-[#5f4037]"
                      : "text-[#806b62]",
                ].join(" ")}
              >
                {step.label}
              </span>
            </>
          );

          return (
            <li className="flex shrink-0 items-center" key={step.label}>
              {step.href && !step.current ? (
                <Link className="flex items-center gap-3" href={step.href}>
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-3">{content}</span>
              )}
              {index < steps.length - 1 ? (
                <span className="mx-2 hidden h-px w-8 bg-[#d9c5bd] md:block" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

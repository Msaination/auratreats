import Image from "next/image";
import Link from "next/link";

export function BookingHeader() {
  return (
    <header className="border-b border-[#cbbdb6] bg-[#f8f4f1]">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link aria-label="Aura Spa home" className="flex h-14 items-center" href="/">
          <Image
            alt="Aura Spa"
            className="h-12 w-auto object-contain sm:h-14"
            height={340}
            priority
            src="/images/AuraLogo.png"
            width={468}
          />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#806b62]">
          Appointment
        </span>
      </div>
    </header>
  );
}

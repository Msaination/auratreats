import Link from "next/link";
import { wordpressQuery } from "@/lib/wordpress";

type SiteSettings = {
  generalSettings: {
    description: string;
    title: string;
    url: string;
  };
};

const SITE_SETTINGS_QUERY = `
  query SiteSettings {
    generalSettings {
      description
      title
      url
    }
  }
`;

export const dynamic = "force-dynamic";

export default async function Home() {
  const site = await wordpressQuery<SiteSettings>(SITE_SETTINGS_QUERY).catch(
    () => null,
  );

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-[#f3eee9] px-6 text-[#302b2a]"
      style={{
        backgroundImage: "url('/AuraBG.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#140f0e]/60" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-4xl border border-white/25 bg-[#f7f1ee]/75 px-6 py-20 text-center shadow-[0_25px_80px_rgba(23,17,15,0.25)] backdrop-blur-[2px] sm:px-10 sm:py-28">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#2f211e]">
          Wellness · Beauty · Relaxation
        </p>

        <div className="flex justify-center">
          <img
            src="/AuraLogo.png"
            alt="Aura Spa logo"
            className="h-24 w-auto object-contain sm:h-28"
          />
        </div>

        <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-7 text-[#1b1211] sm:text-lg">
          {site?.generalSettings.description || "Your perfect sanctuary awaits."}
        </p>

        <Link
          className="mx-auto mt-9 inline-flex h-12 items-center justify-center bg-[#352d2a] px-7 text-sm font-semibold text-white transition hover:bg-[#5f4037]"
          href="/book"
        >
          Book an appointment
        </Link>

        <div className="mt-7 flex justify-center opacity-80">
          <img
            src="/products.png"
            alt="Aura products"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </div>
      </section>
    </main>
  );
}

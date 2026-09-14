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
    <main className="flex min-h-screen items-center justify-center bg-[#f3eee9] px-6 text-[#302b2a]">
      <section className="w-full max-w-4xl border-y border-[#b49b91] py-20 text-center sm:py-28">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6d63]">
          Wellness · Beauty · Relaxation
        </p>
        <h1 className="font-serif text-5xl leading-none sm:text-7xl">
          {site?.generalSettings.title ?? "Aura Spa"}
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#675b57] sm:text-lg">
          {site?.generalSettings.description ||
            "Your perfect sanctuary awaits."}
        </p>
        <Link
          className="mx-auto mt-9 inline-flex h-12 items-center justify-center bg-[#352d2a] px-7 text-sm font-semibold text-white transition hover:bg-[#5f4037]"
          href="/book"
        >
          Book an appointment
        </Link>
      </section>
    </main>
  );
}

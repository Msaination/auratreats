import {
  BrandIntro,
  BenefitsBlock,
  CorporateWellbeing,
  FeatureGrid,
  FinalCTA,
  Footer,
  GiftVoucherBlock,
  Header,
  Hero,
  OfferList,
  ServicesGrid,
  TestimonialGrid,
  TreatmentsGrid,
} from "@/components/home-page";
import { loadHomePageContent } from "@/lib/home-page";

export default async function HomePage() {
  const content = await loadHomePageContent();

  return (
    <main className="spa-shell">
      <Header content={content} />
      <Hero content={content} />
      <BrandIntro content={content} />
      <FeatureGrid content={content} />
      <ServicesGrid content={content} />
      <TreatmentsGrid content={content} />
      <BenefitsBlock content={content} />
      <GiftVoucherBlock content={content} />
      <OfferList content={content} />
      <CorporateWellbeing content={content} />
      <TestimonialGrid content={content} />
      <FinalCTA content={content} />
      <Footer content={content} />
      <a
        href="https://wa.me/27671832446?text=Hello%20Aura%20Spa%2C%20I%20would%20like%20to%20enquire%20about%20a%20treatment."
        target="_blank"
        rel="noreferrer"
        className="spa-whatsapp-chat"
        aria-label="Chat with Aura Spa on WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M20.52 3.48A11.76 11.76 0 0 0 12.03 0C5.47 0 .08 5.38.08 12.01c0 2.12.55 4.19 1.6 6.02L0 24l6.13-1.58A11.97 11.97 0 0 0 12.03 24c6.55 0 11.94-5.38 11.94-12.01 0-3.2-1.25-6.21-3.45-8.51ZM12.03 21.7c-1.93 0-3.82-.52-5.46-1.5l-.39-.23-3.64.94 1-3.52-.25-.38a9.63 9.63 0 0 1-1.52-5.01c0-5.32 4.35-9.66 9.7-9.66 2.59 0 5.03 1.01 6.86 2.83a9.59 9.59 0 0 1 2.84 6.83c0 5.32-4.35 9.66-9.7 9.66Zm5.29-7.2c-.29-.14-1.72-.85-1.98-.95-.27-.1-.46-.14-.65.14-.19.29-.73.95-.9 1.15-.16.19-.33.22-.61.07-.29-.14-1.21-.45-2.31-1.44-.85-.76-1.43-1.7-1.6-1.98-.16-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.49.1-.2.05-.38-.02-.52-.07-.14-.65-1.55-.89-2.12-.24-.57-.49-.49-.65-.5l-.56-.01c-.19 0-.5.07-.76.35-.27.29-1.03 1.01-1.03 2.46s1.06 2.85 1.2 3.04c.14.19 2.09 3.2 5.06 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.57-.34Z"
            fill="currentColor"
          />
        </svg>
      </a>
    </main>
  );
}

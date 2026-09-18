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
    </main>
  );
}

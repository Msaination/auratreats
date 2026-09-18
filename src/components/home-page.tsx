import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { HomePageContent } from "@/lib/home-page";

type HomePageProps = {
  content: HomePageContent;
};

export function Header({ content }: HomePageProps) {
  return (
    <header className="spa-header">
      <div className="spa-container spa-header-inner">
        <Link href="/" className="spa-brand" aria-label="Aura Spa home">
          <img src="/images/AuraLogo.png" alt="Aura Spa" className="spa-brand-logo" />
        </Link>

        <nav className="spa-nav" aria-label="Main navigation">
          <ul>
            {content.header.nav.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href={content.header.ctaHref} className="spa-button spa-button-primary spa-button-small">
          {content.header.ctaLabel}
        </Link>
      </div>
    </header>
  );
}

export function Hero({ content }: HomePageProps) {
  return (
    <section className="spa-hero" style={{ backgroundImage: "url('/images/AuraBG.jpg')" }}>
      <div className="spa-light-beam" aria-hidden="true" />
      <div className="spa-smoke-layer" aria-hidden="true">
        <span className="spa-smoke smoke-main" />
        <span className="spa-smoke smoke-secondary" />
        <span className="spa-smoke smoke-tertiary" />
      </div>

      <div className="spa-container spa-hero-grid">
        <div className="spa-hero-copy">
          <p className="spa-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.headline}</h1>
          <p className="spa-hero-subheadline">{content.hero.subheadline}</p>
          <div className="spa-button-row">
            <Link href={content.hero.primaryButtonUrl} className="spa-button spa-button-primary">
              {content.hero.primaryButtonLabel}
            </Link>
            <Link href={content.hero.secondaryButtonUrl} className="spa-button spa-button-secondary">
              {content.hero.secondaryButtonLabel}
            </Link>
            <a href={content.hero.tertiaryButtonUrl} className="spa-button spa-button-policy" target="_blank" rel="noreferrer">
              {content.hero.tertiaryButtonLabel}
            </a>
          </div>
        </div>

        <div className="spa-hero-visual">
          <img src={content.hero.imageUrl} alt={content.hero.headline} className="spa-hero-image" />
          <div className="spa-floating-badge">
            <strong>{content.hero.badgeTitle}</strong>
            <span>{content.hero.badgeSubtitle}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandIntro({ content }: HomePageProps) {
  return (
    <section id="about" className="spa-section">
      <div className="spa-container spa-split">
        <div className="spa-story-copy">
          <p className="spa-eyebrow">{content.intro.eyebrow}</p>
          <h2>{content.intro.heading}</h2>
          <p>{content.intro.paragraphOne}</p>
          <p>{content.intro.paragraphTwo}</p>
        </div>

        <div className="spa-story-media">
          <img src={content.intro.imageUrl} alt={content.intro.heading} />
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({ content }: HomePageProps) {
  return (
    <section className="spa-section spa-section-soft" id="therapy">
      <div className="spa-container">
        <div className="spa-section-heading">
          <p className="spa-eyebrow">{content.features.eyebrow}</p>
          <h2>{content.features.heading}</h2>
          <p>{content.features.intro}</p>
        </div>

        <div className="spa-grid-3">
          {content.features.items.map((feature) => (
            <article key={feature.title} className="spa-feature-card">
              <div className="spa-feature-media">
                <img src={feature.imageUrl} alt={feature.title} />
              </div>
              <div className="spa-feature-body">
                <div className="spa-feature-icon" aria-hidden="true">
                  <span />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesGrid({ content }: HomePageProps) {
  return (
    <section id="services" className="spa-section">
      <div className="spa-container">
        <div className="spa-section-heading">
          <p className="spa-eyebrow">{content.services.eyebrow}</p>
          <h2>{content.services.heading}</h2>
        </div>

        <div className="spa-service-grid">
          {content.services.items.map((service) => (
            <article key={service.title} className="spa-service-card">
              <div className="spa-service-media">
                <img src={service.imageUrl} alt={service.title} />
              </div>
              <div className="spa-service-body">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link href={service.buttonUrl} className="spa-inline-link">
                  {service.buttonLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TreatmentsGrid({ content }: HomePageProps) {
  return (
    <section id="treatments" className="spa-section spa-section-soft">
      <div className="spa-container">
        <div className="spa-section-heading">
          <p className="spa-eyebrow">{content.treatments.eyebrow}</p>
          <h2>{content.treatments.heading}</h2>
        </div>

        <div className="spa-treatment-grid">
          {content.treatments.items.map((treatment) => (
            <article key={treatment.title} className="spa-treatment-card">
              <div className="spa-treatment-meta">
                <span className="spa-treatment-topline">{treatment.duration}</span>
                <span className="spa-treatment-price">{treatment.price}</span>
              </div>
              <h3>{treatment.title}</h3>
              <p>{treatment.description}</p>
              <Link href={treatment.buttonUrl} className="spa-button spa-button-secondary">
                {treatment.buttonLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsBlock({ content }: HomePageProps) {
  return (
    <section id="why-us" className="spa-section spa-benefits-panel">
      <div className="spa-container">
        <div className="spa-section-heading spa-section-heading-center">
          <p className="spa-eyebrow">{content.benefits.eyebrow}</p>
          <h2>{content.benefits.heading}</h2>
        </div>

        <div className="spa-benefit-grid">
          {content.benefits.items.map((benefit) => (
            <div key={benefit} className="spa-benefit-item">
              <span className="spa-check" aria-hidden="true">
                ✓
              </span>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GiftVoucherBlock({ content }: HomePageProps) {
  return (
    <section id="gift-vouchers" className="spa-section spa-section-soft">
      <div className="spa-container spa-gift-grid">
        <div className="spa-gift-visual">
          <img src={content.giftVoucher.imageUrl} alt={content.giftVoucher.heading} />
        </div>
        <div className="spa-gift-copy">
          <p className="spa-eyebrow">{content.giftVoucher.eyebrow}</p>
          <h2>{content.giftVoucher.heading}</h2>
          <p>{content.giftVoucher.body}</p>
          <Link href={content.giftVoucher.buttonUrl} className="spa-button spa-button-primary">
            {content.giftVoucher.buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function OfferList({ content }: HomePageProps) {
  return (
    <section id="offers" className="spa-section">
      <div className="spa-container">
        <div className="spa-section-heading">
          <p className="spa-eyebrow">{content.offers.eyebrow}</p>
          <h2>{content.offers.heading}</h2>
        </div>

        <div className="spa-offer-list">
          {content.offers.items.map((offer, index) => (
            <div key={offer} className="spa-offer-item">
              <span className="spa-offer-index">0{index + 1}</span>
              <p>{offer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CorporateWellbeing({ content }: HomePageProps) {
  return (
    <section id="wellbeing" className="spa-section spa-section-soft">
      <div className="spa-container spa-corporate-grid">
        <div>
          <p className="spa-eyebrow">{content.corporateWellbeing.eyebrow}</p>
          <h2>{content.corporateWellbeing.heading}</h2>
          <p>{content.corporateWellbeing.body}</p>
        </div>

        <div className="spa-corporate-list">
          {content.corporateWellbeing.items.map((item) => (
            <div key={item} className="spa-corporate-item">
              <span aria-hidden="true">•</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialGrid({ content }: HomePageProps) {
  return (
    <section id="testimonials" className="spa-section">
      <div className="spa-container">
        <div className="spa-section-heading spa-section-heading-center">
          <p className="spa-eyebrow">{content.testimonials.eyebrow}</p>
          <h2>{content.testimonials.heading}</h2>
        </div>

        <div className="spa-testimonial-grid">
          {content.testimonials.items.map((testimonial, index) => (
            <article key={`${testimonial.author}-${index}`} className="spa-testimonial-card">
              <div className="spa-quote-mark" aria-hidden="true">
                “
              </div>
              <p>{testimonial.quote}</p>
              <div className="spa-testimonial-author">
                <span>{testimonial.author}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA({ content }: HomePageProps) {
  return (
    <section className="spa-section spa-final-cta">
      <div className="spa-container">
        <div className="spa-cta-banner">
          <div>
            <p className="spa-eyebrow">{content.finalCta.eyebrow}</p>
            <h2>{content.finalCta.headline}</h2>
          </div>
          <p>{content.finalCta.body}</p>
          <Link href={content.finalCta.buttonUrl} className="spa-button spa-button-primary">
            {content.finalCta.buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer({ content }: HomePageProps) {
  const contactItems = [
    {
      href: `mailto:${content.footer.contactEmail}`,
      label: content.footer.contactEmail,
      Icon: Mail,
    },
    {
      href: `tel:${content.footer.contactPhone.replace(/\s+/g, "")}`,
      label: content.footer.contactPhone,
      Icon: Phone,
    },
    {
      href: "https://wa.me/27671832446",
      label: "WhatsApp: +27 671 832 446",
      Icon: MessageCircle,
      external: true,
    },
    {
      href: "https://www.instagram.com/aura_spa_rustenburg",
      label: "Instagram: @aura_spa_rustenburg",
      Icon: Camera,
      external: true,
    },
  ];

  return (
    <footer id="contact" className="spa-footer">
      <div className="spa-container spa-footer-grid">
        <div className="spa-footer-brand-block">
          <div className="spa-brand spa-brand-footer">
            <img src="/images/AuraLogo.png" alt="Aura Spa" className="spa-brand-logo spa-brand-logo-footer" />
          </div>
          <p>{content.footer.tagline}</p>
          <div className="spa-footer-address">
            <MapPin aria-hidden="true" className="spa-contact-icon" />
            <span>King&apos;s Palace Hotel, Donkerhoek Road, Rustenburg</span>
          </div>
        </div>

        <div>
          <h3>Quick Links</h3>
          <ul>
            {content.footer.quickLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Contact</h3>
          <ul className="spa-contact-list">
            {contactItems.map(({ href, label, Icon, external }) => (
              <li key={label}>
                <a href={href} rel={external ? "noreferrer" : undefined} target={external ? "_blank" : undefined}>
                  <span className="spa-contact-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Follow Us</h3>
          <ul>
            {content.footer.socialLinks.map((item) => (
              <li key={item}>
                <span className="spa-contact-icon">
                  <Camera aria-hidden="true" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

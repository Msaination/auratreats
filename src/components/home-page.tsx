import Link from "next/link";
import { MapPin } from "lucide-react";
import { ExperienceSlider, MobileNavigation } from "@/components/homepage-interactions";
import type { HomePageContent } from "@/lib/home-page";

type HomePageProps = {
  content: HomePageContent;
};

export function Header() {
  return (
    <div className="site-header">
      <Link href="/" className="brand" aria-label="Aura Spa home">
        <img src="/images/AuraLogo.png" alt="Aura Spa" />
      </Link>
      <MobileNavigation />
    </div>
  );
}

export function Hero() {
  return (
    <header
      className="hero"
      id="home"
      style={{ backgroundImage: "url('/images/AuraBG.jpg')" }}
    >
      <Header />
      <div className="hero-inner">
        <p className="kicker">Relax . Restore . Rejuvenate</p>
        <h1>Aura Spa</h1>
        <p className="hero-copy">Escape the demands of everyday life and immerse yourself in a sanctuary where wellness, beauty and relaxation come together.</p>
        <p className="location-line">
          <a href="https://www.google.com/maps/search/?api=1&query=King%27s%20Palace%20Hotel%2C%20Donkerhoek%20Road%2C%20Rustenburg%2C%20South%20Africa" target="_blank" rel="noopener noreferrer">
            <MapPin aria-hidden="true" />
            <span>King’s Palace Hotel · Rustenburg</span>
          </a>
        </p>
        <div className="hero-actions">
          <Link href="/book" className="button button-primary">Book your escape</Link>
          <div className="hero-action-links">
            <a className="button button-secondary" href="#experience">Discover Aura</a>
            <a className="button button-secondary" href="/documents/Aura-Menu-2026-WA.pdf" download="Aura-Menu-2026-WA.pdf">Price List</a>
            <a className="button button-secondary" href="/documents/Aura-Policy.pdf" target="_blank" rel="noreferrer">SPA ETIQUETTE &amp; GUEST POLICY</a>
            <a className="button button-secondary" href="#payment">Pay via EFT</a>
          </div>
        </div>
      </div>
    </header>
  );
}

export function BrandIntro() {
  return (
    <section className="section" id="welcome" aria-labelledby="welcome-heading">
      <div className="wrap welcome-layout">
        <div className="reveal">
          <p className="section-label">Welcome to Aura Spa</p>
          <h2 className="display-heading" id="welcome-heading">Space to slow down, reconnect and simply breathe.</h2>
          <div className="welcome-copy">
            <p>Designed with timeless elegance and inspired by the calming essence of nature, Aura Spa offers thoughtfully curated wellness experiences that restore balance, nurture confidence and awaken the senses.</p>
            <p>Every experience is delivered with exceptional care in a tranquil environment that encourages you to slow down, reconnect and simply breathe.</p>
            <p>Whether you’re visiting for an hour of self-care or a full day of indulgence, every detail has been carefully considered to leave you feeling refreshed, uplifted and already looking forward to your next visit.</p>
          </div>
        </div>
        <aside className="welcome-aside reveal" aria-label="Aura Spa location">
          <strong>Your quiet place.</strong>
          <span>King’s Palace Hotel<br />Donkerhoek Road, Rustenburg</span>
        </aside>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  return (
    <section className="section experience" id="experience" aria-labelledby="experience-heading">
      <div className="experience-layout">
        <div className="experience-copy">
          <p className="section-label">The Aura Experience</p>
          <h2 className="display-heading" id="experience-heading">Wellness begins with the senses.</h2>
          <h3>Sensory Wellness Therapy</h3>
          <p>Before your treatment begins, you’ll be invited to choose your preferred aroma from our signature collection of therapeutic oils. As calming fragrances fill the room, gentle touch, mindful rituals and a serene atmosphere work together to release tension, quiet the mind and restore balance.</p>
          <p>More than just a treatment, this is a complete sensory experience designed to nurture both body and soul, leaving you feeling renewed long after your visit.</p>
          <div className="ritual-note"><span className="ritual-number">01</span><span>Choose your aroma<br />Begin your ritual</span></div>
        </div>
        <ExperienceSlider />
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
  const offerings = [
    {
      theme: "gift",
      topline: "Give Aura",
      number: "01",
      title: "Gift Vouchers",
      description: "Give the gift of relaxation with beautifully presented digital or printed gift vouchers.",
      items: ["Birthday", "Anniversary", "Bridal", "Baby Shower", "Thank You", "Corporate Appreciation", "Festive Season", "Choose Your Own Amount"],
      label: "Choose a voucher",
      href: "/book",
    },
    {
      theme: "seasonal",
      topline: "Limited rituals",
      number: "02",
      title: "Seasonal Indulgence",
      description: "Discover exclusive monthly experiences and limited-time wellness offers designed around the seasons.",
      items: content.offers.items,
      label: "View current offers",
      href: "/book",
    },
    {
      theme: "corporate",
      topline: "Wellbeing at work",
      number: "03",
      title: "Corporate Wellness",
      description: "Invest in your team’s wellbeing with tailored wellness experiences.",
      items: ["Conference Wellness Breaks", "Team Appreciation Experiences", "Employee Wellness Days", "Corporate Gift Vouchers", "Private Group Bookings"],
      label: "Plan a team experience",
      href: "mailto:bookings@auraretreat.co.za?subject=Corporate%20Wellness%20Enquiry",
    },
  ];

  return (
    <section id="offerings" className="spa-section spa-offerings">
      <div className="spa-container">
        <div className="spa-offerings-heading">
          <div>
            <p className="section-label">{content.giftVoucher.eyebrow}</p>
            <h2 className="display-heading">{content.giftVoucher.heading}</h2>
          </div>
          <p className="section-intro">{content.giftVoucher.body}</p>
        </div>
        <div className="spa-offering-grid">
          {offerings.map((offering) => (
            <article className={`offer offer--${offering.theme} reveal`} key={offering.number}>
              <div className="offer-topline"><span>{offering.topline}</span><span className="offer-index">{offering.number}</span></div>
              <h3>{offering.title}</h3>
              <div>
                <p>{offering.description}</p>
                <ul className="text-list">{offering.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <a className="offer-action" href={offering.href}><span>{offering.label}</span><span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
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
    <section className="section events" id="events">
      <div className="wrap events-layout">
        <div className="reveal">
          <p className="section-label">Gather at Aura</p>
          <h2 className="display-heading">Celebrate life’s special moments.</h2>
          <p className="section-intro">Share an atmosphere of luxury, ease and relaxation with the people closest to you.</p>
        </div>
        <ul className="event-list reveal">{["Bridal Spa Parties", "Baby Showers", "Birthday Celebrations", "Couples Experiences", "Ladies’ Pamper Days", "Wellness Gatherings", "Corporate Wellness Events", "Kids’ Spa Parties"].map((event) => <li key={event}>{event}</li>)}</ul>
      </div>
    </section>
  );
}

export function ContactPayment() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-heading">
      <div className="wrap reveal">
        <p className="section-label">Make space for yourself</p>
        <h2 className="display-heading" id="contact-heading">Your Aura experience awaits.</h2>
        <p className="contact-copy">Visit us at King’s Palace Hotel in Rustenburg. Connect with our team to book a treatment, arrange a group experience or select the perfect gift voucher.</p>
        <div className="payment-details" id="payment">
          <h3>Pay via EFT</h3>
          <dl className="bank-details">
            <dt>Account name</dt><dd>Aura Spa</dd>
            <dt>Bank</dt><dd>FNB</dd>
            <dt>Account number</dt><dd>63218435089</dd>
            <dt>Branch code</dt><dd>202009</dd>
          </dl>
          <p className="payment-note">Please use your name as the payment reference and send proof of payment when booking.</p>
        </div>
        <div className="button-row">
          <a className="button button-primary" href="https://wa.me/27671832446?text=Hello%20Aura%20Spa%2C%20I%27d%20like%20to%20make%20a%20booking." target="_blank" rel="noreferrer">WhatsApp Aura</a>
          <a className="button button-secondary" href="mailto:bookings@auraretreat.co.za">Send an email</a>
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
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" aria-label="Aura Spa home">
            <img src="/images/AuraLogo.png" alt="Aura Spa" width="96" height="70" />
          </Link>
        </div>
        <div className="footer-details">
          <a href="https://www.google.com/maps/search/?api=1&query=King%27s%20Palace%20Hotel%2C%20Donkerhoek%20Road%2C%20Rustenburg%2C%20South%20Africa" target="_blank" rel="noreferrer">King’s Palace Hotel, Donkerhoek Road, Rustenburg</a>
          <a href={`tel:${content.footer.contactPhone.replace(/\s+/g, "")}`}>{content.footer.contactPhone}</a>
          <a href={`mailto:${content.footer.contactEmail}`}>{content.footer.contactEmail}</a>
          <a href="https://www.instagram.com/aura_spa_rustenburg?igsh=bml5ZmdhcDU1Njhm" target="_blank" rel="noreferrer">Instagram</a>
        </div>
        <span className="copyright">© {new Date().getFullYear()} Aura Spa</span>
      </div>
    </footer>
  );
}

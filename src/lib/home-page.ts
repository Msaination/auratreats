import { getServiceCatalog, type LatePointService } from "./latepoint";
import { wordpressQuery } from "./wordpress";

export type NavItem = {
  label: string;
  href: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  imageUrl: string;
};

export type ServiceItem = {
  title: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
};

export type TreatmentItem = {
  title: string;
  duration: string;
  price: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
};

export type TestimonialItem = {
  quote: string;
  author: string;
};

export type HomePageContent = {
  header: {
    nav: NavItem[];
    ctaLabel: string;
    ctaHref: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryButtonLabel: string;
    primaryButtonUrl: string;
    secondaryButtonLabel: string;
    secondaryButtonUrl: string;
    tertiaryButtonLabel: string;
    tertiaryButtonUrl: string;
    imageUrl: string;
    badgeTitle: string;
    badgeSubtitle: string;
  };
  intro: {
    eyebrow: string;
    heading: string;
    paragraphOne: string;
    paragraphTwo: string;
    imageUrl: string;
  };
  features: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: FeatureItem[];
  };
  services: {
    eyebrow: string;
    heading: string;
    items: ServiceItem[];
  };
  treatments: {
    eyebrow: string;
    heading: string;
    items: TreatmentItem[];
  };
  benefits: {
    eyebrow: string;
    heading: string;
    items: string[];
  };
  giftVoucher: {
    eyebrow: string;
    heading: string;
    body: string;
    buttonLabel: string;
    buttonUrl: string;
    imageUrl: string;
  };
  offers: {
    eyebrow: string;
    heading: string;
    items: string[];
  };
  corporateWellbeing: {
    eyebrow: string;
    heading: string;
    body: string;
    items: string[];
  };
  testimonials: {
    eyebrow: string;
    heading: string;
    items: TestimonialItem[];
  };
  finalCta: {
    eyebrow: string;
    headline: string;
    body: string;
    buttonLabel: string;
    buttonUrl: string;
  };
  footer: {
    tagline: string;
    quickLinks: NavItem[];
    contactEmail: string;
    contactPhone: string;
    socialLinks: string[];
  };
};

export const defaultHomePageContent: HomePageContent = {
  header: {
    nav: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "#gift-vouchers" },
      { label: "Book Appointment", href: "/book" },
      { label: "Gift Cards", href: "#gift-vouchers" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
    ctaLabel: "Book Appointment",
    ctaHref: "/book",
  },
  hero: {
    eyebrow: "# Your Perfect Sanctuary Awaits",
    headline: "Book Your Next Treatment",
    subheadline:
      "Relax, recharge, and restore with a luxurious wellness experience designed around you.",
    primaryButtonLabel: "Book Appointment",
    primaryButtonUrl: "/book",
    secondaryButtonLabel: "Buy a Gift Voucher",
    secondaryButtonUrl: "#gift-vouchers",
    tertiaryButtonLabel: "Aura Etiquettes and Policy",
    tertiaryButtonUrl: "/documents/AuraPolicyv1.1.0.pdf",
    imageUrl: "/images/AuraBG.jpg",
    badgeTitle: "Luxury spa treatments",
    badgeSubtitle: "Book online in minutes",
  },
  intro: {
    eyebrow: "The Aura Experience",
    heading: "Slow down. Settle in. Feel restored.",
    paragraphOne:
      "At Aura Spa, every visit is designed to slow the pace, awaken the senses, and restore balance.",
    paragraphTwo:
      "From the moment you arrive, you are welcomed into a calm, refined environment where thoughtful rituals, expert care, and sensory wellness come together.",
    imageUrl: "/images/AuraCerum.jpg",
  },
  features: {
    eyebrow: "Sensory Wellness Therapy",
    heading: "Every treatment begins with your preferred aroma.",
    intro: "Every treatment begins with your preferred aroma from our signature collection of therapeutic oils.",
    items: [
      {
        title: "Atmosphere",
        description: "A tranquil environment designed to quiet the senses.",
        imageUrl: "/images/47.jpg",
      },
      {
        title: "Care",
        description: "Personalised touch, mindful rituals, and exceptional service.",
        imageUrl: "/images/285.jpg",
      },
      {
        title: "Outcome",
        description: "Refreshed, uplifted, and ready for your next reset.",
        imageUrl: "/images/41.jpg",
      },
    ],
  },
  services: {
    eyebrow: "Wellness rituals",
    heading: "Explore Our Services",
    items: [
      {
        title: "Massage",
        description: "Whole-body rituals for tension release, recovery, and deep calm.",
        imageUrl: "/images/47.jpg",
        buttonLabel: "View Services",
        buttonUrl: "/book",
      },
      {
        title: "Facials",
        description: "Targeted skin rituals that brighten, smooth, and renew.",
        imageUrl: "/images/285.jpg",
        buttonLabel: "View Services",
        buttonUrl: "/book",
      },
      {
        title: "Waxing",
        description: "Tailored grooming and polish for a confident, refined finish.",
        imageUrl: "/images/43.jpg",
        buttonLabel: "View Services",
        buttonUrl: "/book",
      },
      {
        title: "Nails",
        description: "Precision styling, finishing touches, and a glossy elevate.",
        imageUrl: "/images/41.jpg",
        buttonLabel: "View Services",
        buttonUrl: "/book",
      },
      {
        title: "Mini Me Collection",
        description: "Little moments of luxury designed for children and families.",
        imageUrl: "/images/24.jpg",
        buttonLabel: "View Services",
        buttonUrl: "/book",
      },
    ],
  },
  treatments: {
    eyebrow: "Most loved",
    heading: "Popular Treatments",
    items: [
      {
        title: "Swedish Massage",
        duration: "60 min",
        price: "From R890",
        description: "classic full-body relaxation",
        buttonLabel: "Book Now",
        buttonUrl: "/book",
      },
      {
        title: "Dermaplaning",
        duration: "45–60 min",
        price: "From R620",
        description: "smoothing and skin renewal",
        buttonLabel: "Book Now",
        buttonUrl: "/book",
      },
      {
        title: "Brow + Lip",
        duration: "20 min",
        price: "From R420",
        description: "quick polish and refinement",
        buttonLabel: "Book Now",
        buttonUrl: "/book",
      },
      {
        title: "Deluxe Mani",
        duration: "45 min",
        price: "From R480",
        description: "complete polished manicure experience",
        buttonLabel: "Book Now",
        buttonUrl: "/book",
      },
    ],
  },
  benefits: {
    eyebrow: "Why Aura",
    heading: "Why Choose Aura Spa?",
    items: [
      "Expert therapists",
      "Calm, welcoming atmosphere",
      "Flexible booking",
      "Premium care",
    ],
  },
  giftVoucher: {
    eyebrow: "Thoughtful gifting",
    heading: "Give the Gift of Relaxation",
    body: "Share a moment of calm, luxury, and self-care with a thoughtfully chosen Aura Spa gift voucher.",
    buttonLabel: "Shop Gift Vouchers",
    buttonUrl: "#gift-vouchers",
    imageUrl: "/images/92.jpg",
  },
  offers: {
    eyebrow: "Seasonal indulgence",
    heading: "Seasonal Indulgence",
    items: [
      "Monthly Spa Specials",
      "Winter Warmth Collection",
      "Spring Renewal",
      "Mother’s Day Packages",
      "Women’s Month Experiences",
      "Valentine’s Escapes",
      "Festive Retreats",
    ],
  },
  corporateWellbeing: {
    eyebrow: "Corporate wellness",
    heading: "Invest in Your Team’s Wellbeing",
    body: "Create a healthier, happier workplace with tailored wellness experiences that support staff wellbeing and morale.",
    items: [
      "Conference Wellness Breaks",
      "Team Appreciation Experiences",
      "Employee Wellness Days",
      "Corporate Gift Vouchers",
      "Private Group Bookings",
    ],
  },
  testimonials: {
    eyebrow: "Client feedback",
    heading: "What Our Clients Say",
    items: [
      {
        quote:
          "The atmosphere is beautiful and the service is exceptional. I always leave feeling relaxed and refreshed.",
        author: "Cementime Mariba",
      },
      {
        quote:
          "My facial was exactly what I needed. The team was professional, warm, and knowledgeable.",
        author: "Violet Monareng",
      },
      {
        quote:
          "Booking was easy and the treatment was amazing. Highly recommend the Swedish massage.",
        author: "Muzi Omphile",
      },
    ],
  },
  finalCta: {
    eyebrow: "Ready when you are",
    headline: "Ready to feel renewed?",
    body: "Book your next treatment and step into a calmer, more balanced version of you.",
    buttonLabel: "Book Appointment",
    buttonUrl: "/book",
  },
  footer: {
    tagline: "Luxury rituals, mindful care, and restorative wellness experiences.",
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "#gift-vouchers" },
      { label: "Book Appointment", href: "/book" },
      { label: "Gift Cards", href: "#gift-vouchers" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
    contactEmail: "bookings@auraretreat.co.za",
    contactPhone: "+27 (10) 109 0947",
    socialLinks: ["Instagram: @aura_spa_rustenburg"],
  },
};

export const HOME_PAGE_QUERY = `
  query HomePage {
    page(id: "/home", idType: URI) {
      title
      homeHeader {
        navItems {
          label
          href
        }
        ctaLabel
        ctaHref
      }
      homeHero {
        eyebrow
        headline
        subheadline
        primaryButtonLabel
        primaryButtonUrl
        secondaryButtonLabel
        secondaryButtonUrl
        image {
          sourceUrl
        }
        badgeTitle
        badgeSubtitle
      }
      homeIntro {
        eyebrow
        heading
        paragraphOne
        paragraphTwo
        image {
          sourceUrl
        }
      }
      homeFeatures {
        title
        description
      }
      homeServices {
        title
        description
        buttonLabel
        buttonUrl
      }
      homeTreatments {
        title
        duration
        description
        buttonLabel
        buttonUrl
      }
      homeBenefits {
        item
      }
      homeGiftVoucher {
        eyebrow
        heading
        body
        buttonLabel
        buttonUrl
        image {
          sourceUrl
        }
      }
      seasonalOffers {
        item
      }
      corporateWellbeing {
        eyebrow
        heading
        body
        items {
          item
        }
      }
      homeTestimonials {
        quote
        author
      }
      homeCta {
        eyebrow
        headline
        body
        buttonLabel
        buttonUrl
      }
      homeFooter {
        tagline
        contactEmail
        contactPhone
        socialLinks {
          label
          href
        }
      }
    }
  }
`;

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value.filter(Boolean) as T[] : fallback;
}

function mapNavItems(value: unknown, fallback: NavItem[]): NavItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const navItem = item as { label?: unknown; href?: unknown };
      const label = readString(navItem.label, "");
      const href = readString(navItem.href, "/");
      const normalizedHref =
        label.toLowerCase() === "contact" || href === "/contact" || href.endsWith("/contact")
          ? "#contact"
          : href;

      return {
        label,
        href: normalizedHref,
      };
    })
    .filter((item): item is NavItem => Boolean(item && item.label));
}

function mapFeatureItems(value: unknown, fallback: FeatureItem[]): FeatureItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const feature = item as { title?: unknown; description?: unknown; imageUrl?: unknown };
      return {
        title: readString(feature.title, "Untitled feature"),
        description: readString(feature.description, ""),
        imageUrl: readString(feature.imageUrl, "/images/AuraCerum.jpg"),
      };
    })
    .filter((item): item is FeatureItem => Boolean(item && item.title));
}

function mapTreatmentItems(value: unknown, fallback: TreatmentItem[]): TreatmentItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const treatment = item as {
        title?: unknown;
        duration?: unknown;
        price?: unknown;
        description?: unknown;
        buttonLabel?: unknown;
        buttonUrl?: unknown;
      };

      return {
        title: readString(treatment.title, "Treatment"),
        duration: readString(treatment.duration, "45 min"),
        price: readString(treatment.price, "From R0"),
        description: readString(treatment.description, ""),
        buttonLabel: readString(treatment.buttonLabel, "Book Now"),
        buttonUrl: readString(treatment.buttonUrl, "/book"),
      };
    })
    .filter((item): item is TreatmentItem => Boolean(item && item.title));
}

function formatLatePointTreatmentPrice(service: LatePointService): string {
  if (service.price.amount <= 0) {
    return "Price varies";
  }

  return service.price.isVariable ? `From ${service.price.formatted}` : service.price.formatted;
}

function formatLatePointTreatmentDuration(service: LatePointService): string {
  const preferredDuration = service.durations?.[0];

  if (preferredDuration?.name?.trim()) {
    return preferredDuration.name.trim();
  }

  if (service.durationMinutes > 0) {
    return `${service.durationMinutes} min`;
  }

  return "Flexible";
}

function mapLatePointTreatments(catalog: { categories?: Array<{ services?: LatePointService[] }> } | null): TreatmentItem[] {
  if (!catalog || !Array.isArray(catalog.categories)) {
    return [];
  }

  return catalog.categories
    .flatMap((category) => category.services ?? [])
    .filter((service): service is LatePointService => Boolean(service && typeof service.name === "string" && service.name.trim()))
    .slice(0, 4)
    .map((service) => ({
      title: service.name,
      duration: formatLatePointTreatmentDuration(service),
      price: formatLatePointTreatmentPrice(service),
      description: service.shortDescription || "Luxury spa treatment experience.",
      buttonLabel: "Book Now",
      buttonUrl: "/book",
    }));
}

function mapTestimonialItems(value: unknown, fallback: TestimonialItem[]): TestimonialItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const testimonial = item as { quote?: unknown; author?: unknown };

      return {
        quote: readString(testimonial.quote, ""),
        author: readString(testimonial.author, "Client"),
      };
    })
    .filter((item): item is TestimonialItem => Boolean(item && item.quote));
}

export async function loadHomePageContent(): Promise<HomePageContent> {
  try {
    const [wpResult, latePointCatalog] = await Promise.all([
      wordpressQuery<{ page?: any }>(HOME_PAGE_QUERY).catch(() => ({ page: null })),
      getServiceCatalog().catch(() => null),
    ]);
    const page = wpResult.page;
    const latePointTreatments = mapLatePointTreatments(latePointCatalog);

    if (!page) {
      return {
        ...defaultHomePageContent,
        treatments: {
          ...defaultHomePageContent.treatments,
          items:
            latePointTreatments.length > 0
              ? latePointTreatments
              : defaultHomePageContent.treatments.items,
        },
      };
    }

    const hero = page.homeHero ?? {};
    const intro = page.homeIntro ?? {};
    const features = page.homeFeatures ?? [];
    const services = page.homeServices ?? [];
    const treatments = page.popularTreatments ?? page.homeTreatments ?? [];
    const testimonials = page.homeTestimonials ?? [];
    const footer = page.homeFooter ?? {};

    return {
      header: {
        nav: mapNavItems(page.homeHeader?.navItems, defaultHomePageContent.header.nav),
        ctaLabel: readString(page.homeHeader?.ctaLabel, defaultHomePageContent.header.ctaLabel),
        ctaHref: readString(page.homeHeader?.ctaHref, defaultHomePageContent.header.ctaHref),
      },
      hero: {
        eyebrow: readString(hero.eyebrow, defaultHomePageContent.hero.eyebrow),
        headline: readString(hero.headline, defaultHomePageContent.hero.headline),
        subheadline: readString(hero.subheadline, defaultHomePageContent.hero.subheadline),
        primaryButtonLabel: readString(
          hero.primaryButtonLabel,
          defaultHomePageContent.hero.primaryButtonLabel,
        ),
        primaryButtonUrl: readString(
          hero.primaryButtonUrl,
          defaultHomePageContent.hero.primaryButtonUrl,
        ),
        secondaryButtonLabel: readString(
          hero.secondaryButtonLabel,
          defaultHomePageContent.hero.secondaryButtonLabel,
        ),
        secondaryButtonUrl: readString(
          hero.secondaryButtonUrl,
          defaultHomePageContent.hero.secondaryButtonUrl,
        ),
        tertiaryButtonLabel: readString(
          hero.tertiaryButtonLabel,
          defaultHomePageContent.hero.tertiaryButtonLabel,
        ),
        tertiaryButtonUrl: readString(
          hero.tertiaryButtonUrl,
          defaultHomePageContent.hero.tertiaryButtonUrl,
        ),
        imageUrl: readString(hero.image?.sourceUrl, defaultHomePageContent.hero.imageUrl),
        badgeTitle: readString(hero.badgeTitle, defaultHomePageContent.hero.badgeTitle),
        badgeSubtitle: readString(hero.badgeSubtitle, defaultHomePageContent.hero.badgeSubtitle),
      },
      intro: {
        eyebrow: readString(intro.eyebrow, defaultHomePageContent.intro.eyebrow),
        heading: readString(intro.heading, defaultHomePageContent.intro.heading),
        paragraphOne: readString(intro.paragraphOne, defaultHomePageContent.intro.paragraphOne),
        paragraphTwo: readString(intro.paragraphTwo, defaultHomePageContent.intro.paragraphTwo),
        imageUrl: readString(intro.image?.sourceUrl, defaultHomePageContent.intro.imageUrl),
      },
      features: {
        eyebrow: readString(page.homeFeatures?.eyebrow, defaultHomePageContent.features.eyebrow),
        heading: readString(page.homeFeatures?.heading, defaultHomePageContent.features.heading),
        intro: readString(page.homeFeatures?.intro, defaultHomePageContent.features.intro),
        items: mapFeatureItems(features, defaultHomePageContent.features.items),
      },
      services: {
        eyebrow: readString(page.homeServices?.eyebrow, defaultHomePageContent.services.eyebrow),
        heading: readString(page.homeServices?.heading, defaultHomePageContent.services.heading),
        items: (Array.isArray(services) ? services : defaultHomePageContent.services.items)
          .map((item: any) => ({
            title: readString(item?.title, "Service"),
            description: readString(item?.description, ""),
            imageUrl: readString(item?.imageUrl, "/images/AuraCerum.jpg"),
            buttonLabel: readString(item?.buttonLabel, "View Services"),
            buttonUrl: readString(item?.buttonUrl, "/book"),
          })),
      },
      treatments: {
        eyebrow: readString(page.homeTreatments?.eyebrow, defaultHomePageContent.treatments.eyebrow),
        heading: readString(page.homeTreatments?.heading, defaultHomePageContent.treatments.heading),
        items: mapTreatmentItems(
          treatments,
          latePointTreatments.length > 0 ? latePointTreatments : defaultHomePageContent.treatments.items,
        ),
      },
      benefits: {
        eyebrow: readString(page.homeBenefits?.eyebrow, defaultHomePageContent.benefits.eyebrow),
        heading: readString(page.homeBenefits?.heading, defaultHomePageContent.benefits.heading),
        items: readArray<string>(page.homeBenefits?.items ?? page.homeBenefits, defaultHomePageContent.benefits.items),
      },
      giftVoucher: {
        eyebrow: readString(page.homeGiftVoucher?.eyebrow, defaultHomePageContent.giftVoucher.eyebrow),
        heading: readString(page.homeGiftVoucher?.heading, defaultHomePageContent.giftVoucher.heading),
        body: readString(page.homeGiftVoucher?.body, defaultHomePageContent.giftVoucher.body),
        buttonLabel: readString(page.homeGiftVoucher?.buttonLabel, defaultHomePageContent.giftVoucher.buttonLabel),
        buttonUrl: readString(page.homeGiftVoucher?.buttonUrl, defaultHomePageContent.giftVoucher.buttonUrl),
        imageUrl: readString(
          page.homeGiftVoucher?.image?.sourceUrl,
          defaultHomePageContent.giftVoucher.imageUrl,
        ),
      },
      offers: {
        eyebrow: readString(page.seasonalOffers?.eyebrow, defaultHomePageContent.offers.eyebrow),
        heading: readString(page.seasonalOffers?.heading, defaultHomePageContent.offers.heading),
        items: readArray<string>(page.seasonalOffers?.items ?? page.seasonalOffers, defaultHomePageContent.offers.items),
      },
      corporateWellbeing: {
        eyebrow: readString(page.corporateWellbeing?.eyebrow, defaultHomePageContent.corporateWellbeing.eyebrow),
        heading: readString(page.corporateWellbeing?.heading, defaultHomePageContent.corporateWellbeing.heading),
        body: readString(page.corporateWellbeing?.body, defaultHomePageContent.corporateWellbeing.body),
        items: readArray<string>(page.corporateWellbeing?.items ?? page.corporateWellbeing, defaultHomePageContent.corporateWellbeing.items),
      },
      testimonials: {
        eyebrow: readString(page.homeTestimonials?.eyebrow, defaultHomePageContent.testimonials.eyebrow),
        heading: readString(page.homeTestimonials?.heading, defaultHomePageContent.testimonials.heading),
        items: mapTestimonialItems(testimonials, defaultHomePageContent.testimonials.items),
      },
      finalCta: {
        eyebrow: readString(page.homeCta?.eyebrow, defaultHomePageContent.finalCta.eyebrow),
        headline: readString(page.homeCta?.headline, defaultHomePageContent.finalCta.headline),
        body: readString(page.homeCta?.body, defaultHomePageContent.finalCta.body),
        buttonLabel: readString(page.homeCta?.buttonLabel, defaultHomePageContent.finalCta.buttonLabel),
        buttonUrl: readString(page.homeCta?.buttonUrl, defaultHomePageContent.finalCta.buttonUrl),
      },
      footer: {
        tagline: readString(footer.tagline, defaultHomePageContent.footer.tagline),
        quickLinks: mapNavItems(footer.quickLinks, defaultHomePageContent.footer.quickLinks),
        contactEmail: readString(footer.contactEmail, defaultHomePageContent.footer.contactEmail),
        contactPhone: readString(footer.contactPhone, defaultHomePageContent.footer.contactPhone),
        socialLinks: readArray<string>(footer.socialLinks, defaultHomePageContent.footer.socialLinks),
      },
    };
  } catch {
    return defaultHomePageContent;
  }
}

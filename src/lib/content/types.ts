import type { SiteContentKey } from "@/lib/content/keys";

export type HomepageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroCtaLabel: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  sectionTitle: string;
  buyingTitle: string;
  buyingText: string;
  sellingTitle: string;
  sellingText: string;
  appraisalsTitle: string;
  appraisalsText: string;
  footerNote: string;
};

export type AboutContent = {
  eyebrow: string;
  headline: string;
  bio: string;
  subheading: string;
  subBio: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  phone: string;
  email: string;
  ctaLabel: string;
};

export type ServicesContent = {
  heroTitle: string;
  heroDescription: string;
  appraisalTitle: string;
  appraisalBody: string;
  buyingTitle: string;
  buyingBody: string;
  sellingTitle: string;
  sellingBody: string;
};

export type ContactContent = {
  title: string;
  intro: string;
  sectionTitle: string;
  mobile: string;
  office: string;
  fax: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  facebookUrl: string;
  linkedinUrl: string;
};

export type FooterContent = {
  copyright: string;
  facebookUrl: string;
  linkedinUrl: string;
};

export type SiteContentPayloadMap = {
  homepage: HomepageContent;
  about: AboutContent;
  services: ServicesContent;
  contact: ContactContent;
  footer: FooterContent;
};

export type SiteContentPayload<K extends SiteContentKey = SiteContentKey> = SiteContentPayloadMap[K];

export type SiteContentRow<K extends SiteContentKey = SiteContentKey> = {
  pageKey: K;
  payload: SiteContentPayload<K>;
  updatedAt: string | null;
};

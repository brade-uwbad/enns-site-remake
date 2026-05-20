import { z } from "zod";

import { SITE_CONTENT_KEYS } from "@/lib/content/keys";

const optionalText = z.string().max(8000);

export const homepageContentSchema = z.object({
  heroEyebrow: optionalText,
  heroTitle: optionalText,
  heroDescription: optionalText,
  heroCtaLabel: optionalText,
  primaryCtaLabel: optionalText,
  secondaryCtaLabel: optionalText,
  sectionTitle: optionalText,
  buyingTitle: optionalText,
  buyingText: optionalText,
  sellingTitle: optionalText,
  sellingText: optionalText,
  appraisalsTitle: optionalText,
  appraisalsText: optionalText,
  footerNote: optionalText,
});

export const aboutContentSchema = z.object({
  eyebrow: optionalText,
  headline: optionalText,
  bio: optionalText,
  subheading: optionalText,
  subBio: optionalText,
  stat1Value: optionalText,
  stat1Label: optionalText,
  stat2Value: optionalText,
  stat2Label: optionalText,
  phone: optionalText,
  email: optionalText,
  ctaLabel: optionalText,
});

export const servicesContentSchema = z.object({
  heroTitle: optionalText,
  heroDescription: optionalText,
  appraisalTitle: optionalText,
  appraisalBody: optionalText,
  buyingTitle: optionalText,
  buyingBody: optionalText,
  sellingTitle: optionalText,
  sellingBody: optionalText,
});

export const contactContentSchema = z.object({
  title: optionalText,
  intro: optionalText,
  sectionTitle: optionalText,
  mobile: optionalText,
  office: optionalText,
  fax: optionalText,
  email: optionalText,
  addressLine1: optionalText,
  addressLine2: optionalText,
  facebookUrl: optionalText,
  linkedinUrl: optionalText,
});

export const footerContentSchema = z.object({
  copyright: optionalText,
  facebookUrl: optionalText,
  linkedinUrl: optionalText,
});

export const siteContentSchemas = {
  homepage: homepageContentSchema,
  about: aboutContentSchema,
  services: servicesContentSchema,
  contact: contactContentSchema,
  footer: footerContentSchema,
} as const;

export const siteContentKeySchema = z.enum(SITE_CONTENT_KEYS);

import type { SiteContentKey } from "@/lib/content/keys";

export type ContentEditorField = {
  name: string;
  label: string;
  multiline?: boolean;
};

export const SITE_CONTENT_EDITOR_FIELDS: Record<SiteContentKey, ContentEditorField[]> = {
  homepage: [
    { name: "heroEyebrow", label: "Hero eyebrow" },
    { name: "heroTitle", label: "Hero title" },
    { name: "heroDescription", label: "Hero description", multiline: true },
    { name: "heroCtaLabel", label: "Hero button label" },
    { name: "primaryCtaLabel", label: "Primary button label" },
    { name: "secondaryCtaLabel", label: "Secondary button label" },
    { name: "sectionTitle", label: "Services section title" },
    { name: "buyingTitle", label: "Buying card title" },
    { name: "buyingText", label: "Buying card text", multiline: true },
    { name: "sellingTitle", label: "Selling card title" },
    { name: "sellingText", label: "Selling card text", multiline: true },
    { name: "appraisalsTitle", label: "Appraisals card title" },
    { name: "appraisalsText", label: "Appraisals card text", multiline: true },
    { name: "footerNote", label: "Footer note", multiline: true },
  ],
  about: [
    { name: "eyebrow", label: "Eyebrow" },
    { name: "headline", label: "Headline" },
    { name: "bio", label: "Bio", multiline: true },
    { name: "subheading", label: "Subheading" },
    { name: "subBio", label: "Sub bio", multiline: true },
    { name: "stat1Value", label: "Stat 1 value" },
    { name: "stat1Label", label: "Stat 1 label" },
    { name: "stat2Value", label: "Stat 2 value" },
    { name: "stat2Label", label: "Stat 2 label" },
    { name: "phone", label: "Phone display" },
    { name: "email", label: "Email display" },
    { name: "ctaLabel", label: "CTA button label" },
  ],
  services: [
    { name: "heroTitle", label: "Page title" },
    { name: "heroDescription", label: "Intro", multiline: true },
    { name: "appraisalTitle", label: "Appraisal card title" },
    { name: "appraisalBody", label: "Appraisal card body", multiline: true },
    { name: "buyingTitle", label: "Buying card title" },
    { name: "buyingBody", label: "Buying card body", multiline: true },
    { name: "sellingTitle", label: "Selling card title" },
    { name: "sellingBody", label: "Selling card body", multiline: true },
  ],
  contact: [
    { name: "title", label: "Page title" },
    { name: "intro", label: "Intro", multiline: true },
    { name: "sectionTitle", label: "Contact info section title" },
    { name: "mobile", label: "Mobile phone" },
    { name: "office", label: "Office phone" },
    { name: "fax", label: "Fax" },
    { name: "email", label: "Email" },
    { name: "addressLine1", label: "Address line 1" },
    { name: "addressLine2", label: "Address line 2" },
    { name: "facebookUrl", label: "Facebook URL" },
    { name: "linkedinUrl", label: "LinkedIn URL" },
  ],
  footer: [
    { name: "copyright", label: "Copyright line" },
    { name: "facebookUrl", label: "Facebook URL" },
    { name: "linkedinUrl", label: "LinkedIn URL" },
  ],
};

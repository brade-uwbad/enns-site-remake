export const SITE_CONTENT_KEYS = [
  "homepage",
  "about",
  "services",
  "contact",
  "footer",
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

export function isSiteContentKey(value: string): value is SiteContentKey {
  return (SITE_CONTENT_KEYS as readonly string[]).includes(value);
}

export const SITE_CONTENT_PAGES: {
  key: SiteContentKey;
  label: string;
  description: string;
  publicPath: string;
}[] = [
  {
    key: "homepage",
    label: "Homepage",
    description: "Hero, calls to action, and services overview on the home page.",
    publicPath: "/",
  },
  {
    key: "about",
    label: "About",
    description: "Headline, bio, stats, and contact details on the about page.",
    publicPath: "/about",
  },
  {
    key: "services",
    label: "Services",
    description: "Intro and service card copy on the services page.",
    publicPath: "/services",
  },
  {
    key: "contact",
    label: "Contact",
    description: "Heading, intro, and contact information on the contact page.",
    publicPath: "/contact",
  },
  {
    key: "footer",
    label: "Footer",
    description: "Footer copyright and social links (used when the site footer is enabled).",
    publicPath: "/",
  },
];

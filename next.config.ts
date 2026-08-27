import type { NextConfig } from "next";

/**
 * Content-Security-Policy applied to every route.
 *
 * `style-src`/`img-src` are relaxed for what Next.js and the app genuinely need:
 * - `'unsafe-inline'` styles: Next injects inline `<style>` and style attributes; removing
 *   this requires a nonce-based pipeline (future hardening — see docs/security-audit.md).
 * - image hosts mirror `images.remotePatterns` below (Supabase Storage, placehold, Unsplash).
 * `frame-ancestors 'none'` blocks clickjacking (belt-and-suspenders with X-Frame-Options).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  // Next.js App Router streams inline hydration scripts (self.__next_f.push). Without a
  // nonce pipeline those require 'unsafe-inline'. Tightening to nonces is tracked as follow-up
  // hardening in docs/security-audit.md.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://placehold.co https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/about-brad-kitchener-waterloo-real-estate-agent-elmira-new-hamburg",
        destination: "/about",
        permanent: true,
      },

      {
        source: "/contact-brad-selling-my-home-kitchener-waterloo-ontario",
        destination: "/contact",
        permanent: true,
      },

      {
        source: "/real-estate-resources-kitchener-waterloo",
        destination: "/services",
        permanent: true,
      },

      {
        source: "/buy-a-house-kitchener-new-hamburg-elmira-ontario",
        destination: "/services",
        permanent: true,
      },

      {
        source: "/selling-my-home-waterloo-ontario",
        destination: "/services",
        permanent: true,
      },

      {
        source: "/reviews",
        destination: "/about",
        permanent: true,
      },

      {
        source: "/kitchenerwaterloo-real-estate-blog",
        destination: "/",
        permanent: true,
      },

      {
        source: "/search-kitchener-waterloo-homes-for-sale",
        destination: "/listings",
        permanent: true,
      },

      {
        source: "/kitchener-waterloo-houses-sale",
        destination: "/listings",
        permanent: true,
      },

      {
        source: "/kitchener-waterloo-real-estate-agent/:path*",
        destination: "/listings",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

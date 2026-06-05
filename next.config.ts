import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

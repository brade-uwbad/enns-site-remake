"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  title: string;
  featuredImageUrl: string | null;
  images: string[];
};

const FALLBACK_IMAGE = "https://placehold.co/1200x700/png?text=Listing";

export function ListingDetailGallery({ title, featuredImageUrl, images }: Props) {
  const allImages = useMemo(() => {
    // De-dupe by URL without query/hash so re-signed or transformed variants do not repeat in UI.
    const seen = new Set<string>();
    const merged = [featuredImageUrl, ...images].filter((v): v is string => Boolean(v));
    const unique: string[] = [];

    for (const url of merged) {
      const key = (() => {
        try {
          const parsed = new URL(url);
          return `${parsed.origin}${parsed.pathname}`;
        } catch {
          return url;
        }
      })();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      unique.push(url);
    }

    return unique.length ? unique : [FALLBACK_IMAGE];
  }, [featuredImageUrl, images]);

  const [index, setIndex] = useState(0);
  const main = allImages[Math.min(index, allImages.length - 1)] ?? FALLBACK_IMAGE;

  /**
   * Up to four distinct thumbnail URLs from non-primary images.
   * Primary/featured image stays hero-only unless user explicitly selects a thumb.
   */
  const thumbSlots: (string | null)[] = [0, 1, 2, 3].map((i) => allImages[i + 1] ?? null);

  return (
    <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-start">
      {/* Fixed desktop heights to match the reference composition consistently. */}
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-md bg-slate-100 md:h-[340px] md:aspect-auto">
        <Image
          src={main}
          alt={title}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          priority
          className="object-cover"
        />
        <span className="absolute left-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
            <path d="M11 8v6" />
            <path d="M8 11h6" />
          </svg>
        </span>
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-3 md:h-[340px]">
        {thumbSlots.map((src, i) =>
          src ? (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => setIndex(i + 1)}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 md:h-[164px] md:aspect-auto"
              aria-label={`Show photo ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="(min-width: 768px) 220px, 50vw"
                className="object-cover"
              />
            </button>
          ) : (
            <div
              key={`empty-${i}`}
              className="aspect-[4/3] w-full rounded-md bg-slate-100/90 md:h-[164px] md:aspect-auto"
              aria-hidden
            />
          ),
        )}
      </div>
    </div>
  );
}

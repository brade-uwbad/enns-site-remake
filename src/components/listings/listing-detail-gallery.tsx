"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  title: string;
  featuredImageUrl: string | null;
  images: string[];
};

const FALLBACK_IMAGE = "https://placehold.co/1200x700/png?text=Listing";
const THUMB_COUNT = 4;
/** Hero + four thumbnails = five visible slots; additional photos use "+N more". */
const VISIBLE_GALLERY_COUNT = 1 + THUMB_COUNT;

function imageDedupeKey(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function dedupeImageUrls(urls: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const url of urls) {
    const key = imageDedupeKey(url);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(url);
  }
  return unique;
}

/** Prefer `images[]` order; avoid counting featured twice when it matches images[0]. */
function buildGalleryImageList(featuredImageUrl: string | null, images: string[]) {
  const fromArray = images.filter(Boolean);
  if (fromArray.length === 0) {
    return featuredImageUrl ? dedupeImageUrls([featuredImageUrl]) : [];
  }
  if (!featuredImageUrl) {
    return dedupeImageUrls(fromArray);
  }
  const featuredKey = imageDedupeKey(featuredImageUrl);
  const alreadyInArray = fromArray.some((url) => imageDedupeKey(url) === featuredKey);
  if (alreadyInArray) {
    return dedupeImageUrls(fromArray);
  }
  return dedupeImageUrls([featuredImageUrl, ...fromArray]);
}

export function ListingDetailGallery({ title, featuredImageUrl, images }: Props) {
  const allImages = useMemo(() => {
    const unique = buildGalleryImageList(featuredImageUrl, images);
    return unique.length ? unique : [FALLBACK_IMAGE];
  }, [featuredImageUrl, images]);

  const [index, setIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const main = allImages[Math.min(index, allImages.length - 1)] ?? FALLBACK_IMAGE;

  const extraPhotoCount = Math.max(0, allImages.length - VISIBLE_GALLERY_COUNT);

  /**
   * Up to four thumbnail URLs after the hero (indices 1–4).
   * Photos beyond that appear via "+N more" on the last thumbnail.
   */
  const thumbSlots: (string | null)[] = Array.from({ length: THUMB_COUNT }, (_, i) => allImages[i + 1] ?? null);

  function selectPhoto(photoIndex: number) {
    setIndex(photoIndex);
    setShowAllPhotos(false);
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-start">
        {/* Fixed desktop heights to match the reference composition consistently. */}
        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-md bg-slate-100 md:h-[340px] md:aspect-auto">
          <Image
            src={main}
            alt={title}
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            unoptimized
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
          {thumbSlots.map((src, i) => {
            const isMoreTile = i === THUMB_COUNT - 1 && extraPhotoCount > 0;

            if (!src && !isMoreTile) {
              return (
                <div
                  key={`empty-${i}`}
                  className="aspect-[4/3] w-full rounded-md bg-slate-100/90 md:h-[164px] md:aspect-auto"
                  aria-hidden
                />
              );
            }

            return (
              <button
                key={`thumb-${i}`}
                type="button"
                onClick={() => (isMoreTile ? setShowAllPhotos(true) : setIndex(i + 1))}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 md:h-[164px] md:aspect-auto"
                aria-label={
                  isMoreTile ? `Show ${extraPhotoCount} more photos` : `Show photo ${i + 1}`
                }
              >
                {src ? (
                  <Image
                    src={src}
                    alt={`${title} thumbnail ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 220px, 50vw"
                    unoptimized
                    className="object-cover"
                  />
                ) : null}
                {isMoreTile ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    +{extraPhotoCount} more
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {extraPhotoCount > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowAllPhotos(true)}
            className="text-sm font-medium text-[#3A6696] underline-offset-2 hover:underline"
          >
            Show all {allImages.length} photos
          </button>
        </div>
      ) : null}

      {showAllPhotos ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="All listing photos"
          onClick={() => setShowAllPhotos(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">All photos</h2>
              <button
                type="button"
                onClick={() => setShowAllPhotos(false)}
                className="text-slate-500 hover:text-slate-800"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {allImages.map((src, photoIndex) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => selectPhoto(photoIndex)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    photoIndex === index ? "ring-2 ring-sky-600" : ""
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${title} photo ${photoIndex + 1}`}
                    fill
                    sizes="(min-width: 640px) 280px, 50vw"
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

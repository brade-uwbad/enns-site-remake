"use client";

import Image from "next/image";
import { Eye, FolderOpen, ImageIcon, Star, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const THUMB_COUNT = 4;
const VISIBLE_PREVIEW_COUNT = 1 + THUMB_COUNT;

export type EditorPhotoItem =
  | { kind: "existing"; src: string }
  | { kind: "queued"; index: number; src: string };

type Props = {
  busy: boolean;
  photos: EditorPhotoItem[];
  onAddUploadFiles: (files: FileList | null) => void;
  onRemoveQueuedPhoto: (index: number) => void;
  onRemoveExistingPhoto: (url: string) => void;
  onSetMainPhoto: (photo: EditorPhotoItem) => void;
};

export function photoKey(photo: EditorPhotoItem) {
  return photo.kind === "queued" ? `queued-${photo.index}` : photo.src;
}

export function buildEditorPhotoList(
  existingPhotos: string[],
  selectedPhotos: Array<{ file: File; previewUrl: string }>,
): EditorPhotoItem[] {
  const items: EditorPhotoItem[] = existingPhotos.map((src) => ({ kind: "existing", src }));
  selectedPhotos.forEach((item, index) => {
    items.push({ kind: "queued", index, src: item.previewUrl });
  });
  return items;
}

/** Move the chosen photo to the front of the combined list (main image). */
export function reorderPhotosToMain(
  photo: EditorPhotoItem,
  existingPhotos: string[],
  selectedPhotos: Array<{ file: File; previewUrl: string }>,
): { existingUrls: string[]; files: File[] } {
  const items = buildEditorPhotoList(existingPhotos, selectedPhotos);
  const idx = items.findIndex((p) => photoKey(p) === photoKey(photo));
  if (idx <= 0) {
    return {
      existingUrls: existingPhotos,
      files: selectedPhotos.map((p) => p.file),
    };
  }

  const reordered = [items[idx]!, ...items.filter((_, i) => i !== idx)];
  const existingUrls: string[] = [];
  const files: File[] = [];

  for (const item of reordered) {
    if (item.kind === "existing") {
      existingUrls.push(item.src);
    } else {
      files.push(selectedPhotos[item.index]!.file);
    }
  }

  return { existingUrls, files };
}

export function EditorPhotosPanel({
  busy,
  photos,
  onAddUploadFiles,
  onRemoveQueuedPhoto,
  onRemoveExistingPhoto,
  onSetMainPhoto,
}: Props) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputId = useId();

  const safePreviewIndex =
    photos.length === 0 ? 0 : Math.min(previewIndex, photos.length - 1);
  const previewPhoto = photos[safePreviewIndex];
  const previewSrcHero = previewPhoto?.src;

  const extraPhotoCount = Math.max(0, photos.length - VISIBLE_PREVIEW_COUNT);
  const thumbSlots = useMemo(
    () => Array.from({ length: THUMB_COUNT }, (_, i) => photos[i + 1] ?? null),
    [photos],
  );

  const photoOrderKey = photos.map((p) => photoKey(p)).join("|");

  useEffect(() => {
    setPreviewIndex(0);
  }, [photoOrderKey]);

  useEffect(() => {
    if (!previewSrc && !showAllPhotos) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      if (previewSrc) {
        setPreviewSrc(null);
      } else if (showAllPhotos) {
        setShowAllPhotos(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewSrc, showAllPhotos]);

  function removePhoto(photo: EditorPhotoItem) {
    if (photo.kind === "queued") {
      onRemoveQueuedPhoto(photo.index);
    } else {
      onRemoveExistingPhoto(photo.src);
    }
    if (previewIndex >= photos.length - 1) {
      setPreviewIndex(Math.max(0, previewIndex - 1));
    }
  }

  function handlePhotoUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    onAddUploadFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function PhotoHoverActions({ photo, isMain }: { photo: EditorPhotoItem; isMain: boolean }) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setPreviewSrc(photo.src)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm"
          aria-label="View photo"
        >
          <Eye className="h-4 w-4" strokeWidth={2} />
        </button>
        {!isMain ? (
          <button
            type="button"
            onClick={() => onSetMainPhoto(photo)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm"
            aria-label="Set as main photo"
          >
            <Star className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => removePhoto(photo)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm"
          aria-label="Delete photo"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    );
  }

  function MainStarButton({
    photo,
    photoIndex,
    className = "",
  }: {
    photo: EditorPhotoItem;
    photoIndex: number;
    className?: string;
  }) {
    const isMain = photoIndex === 0;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!isMain) {
            onSetMainPhoto(photo);
          }
        }}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition ${className} ${
          isMain
            ? "bg-[#3A6696] text-white"
            : "bg-white/95 text-slate-700 hover:bg-white"
        }`}
        aria-label={isMain ? "Main photo" : "Set as main photo"}
        aria-pressed={isMain}
      >
        <Star className={`h-4 w-4 ${isMain ? "fill-current" : ""}`} strokeWidth={2} />
      </button>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-start">
        <div
          className={`group relative aspect-[16/11] w-full overflow-hidden rounded-md border bg-slate-100 md:h-[280px] md:aspect-auto ${
            photos.length > 0 && safePreviewIndex === 0
              ? "border-[#3A6696] ring-2 ring-[#3A6696]/40"
              : "border-slate-200"
          }`}
        >
          {previewSrcHero ? (
            <Image
              src={previewSrcHero}
              alt="Listing photo"
              fill
              className="object-cover"
              unoptimized={previewPhoto?.kind === "existing"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-slate-400" strokeWidth={1.5} aria-hidden />
            </div>
          )}
          {previewPhoto && safePreviewIndex === 0 ? (
            <span className="absolute left-2 top-2 z-10 rounded bg-[#3A6696] px-2 py-0.5 text-xs font-medium text-white">
              Main
            </span>
          ) : null}
          {previewPhoto ? (
            <PhotoHoverActions photo={previewPhoto} isMain={safePreviewIndex === 0} />
          ) : null}
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-3 md:h-[280px]">
          {thumbSlots.map((photo, i) => {
            const isMoreTile = i === THUMB_COUNT - 1 && extraPhotoCount > 0;

            if (!photo && !isMoreTile) {
              return (
                <div
                  key={`empty-${i}`}
                  className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 md:h-[132px] md:aspect-auto"
                >
                  <ImageIcon className="h-7 w-7 text-slate-400" strokeWidth={1.5} aria-hidden />
                </div>
              );
            }

            if (isMoreTile) {
              return (
                <button
                  key="more"
                  type="button"
                  onClick={() => setShowAllPhotos(true)}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100 md:h-[132px] md:aspect-auto"
                  aria-label={`Show ${extraPhotoCount} more photos`}
                >
                  {photo ? (
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={photo.kind === "existing"}
                    />
                  ) : null}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    +{extraPhotoCount} more
                  </span>
                </button>
              );
            }

            const thumbIndex = i + 1;

            return (
              <div
                key={photoKey(photo!)}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100 md:h-[132px] md:aspect-auto"
              >
                <button
                  type="button"
                  onClick={() => setPreviewIndex(thumbIndex)}
                  className="absolute inset-0 z-0"
                  aria-label={`Preview photo ${thumbIndex + 1}`}
                />
                <Image
                  src={photo!.src}
                  alt="Listing thumbnail"
                  fill
                  className="object-cover"
                  unoptimized={photo!.kind === "existing"}
                />
                <PhotoHoverActions photo={photo!} isMain={thumbIndex === 0} />
              </div>
            );
          })}
        </div>
      </div>

      {photos.length > VISIBLE_PREVIEW_COUNT ? (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAllPhotos(true)}
            className="text-sm font-medium text-[#3A6696] underline-offset-2 hover:underline"
          >
            Show all {photos.length} photos
          </button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        id={uploadInputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handlePhotoUpload(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-slate-300 bg-white px-4 py-8 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FolderOpen className="h-6 w-6 text-slate-500" strokeWidth={1.75} aria-hidden />
        Click to upload photos
      </button>

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
              <h3 className="text-lg font-semibold text-slate-900">All photos ({photos.length})</h3>
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
              {photos.map((photo, photoIndex) => (
                <div
                  key={photoKey(photo)}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-md border bg-slate-100 ${
                    photoIndex === 0 ? "border-[#3A6696] ring-1 ring-[#3A6696]/50" : "border-slate-200"
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={`Listing photo ${photoIndex + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={photo.kind === "existing"}
                  />
                  <MainStarButton photo={photo} photoIndex={photoIndex} />
                  <div className="absolute inset-0 z-[5] flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setPreviewSrc(photo.src)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm"
                      aria-label="View photo"
                    >
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {previewSrc ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setPreviewSrc(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded bg-white px-3 py-1 text-sm font-medium text-zinc-900"
            onClick={() => setPreviewSrc(null)}
          >
            Close
          </button>
          <div
            className="relative h-[80vh] w-[90vw] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image src={previewSrc} alt="Preview" fill className="object-contain" unoptimized />
          </div>
        </div>
      ) : null}
    </>
  );
}

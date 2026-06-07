"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  amenitiesArrayFromSelections,
  type ListingAmenityLabel,
} from "@/lib/listings/listing-amenities";
import { EditorToast } from "@/components/admin/listings-editor/editor-toast";
import { AdminListingsGrid } from "@/components/admin/listings-editor/components/admin-listings-grid";
import { CreateWizard } from "@/components/admin/listings-editor/components/create-wizard";
import {
  reorderPhotosToMain,
  type EditorPhotoItem,
} from "@/components/admin/listings-editor/components/editor-photos-panel";
import { EditWorkspace } from "@/components/admin/listings-editor/components/edit-workspace";
import { adminLinkClass, adminPrimaryButtonClass, AdminChrome, AdminPageHeader } from "@/components/admin/admin-ui";
import {
  BLANK_EDITOR_STATE,
  type EditorPanel,
  type EditorState,
  type Listing,
  WIZARD_STEP_TITLES,
} from "@/components/admin/listings-editor/types";
import {
  buildListingWritePayload,
  splitList,
  toEditorState,
  toggleAmenitySelection,
} from "@/components/admin/listings-editor/utils";
import { useAdminUser } from "@/hooks/use-admin-user";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";

type ListingsEditorProps = {
  initialListings: Listing[];
  startCreate?: boolean;
  startEditId?: string;
};

function resolveInitialEditorState(
  initialListings: Listing[],
  startCreate: boolean,
  startEditId?: string,
) {
  if (startEditId) {
    const listing = initialListings.find((l) => l.id === startEditId);
    if (listing) {
      return {
        selectedId: startEditId,
        form: toEditorState(listing),
      };
    }
  }
  if (startCreate) {
    return { selectedId: "", form: BLANK_EDITOR_STATE };
  }
  return { selectedId: "", form: BLANK_EDITOR_STATE };
}

export function ListingsEditor({
  initialListings,
  startCreate = false,
  startEditId,
}: ListingsEditorProps) {
  const router = useRouter();
  const initial = resolveInitialEditorState(initialListings, startCreate, startEditId);
  const { accessToken } = useAdminUser();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [selectedId, setSelectedId] = useState<string>(initial.selectedId);
  const [form, setForm] = useState<EditorState>(initial.form);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [wizardStep, setWizardStep] = useState(0);
  const [editorPanel, setEditorPanel] = useState<EditorPanel>("menu");
  const [isCreating, setIsCreating] = useState(startCreate);

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function loadListings(): Promise<Listing[]> {
    const [activeRes, soldRes] = await Promise.all([
      fetch("/api/listings?limit=100"),
      fetch("/api/listings/sold?limit=100"),
    ]);
    const [activeData, soldData] = await Promise.all([activeRes.json(), soldRes.json()]);
    const combined = [
      ...(activeData?.data?.listings ?? []),
      ...(soldData?.data?.listings ?? []),
    ] as Listing[];
    setListings(combined);
    return combined;
  }

  const deepLinkMode = startCreate || Boolean(startEditId);
  const isEditing = Boolean(selectedId);
  const selectedPhotos = useMemo(
    () => uploadFiles.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) })),
    [uploadFiles],
  );
  const existingPhotos = splitList(form.imagesText);

  useEffect(() => {
    return () => {
      selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [selectedPhotos]);

  function chooseListing(id: string) {
    setIsCreating(false);
    setSelectedId(id);
    const listing = listings.find((l) => l.id === id);
    setForm(listing ? toEditorState(listing) : BLANK_EDITOR_STATE);
    setWizardStep(0);
    setEditorPanel("menu");
    setUploadFiles([]);
  }
  function addUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    const incoming = Array.from(files);
    setUploadFiles((prev) => [...prev, ...incoming]);
  }

  function removeQueuedUploadFile(index: number) {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(url: string) {
    const next = splitList(form.imagesText).filter((u) => u !== url);
    setField("imagesText", next.join("\n"));
  }

  function setMainPhoto(photo: EditorPhotoItem) {
    const { existingUrls, files } = reorderPhotosToMain(photo, existingPhotos, selectedPhotos);
    setField("imagesText", existingUrls.join("\n"));
    setUploadFiles(files);
  }

  function setField<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(id: ListingAmenityLabel) {
    setForm((prev) => ({
      ...prev,
      amenitySelections: toggleAmenitySelection(prev.amenitySelections, id),
    }));
  }

  function requireAccessTokenForWrite(): boolean {
    if (isSupabaseBrowserConfigured() && !accessToken) {
      setMessage("You must sign in as an admin before saving changes.");
      return false;
    }
    return true;
  }

  function authHeaders(): HeadersInit {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
  }

  function uploadHeadersForMultipart(): HeadersInit | undefined {
    if (!accessToken) {
      return undefined;
    }
    return { Authorization: `Bearer ${accessToken}` };
  }

  /**
   * Uploads selected files from the file input into Storage and appends URLs to imagesText.
   * No-op if no files chosen. Returns the merged image URL list for the save payload (state may lag otherwise).
   */
  async function uploadSelectedFilesIntoFormImages(
    existingImagesText: string,
  ): Promise<string[]> {
    if (uploadFiles.length === 0) {
      return splitList(existingImagesText);
    }
    const uploadedUrls: string[] = [];
    for (const file of uploadFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/listings/upload", {
        method: "POST",
        headers: uploadHeadersForMultipart(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? `Failed to upload ${file.name}`);
      }
      if (data?.data?.url) {
        uploadedUrls.push(data.data.url as string);
      }
    }
    const merged = [...splitList(existingImagesText), ...uploadedUrls];
    if (uploadedUrls.length > 0) {
      setField("imagesText", merged.join("\n"));
      setUploadFiles([]);
    }
    return merged;
  }

  async function createListing() {
    if (!requireAccessTokenForWrite()) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const hadPendingUpload = uploadFiles.length > 0;
      const images = await uploadSelectedFilesIntoFormImages(form.imagesText);
      const address = form.addressLine.trim();
      if (!address) {
        throw new Error("Address is required (it is used as the listing title).");
      }
      const postalCode = form.postalCode.trim();
      if (!postalCode) {
        throw new Error("Postal code is required.");
      }
      const payload = {
        ...buildListingWritePayload(form, images, {}),
        amenities: amenitiesArrayFromSelections(form.amenitySelections),
      };
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to create listing.");
      }

      setMessage(hadPendingUpload ? "Uploaded image(s); listing created." : "Listing created.");
      await loadListings();
      setIsCreating(false);
      setSelectedId("");
      setForm(BLANK_EDITOR_STATE);
      setUploadFiles([]);
      setWizardStep(0);
      setEditorPanel("menu");
      router.replace("/admin/listings");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to create listing.");
    } finally {
      setBusy(false);
    }
  }

  async function updateListing() {
    if (!selectedId) {
      setMessage("Pick a listing first.");
      return;
    }
    if (!requireAccessTokenForWrite()) {
      return false;
    }
    setBusy(true);
    setMessage("");
    try {
      const hadPendingUpload = uploadFiles.length > 0;
      const images = await uploadSelectedFilesIntoFormImages(form.imagesText);
      const address = form.addressLine.trim();
      if (!address) {
        throw new Error("Address is required (it is used as the listing title).");
      }
      const postalCode = form.postalCode.trim();
      if (!postalCode) {
        throw new Error("Postal code is required.");
      }
      const existing = listings.find((l) => l.id === selectedId);
      const payload = {
        ...buildListingWritePayload(form, images, { existing }),
        amenities: amenitiesArrayFromSelections(form.amenitySelections),
      };
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data?.error?.details === "object"
            ? JSON.stringify(data.error.details)
            : null;
        throw new Error(
          detail ? `${data?.error?.message ?? "Failed to update listing."} ${detail}` : (data?.error?.message ?? "Failed to update listing."),
        );
      }
      setMessage(hadPendingUpload ? "Uploaded image(s); listing updated." : "Listing updated.");
      const updated = data?.data?.listing as Listing | undefined;
      if (updated) {
        setListings((prev) => prev.map((l) => (l.id === selectedId ? { ...l, ...updated } : l)));
        setForm(toEditorState(updated));
      } else {
        const all = await loadListings();
        const refreshed = all.find((l) => l.id === selectedId);
        if (refreshed) {
          setForm(toEditorState(refreshed));
        }
      }
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update listing.");
    } finally {
      setBusy(false);
    }
    return false;
  }

  async function deleteListing(id: string) {
    const listing = listings.find((l) => l.id === id);
    const label = listing?.address_line || listing?.title || "this listing";
    if (!window.confirm(`Delete "${label}" permanently?`)) {
      return;
    }
    if (!requireAccessTokenForWrite()) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to delete listing.");
      }
      setMessage("Listing deleted.");
      if (selectedId === id) {
        setSelectedId("");
        setForm(BLANK_EDITOR_STATE);
      }
      await loadListings();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete listing.");
    } finally {
      setBusy(false);
    }
  }

  function resetToNew() {
    setIsCreating(true);
    setSelectedId("");
    setForm(BLANK_EDITOR_STATE);
    setUploadFiles([]);
    setWizardStep(0);
    setEditorPanel("menu");
  }

  function nextStep() {
    if (wizardStep >= WIZARD_STEP_TITLES.length - 1) {
      return;
    }
    setWizardStep((prev) => prev + 1);
  }

  function prevStep() {
    if (wizardStep <= 0) {
      return;
    }
    setWizardStep((prev) => prev - 1);
  }

  async function saveFromWizard() {
    await createListing();
  }

  async function saveEditorPanel() {
    const ok = await updateListing();
    if (ok) {
      setEditorPanel("menu");
    }
  }

  const pageTitle = startCreate
    ? "New listing"
    : startEditId
      ? "Edit listing"
      : "Admin listings";

  const listingBackId = startEditId ?? (isEditing ? selectedId : "");
  const backHref = listingBackId ? `/listings/${listingBackId}` : "/listings";
  const backLabel = listingBackId ? "← Back to listing" : "← Back to listings";
  const minimalEditChrome = deepLinkMode && isEditing;
  const isCreateWizard = isCreating && !isEditing;
  const isManageView = !isEditing && !isCreating;

  return (
    <>
      {message ? <EditorToast message={message} onDismiss={() => setMessage("")} /> : null}
      <AdminChrome maxWidth={isEditing || isCreateWizard ? "3xl" : "5xl"}>
        <div
          className={
            isEditing || isCreateWizard ? "flex min-h-0 w-full flex-1 flex-col" : "space-y-6"
          }
        >
        {!minimalEditChrome && !isCreateWizard && isManageView ? (
          <AdminPageHeader
            breadcrumb={
              <Link href="/admin/dashboard" className={adminLinkClass}>
                ← Back to dashboard
              </Link>
            }
            title="Admin listings"
            description="Create, update, and delete listings without terminal commands."
            actions={
              <button
                type="button"
                onClick={resetToNew}
                disabled={busy}
                className={`${adminPrimaryButtonClass} px-4 py-2`}
              >
                Create new listing
              </button>
            }
          />
        ) : !minimalEditChrome && !isCreateWizard ? (
          <div className="space-y-3">
            {!deepLinkMode ? (
              <Link href={backHref} className={`inline-flex text-sm ${adminLinkClass}`}>
                {backLabel}
              </Link>
            ) : null}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#140000] sm:text-4xl">{pageTitle}</h1>
            </div>
          </div>
        ) : null}

        {!deepLinkMode && isManageView ? (
          <AdminListingsGrid
            listings={listings}
            busy={busy}
            onEditListing={chooseListing}
            onDeleteListing={(id) => void deleteListing(id)}
          />
        ) : null}

        {isCreateWizard ? (
          <CreateWizard
            wizardStep={wizardStep}
            busy={busy}
            form={form}
            existingPhotos={existingPhotos}
            selectedPhotos={selectedPhotos}
            cancelHref="/admin/listings"
            onSetField={setField}
            onToggleAmenity={toggleAmenity}
            onAddUploadFiles={addUploadFiles}
            onRemoveQueuedPhoto={removeQueuedUploadFile}
            onRemoveExistingPhoto={removeExistingImage}
            onSetMainPhoto={setMainPhoto}
            onPrevStep={prevStep}
            onNextStep={nextStep}
            onPublish={saveFromWizard}
          />
        ) : isEditing ? (
          <EditWorkspace
            busy={busy}
            editorPanel={editorPanel}
            form={form}
            existingPhotos={existingPhotos}
            selectedPhotos={selectedPhotos}
            backHref={backHref}
            onSetPanel={setEditorPanel}
            onSetField={setField}
            onToggleAmenity={toggleAmenity}
            onAddUploadFiles={addUploadFiles}
            onRemoveQueuedPhoto={removeQueuedUploadFile}
            onRemoveExistingPhoto={removeExistingImage}
            onSetMainPhoto={setMainPhoto}
            onSavePanel={saveEditorPanel}
          />
        ) : null}
        </div>
      </AdminChrome>
    </>
  );
}

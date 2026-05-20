"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  amenitiesArrayFromSelections,
  type ListingAmenityLabel,
} from "@/lib/listings/listing-amenities";
import { CreateWizard } from "@/components/admin/listings-editor/components/create-wizard";
import { EditWorkspace } from "@/components/admin/listings-editor/components/edit-workspace";
import { TopControls } from "@/components/admin/listings-editor/components/top-controls";
import {
  BLANK_EDITOR_STATE,
  type EditorPanel,
  type EditorState,
  type Listing,
  WIZARD_STEP_TITLES,
} from "@/components/admin/listings-editor/types";
import {
  deriveSubtitle,
  parseFloatOrNull,
  parseIntOrNull,
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

  async function loadListings() {
    const [activeRes, soldRes] = await Promise.all([
      fetch("/api/listings?limit=100"),
      fetch("/api/listings/sold?limit=100"),
    ]);
    const [activeData, soldData] = await Promise.all([activeRes.json(), soldRes.json()]);
    setListings([...(activeData?.data?.listings ?? []), ...(soldData?.data?.listings ?? [])]);
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

  useEffect(() => {
    if (startEditId) {
      const listing = initialListings.find((l) => l.id === startEditId);
      if (listing) {
        setSelectedId(startEditId);
        setForm(toEditorState(listing));
        setWizardStep(0);
        setEditorPanel("menu");
        setUploadFiles([]);
      }
      return;
    }
    if (startCreate) {
      setSelectedId("");
      setForm(BLANK_EDITOR_STATE);
      setUploadFiles([]);
      setWizardStep(0);
      setEditorPanel("menu");
    }
  }, [startCreate, startEditId, initialListings]);

  function chooseListing(id: string) {
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
        title: address,
        subtitle: deriveSubtitle(form),
        city: form.city || null,
        province: form.province || null,
        postalCode,
        addressLine: address,
        priceDollars: form.priceDollars ? Number(form.priceDollars) : null,
        description: form.description || null,
        amenities: amenitiesArrayFromSelections(form.amenitySelections),
        images,
        status: form.status,
        beds: parseIntOrNull(form.beds),
        baths: parseFloatOrNull(form.baths),
        sqft: parseIntOrNull(form.sqft),
        propertyType: form.propertyType || null,
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
      const id = data?.data?.listing?.id as string | undefined;
      if (id) {
        chooseListing(id);
      }
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
      const payload = {
        title: address,
        subtitle: deriveSubtitle(form),
        city: form.city || null,
        province: form.province || null,
        postalCode,
        addressLine: address,
        priceDollars: form.priceDollars ? Number(form.priceDollars) : null,
        description: form.description || null,
        amenities: amenitiesArrayFromSelections(form.amenitySelections),
        images,
        status: form.status,
        beds: parseIntOrNull(form.beds),
        baths: parseFloatOrNull(form.baths),
        sqft: parseIntOrNull(form.sqft),
        propertyType: form.propertyType || null,
      };
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to update listing.");
      }
      setMessage(hadPendingUpload ? "Uploaded image(s); listing updated." : "Listing updated.");
      await loadListings();
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update listing.");
    } finally {
      setBusy(false);
    }
    return false;
  }

  async function deleteListing() {
    if (!selectedId) {
      setMessage("Pick a listing first.");
      return;
    }
    if (!requireAccessTokenForWrite()) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to delete listing.");
      }
      setMessage("Listing deleted.");
      setSelectedId("");
      setForm(BLANK_EDITOR_STATE);
      await loadListings();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete listing.");
    } finally {
      setBusy(false);
    }
  }

  async function markAsSold() {
    if (!selectedId) {
      setMessage("Pick a listing first.");
      return;
    }
    if (!requireAccessTokenForWrite()) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          status: "sold",
          soldAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to mark listing as sold.");
      }
      setMessage("Listing marked as sold.");
      await loadListings();
      setForm((prev) => ({ ...prev, status: "sold" }));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to mark listing as sold.");
    } finally {
      setBusy(false);
    }
  }

  function resetToNew() {
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 text-[#140000] sm:px-6">
        <div className="space-y-3">
          <Link
            href={backHref}
            className="inline-flex text-sm font-medium text-[#4a6d95] hover:underline"
          >
            {backLabel}
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{pageTitle}</h1>
            {!deepLinkMode ? (
              <p className="mt-2 text-sm text-zinc-600">
                Create, update, and delete listings without terminal commands.
              </p>
            ) : null}
          </div>
        </div>

        {!deepLinkMode ? (
          <TopControls
            listings={listings}
            selectedId={selectedId}
            busy={busy}
            formStatus={form.status}
            message={message}
            onChooseListing={chooseListing}
            onCreateNewListing={resetToNew}
            onDeleteListing={deleteListing}
            onMarkAsSold={markAsSold}
          />
        ) : null}

        {!isEditing ? (
          <CreateWizard
            wizardStep={wizardStep}
            busy={busy}
            form={form}
            existingPhotos={existingPhotos}
            selectedPhotos={selectedPhotos}
            onSetField={setField}
            onToggleAmenity={toggleAmenity}
            onAddUploadFiles={addUploadFiles}
            onRemoveQueuedPhoto={removeQueuedUploadFile}
            onRemoveExistingPhoto={removeExistingImage}
            onPrevStep={prevStep}
            onNextStep={nextStep}
            onPublish={saveFromWizard}
          />
        ) : (
          <EditWorkspace
            busy={busy}
            editorPanel={editorPanel}
            form={form}
            existingPhotos={existingPhotos}
            selectedPhotos={selectedPhotos}
            onSetPanel={setEditorPanel}
            onSetField={setField}
            onToggleAmenity={toggleAmenity}
            onAddUploadFiles={addUploadFiles}
            onRemoveQueuedPhoto={removeQueuedUploadFile}
            onRemoveExistingPhoto={removeExistingImage}
            onSavePanel={saveEditorPanel}
          />
        )}
      </div>
    </div>
  );
}

"use client";

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

type ListingsEditorProps = {
  initialListings: Listing[];
};

export function ListingsEditor({ initialListings }: ListingsEditorProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<EditorState>(BLANK_EDITOR_STATE);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
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

  const isEditing = Boolean(selectedId);
  const selectedPhotos = useMemo(
    () => Array.from(uploadFiles ?? []).map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) })),
    [uploadFiles],
  );
  const existingPhotos = splitList(form.imagesText);

  useEffect(() => {
    return () => {
      selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [selectedPhotos]);

  function chooseListing(id: string) {
    setSelectedId(id);
    const listing = listings.find((l) => l.id === id);
    setForm(listing ? toEditorState(listing) : BLANK_EDITOR_STATE);
    setWizardStep(0);
    setEditorPanel("menu");
    setUploadFiles(null);
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

  function authHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  function uploadHeadersForMultipart() {
    return undefined;
  }

  /**
   * Uploads selected files from the file input into Storage and appends URLs to imagesText.
   * No-op if no files chosen. Returns the merged image URL list for the save payload (state may lag otherwise).
   */
  async function uploadSelectedFilesIntoFormImages(
    existingImagesText: string,
  ): Promise<string[]> {
    if (!uploadFiles || uploadFiles.length === 0) {
      return splitList(existingImagesText);
    }
    const uploadedUrls: string[] = [];
    for (const file of Array.from(uploadFiles)) {
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
      setUploadFiles(null);
    }
    return merged;
  }

  async function createListing() {
    setBusy(true);
    setMessage("");
    try {
      const hadPendingUpload = Boolean(uploadFiles?.length);
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
    setBusy(true);
    setMessage("");
    try {
      const hadPendingUpload = Boolean(uploadFiles?.length);
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
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "DELETE",
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
    setUploadFiles(null);
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 text-[#140000] sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Admin listings</h1>
        <p className="text-sm text-zinc-600">
          Create, update, and delete listings without terminal commands.
        </p>

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

        {!isEditing ? (
          <CreateWizard
            wizardStep={wizardStep}
            busy={busy}
            form={form}
            existingPhotos={existingPhotos}
            selectedPhotos={selectedPhotos}
            onSetField={setField}
            onToggleAmenity={toggleAmenity}
            onSetUploadFiles={setUploadFiles}
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
            onSetUploadFiles={setUploadFiles}
            onBackToCreate={resetToNew}
            onSavePanel={saveEditorPanel}
          />
        )}
      </div>
    </div>
  );
}

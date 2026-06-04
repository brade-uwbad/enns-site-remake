import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { AmenityPickerGrid } from "@/components/admin/listings-editor/components/amenity-picker-grid";
import {
  buildEditorPhotoList,
  EditorPhotosPanel,
  type EditorPhotoItem,
} from "@/components/admin/listings-editor/components/editor-photos-panel";
import { ListingDetailsFields } from "@/components/admin/listings-editor/components/listing-details-fields";
import { PropertyTypePickerGrid } from "@/components/admin/listings-editor/components/property-type-picker-grid";
import { LISTING_AMENITIES } from "@/lib/listings/listing-amenities";
import {
  WIZARD_STEP_TITLES,
  type EditorState,
} from "@/components/admin/listings-editor/types";

const WIZARD_STEP_COUNT = WIZARD_STEP_TITLES.length;

const WIZARD_STEP_COPY: { title: string; subtitle: string }[] = [
  {
    title: "Select a property type that best describes your listing",
    subtitle: "Select an option from below",
  },
  {
    title: "Add your listing details",
    subtitle: "",
  },
  {
    title: "Add photos to your listing",
    subtitle: "Upload images for the property",
  },
  {
    title: "Select listing amenities",
    subtitle: "Choose everything included with the property",
  },
];

type Props = {
  wizardStep: number;
  busy: boolean;
  form: EditorState;
  existingPhotos: string[];
  selectedPhotos: Array<{ file: File; previewUrl: string }>;
  cancelHref: string;
  onSetField: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  onToggleAmenity: (id: (typeof LISTING_AMENITIES)[number]["id"]) => void;
  onAddUploadFiles: (files: FileList | null) => void;
  onRemoveQueuedPhoto: (index: number) => void;
  onRemoveExistingPhoto: (url: string) => void;
  onSetMainPhoto: (photo: EditorPhotoItem) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onPublish: () => Promise<void>;
};

function CreateWizardShell({
  wizardStep,
  busy,
  cancelHref,
  nextDisabled,
  onPrevStep,
  onNextStep,
  onPublish,
  children,
}: {
  wizardStep: number;
  busy: boolean;
  cancelHref: string;
  nextDisabled?: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onPublish: () => void;
  children: ReactNode;
}) {
  const copy = WIZARD_STEP_COPY[wizardStep] ?? WIZARD_STEP_COPY[0];
  const onFirstStep = wizardStep === 0;
  const onLastStep = wizardStep === WIZARD_STEP_COUNT - 1;

  return (
    <section className="mx-auto flex h-[calc(100dvh-var(--site-header-offset)-3rem)] w-full min-h-0 max-w-3xl flex-col px-2 sm:h-[calc(100dvh-9rem)] sm:px-0">
      <div className="shrink-0">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          {copy.title}
        </h2>
        {copy.subtitle ? (
          <p className="mt-3 text-center text-sm text-slate-600">{copy.subtitle}</p>
        ) : null}
      </div>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto">{children}</div>

      <div className="shrink-0 space-y-3 pb-6 pt-8">
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          {onFirstStep ? (
            <Link
              href={cancelHref}
              className="px-1 py-2 text-sm text-slate-500 underline underline-offset-2 hover:text-slate-800"
            >
              Back
            </Link>
          ) : (
            <button
              type="button"
              onClick={onPrevStep}
              disabled={busy}
              className="px-1 py-2 text-sm text-slate-500 underline underline-offset-2 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
          )}
          {onLastStep ? (
            <button
              type="button"
              onClick={onPublish}
              disabled={busy}
              className="rounded-md bg-[#3A6696] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#32587f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving..." : "Publish"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNextStep}
              disabled={busy || nextDisabled}
              className="rounded-md bg-[#3A6696] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#32587f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {WIZARD_STEP_TITLES.map((label, i) => (
            <div
              key={label}
              className={`h-1.5 ${i <= wizardStep ? "bg-[#3A6696]" : "bg-slate-200"}`}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CreateWizard(props: Props) {
  const {
    wizardStep,
    busy,
    form,
    existingPhotos,
    selectedPhotos,
    cancelHref,
    onSetField,
    onToggleAmenity,
    onAddUploadFiles,
    onRemoveQueuedPhoto,
    onRemoveExistingPhoto,
    onSetMainPhoto,
    onPrevStep,
    onNextStep,
    onPublish,
  } = props;

  const editorPhotos = useMemo(
    () => buildEditorPhotoList(existingPhotos, selectedPhotos),
    [existingPhotos, selectedPhotos],
  );

  return (
    <CreateWizardShell
      wizardStep={wizardStep}
      busy={busy}
      cancelHref={cancelHref}
      nextDisabled={wizardStep === 0 && !form.propertyType}
      onPrevStep={onPrevStep}
      onNextStep={onNextStep}
      onPublish={() => void onPublish()}
    >
      {wizardStep === 0 ? (
        <PropertyTypePickerGrid
          value={form.propertyType}
          onChange={(type) => onSetField("propertyType", type)}
        />
      ) : null}

      {wizardStep === 1 ? <ListingDetailsFields form={form} onSetField={onSetField} /> : null}

      {wizardStep === 2 ? (
        <EditorPhotosPanel
          busy={busy}
          photos={editorPhotos}
          onAddUploadFiles={onAddUploadFiles}
          onRemoveQueuedPhoto={onRemoveQueuedPhoto}
          onRemoveExistingPhoto={onRemoveExistingPhoto}
          onSetMainPhoto={onSetMainPhoto}
        />
      ) : null}

      {wizardStep === 3 ? (
        <AmenityPickerGrid selections={form.amenitySelections} onToggle={onToggleAmenity} />
      ) : null}
    </CreateWizardShell>
  );
}

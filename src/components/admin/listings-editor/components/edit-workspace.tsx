import Link from "next/link";
import { CircleDollarSign, ImageIcon, List } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import {
  buildEditorPhotoList,
  EditorPhotosPanel,
  type EditorPhotoItem,
} from "@/components/admin/listings-editor/components/editor-photos-panel";
import { AmenityPickerGrid } from "@/components/admin/listings-editor/components/amenity-picker-grid";
import { ListingDetailsFields } from "@/components/admin/listings-editor/components/listing-details-fields";
import { LISTING_AMENITIES } from "@/lib/listings/listing-amenities";
import {
  type EditorPanel,
  type EditorState,
} from "@/components/admin/listings-editor/types";

type Props = {
  busy: boolean;
  editorPanel: EditorPanel;
  form: EditorState;
  existingPhotos: string[];
  selectedPhotos: Array<{ file: File; previewUrl: string }>;
  backHref?: string;
  onSetPanel: (panel: EditorPanel) => void;
  onSetField: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  onToggleAmenity: (id: (typeof LISTING_AMENITIES)[number]["id"]) => void;
  onAddUploadFiles: (files: FileList | null) => void;
  onRemoveQueuedPhoto: (index: number) => void;
  onRemoveExistingPhoto: (url: string) => void;
  onSetMainPhoto: (photo: EditorPhotoItem) => void;
  onSavePanel: () => Promise<void>;
};

const MENU_SECTIONS: {
  panel: Exclude<EditorPanel, "menu">;
  label: string;
  description: string;
  Icon: typeof ImageIcon;
}[] = [
  {
    panel: "photos",
    label: "Photos",
    description: "Add or edit images for the listing",
    Icon: ImageIcon,
  },
  {
    panel: "details",
    label: "Details",
    description: "Edit the listing name, address, description, and price",
    Icon: CircleDollarSign,
  },
  {
    panel: "amenities",
    label: "Amenities",
    description: "Let clients know what's included with the listing",
    Icon: List,
  },
];

/** All listing editor screens share one width so Back/Done stay aligned. */
const EDITOR_CONTENT_MAX_WIDTH = "max-w-3xl";

/** Fixed viewport band: scrollable body + footer pinned to the bottom. */
const EDITOR_PAGE_SHELL = `mx-auto flex h-[calc(100dvh-var(--site-header-offset)-3rem)] w-full min-h-0 flex-col sm:h-[calc(100dvh-9rem)] ${EDITOR_CONTENT_MAX_WIDTH}`;

const EDITOR_TITLE_CLASS =
  "text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl";

function EditorPageShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className={EDITOR_PAGE_SHELL}>
      <h2 className={`shrink-0 ${EDITOR_TITLE_CLASS}`}>{title}</h2>
      <div className="mt-8 min-h-0 flex-1 overflow-y-auto">{children}</div>
      <div className="flex shrink-0 flex-col-reverse gap-4 pb-6 pt-8 sm:flex-row sm:items-center sm:justify-between sm:pb-8 sm:pt-12">
        {footer}
      </div>
    </div>
  );
}

export function EditWorkspace(props: Props) {
  const {
    busy,
    editorPanel,
    form,
    existingPhotos,
    selectedPhotos,
    backHref,
    onSetPanel,
    onSetField,
    onToggleAmenity,
    onAddUploadFiles,
    onRemoveQueuedPhoto,
    onRemoveExistingPhoto,
    onSetMainPhoto,
    onSavePanel,
  } = props;
  const onMenu = editorPanel === "menu";

  const editorPhotos = useMemo(
    () => buildEditorPhotoList(existingPhotos, selectedPhotos),
    [existingPhotos, selectedPhotos],
  );

  const backControl =
    onMenu && backHref ? (
      <Link href={backHref} className="px-1 py-2 text-sm text-slate-500 hover:text-slate-800">
        Back
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => onSetPanel("menu")}
        disabled={busy || onMenu}
        className="px-1 py-2 text-sm text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Back
      </button>
    );

  const doneControl =
    onMenu && backHref ? (
      <Link
        href={backHref}
        className="w-full rounded-md bg-[#3A6696] px-6 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#32587f] sm:w-auto"
      >
        Done
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => {
          if (!onMenu) {
            void onSavePanel();
          }
        }}
        disabled={busy || onMenu}
        className="w-full rounded-md bg-[#3A6696] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#32587f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Saving..." : "Done"}
      </button>
    );

  const subpageFooter = (
    <>
      {backControl}
      {doneControl}
    </>
  );

  const panelTitle =
    editorPanel === "photos"
      ? "Editing listing photos"
      : editorPanel === "details"
        ? "Edit listing details"
        : editorPanel === "amenities"
          ? "Edit listing amenities"
          : "Listing Editor";

  const panelBody =
    editorPanel === "menu" ? (
      <div className="space-y-5">
        {MENU_SECTIONS.map(({ panel, label, description, Icon }) => (
          <button
            key={panel}
            type="button"
            onClick={() => onSetPanel(panel)}
            className="w-full rounded-lg border border-slate-300 bg-white p-5 text-left transition hover:border-slate-400"
          >
            <p className="text-base font-semibold text-slate-900">{label}</p>
            <div className="mt-3 flex items-center gap-3 rounded-md bg-slate-100 px-4 py-3">
              <Icon className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={1.75} aria-hidden />
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          </button>
        ))}
      </div>
    ) : editorPanel === "photos" ? (
      <EditorPhotosPanel
        busy={busy}
        photos={editorPhotos}
        onAddUploadFiles={onAddUploadFiles}
        onRemoveQueuedPhoto={onRemoveQueuedPhoto}
        onRemoveExistingPhoto={onRemoveExistingPhoto}
        onSetMainPhoto={onSetMainPhoto}
      />
    ) : editorPanel === "details" ? (
      <ListingDetailsFields form={form} onSetField={onSetField} />
    ) : (
      <AmenityPickerGrid selections={form.amenitySelections} onToggle={onToggleAmenity} />
    );

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <EditorPageShell title={panelTitle} footer={subpageFooter}>
        {panelBody}
      </EditorPageShell>
    </section>
  );
}

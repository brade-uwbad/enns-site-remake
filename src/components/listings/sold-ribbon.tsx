/**
 * Red "SOLD" ribbon draped over the top-left corner of an image.
 * Render inside a `relative` container. The band is centered on the corner's
 * diagonal so the text sits in the middle of the visible ribbon.
 */
export function SoldRibbon() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-20 h-24 w-24 overflow-hidden">
      <span className="absolute left-[-46px] top-[22px] w-40 -rotate-45 bg-red-600 py-1 text-center text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
        Sold
      </span>
    </div>
  );
}

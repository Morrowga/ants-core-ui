/** Short black underline shown beneath a section's title, with a
 * looping "typing" dots indicator at its end -- appears one dot at a
 * time (. -> .. -> ...), then resets to nothing and repeats.
 */

export function SectionDivider() {
  return (
    <div className="mt-1 flex h-4 flex-nowrap items-center gap-0.5">
      {/* Short on purpose -- just a little wider than typical title
          text, not a full-width rule. Adjust w-16 directly if a
          specific title needs a different length. */}
      <div className="h-0.5 w-16 shrink-0 bg-black" />
    </div>
  );
}
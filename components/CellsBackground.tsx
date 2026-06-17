/** Aurora backdrop — navy radial base with slowly drifting red/blue/violet
 *  glow blobs. Pure CSS, so it stays light on mobile. */
export default function CellsBackground() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="aurora-blobs">
        <span className="blob blob-red" />
        <span className="blob blob-blue" />
        <span className="blob blob-violet" />
        <span className="blob blob-navy" />
      </div>
    </div>
  );
}

const CELLS: Array<[number, string, string, number, number]> = [
  [190, "-6%", "4%", 4.2, 0],
  [270, "26%", "0%", 5.8, 1],
  [140, "70%", "8%", 3.6, 0.5],
  [210, "6%", "36%", 6.2, 2],
  [115, "60%", "26%", 4, 1.5],
  [330, "-12%", "54%", 7.2, 0.8],
  [175, "64%", "50%", 5, 2.5],
  [245, "24%", "66%", 4.6, 1.2],
  [92, "83%", "70%", 3.4, 0.3],
  [162, "44%", "80%", 5.4, 1.8],
];

/** Animated cellular backdrop, pure CSS so it stays light on mobile. */
export default function CellsBackground() {
  return (
    <div className="bg" aria-hidden="true">
      {CELLS.map(([size, left, top, dur, delay], i) => (
        <span
          key={i}
          className="cell"
          style={{
            width: size,
            height: size,
            left,
            top,
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

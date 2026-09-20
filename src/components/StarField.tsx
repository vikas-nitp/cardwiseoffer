// 12 background stars + 6 prominent feature stars
const STARS = Array.from({ length: 12 }, (_, i) => {
  const s = (i + 1) * 7919;
  return {
    id: i,
    x: ((s * 1337) % 10000) / 100,
    y: ((s * 9001) % 10000) / 100,
    size: (((s * 3) % 20) + 5) / 10,   // 0.5 – 2.5 px
    delay: ((s * 13) % 9000) / 1000,
    cls: ["star-a", "star-b", "star-c"][i % 3],
  };
});

const FEATURE_STARS = [
  { id: 100, x: 8,  y: 18, size: 2.8 },
  { id: 101, x: 91, y: 11, size: 2.5 },
  { id: 102, x: 23, y: 72, size: 3.0 },
  { id: 103, x: 77, y: 61, size: 2.6 },
  { id: 104, x: 55, y: 32, size: 2.4 },
  { id: 105, x: 42, y: 88, size: 2.7 },
];

const StarField = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {STARS.map(({ id, x, y, size, delay, cls }) => (
      <span
        key={id}
        className={cls}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: "hsl(var(--star-dim-color))",
          animationDelay: `${delay}s`,
        }}
      />
    ))}
    {FEATURE_STARS.map(({ id, x, y, size }) => (
      <span
        key={id}
        className="star-d"
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: "hsl(var(--star-bright-color))",
          boxShadow: `0 0 ${size * 2}px hsl(var(--star-bright-color) / 0.5)`,
          animationDelay: `${(id * 1.3) % 5}s`,
        }}
      />
    ))}
  </div>
);

export default StarField;

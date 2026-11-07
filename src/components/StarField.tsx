// 8 very subtle background dots — purely atmospheric, not decorative focal points
const STARS = Array.from({ length: 8 }, (_, i) => {
  const s = (i + 1) * 7919;
  return {
    id: i,
    x: ((s * 1337) % 10000) / 100,
    y: ((s * 9001) % 10000) / 100,
    size: (((s * 3) % 12) + 4) / 10,   // 0.4 – 1.6 px — tiny
    delay: ((s * 13) % 9000) / 1000,
    cls: ["star-a", "star-b", "star-c"][i % 3],
  };
});

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
          background: "hsl(var(--star-dim-color) / 0.45)",
          animationDelay: `${delay}s`,
        }}
      />
    ))}
  </div>
);

export default StarField;
